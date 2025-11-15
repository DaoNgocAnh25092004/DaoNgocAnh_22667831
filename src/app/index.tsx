import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  initDatabase,
  seedSampleData,
  getAllGroceryItems,
  insertGroceryItem,
  toggleBoughtStatus,
  updateGroceryItem,
  deleteGroceryItem,
  importItemsFromAPI,
  GroceryItem,
} from "../db";

export default function Page() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "1",
    category: "",
  });
  const [formError, setFormError] = useState("");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        await seedSampleData();
        setIsDbReady(true);
        console.log("Database setup complete");
        await loadItems();
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    setupDatabase();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getAllGroceryItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    // Validate name is required
    if (!formData.name.trim()) {
      setFormError("Tên món không được để trống!");
      Alert.alert("Lỗi", "Vui lòng nhập tên món cần mua");
      return;
    }

    try {
      const quantity = parseInt(formData.quantity) || 1;
      const category = formData.category.trim() || null;

      await insertGroceryItem(formData.name.trim(), quantity, category);

      // Reset form và đóng modal
      setFormData({ name: "", quantity: "1", category: "" });
      setFormError("");
      setModalVisible(false);

      // Reload danh sách
      await loadItems();

      Alert.alert("Thành công", "Đã thêm món mới vào danh sách!");
    } catch (err) {
      console.error("Failed to add item:", err);
      Alert.alert("Lỗi", "Không thể thêm món. Vui lòng thử lại.");
    }
  };

  const handleCancelModal = () => {
    setFormData({ name: "", quantity: "1", category: "" });
    setFormError("");
    setModalVisible(false);
  };

  const handleToggleBought = async (item: GroceryItem) => {
    try {
      await toggleBoughtStatus(item.id, item.bought);
      // Reload danh sách để cập nhật UI
      await loadItems();
    } catch (err) {
      console.error("Failed to toggle bought status:", err);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  const handleLongPress = (item: GroceryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      category: item.category || "",
    });
    setEditModalVisible(true);
  };

  const handleEditItem = async () => {
    if (!editingItem) return;

    // Validate name is required
    if (!formData.name.trim()) {
      setFormError("Tên món không được để trống!");
      Alert.alert("Lỗi", "Vui lòng nhập tên món cần mua");
      return;
    }

    try {
      const quantity = parseInt(formData.quantity) || 1;
      const category = formData.category.trim() || null;

      await updateGroceryItem(
        editingItem.id,
        formData.name.trim(),
        quantity,
        category
      );

      // Reset form và đóng modal
      setFormData({ name: "", quantity: "1", category: "" });
      setFormError("");
      setEditModalVisible(false);
      setEditingItem(null);

      // Reload danh sách
      await loadItems();

      Alert.alert("Thành công", "Đã cập nhật món!");
    } catch (err) {
      console.error("Failed to edit item:", err);
      Alert.alert("Lỗi", "Không thể cập nhật món. Vui lòng thử lại.");
    }
  };

  const handleCancelEditModal = () => {
    setFormData({ name: "", quantity: "1", category: "" });
    setFormError("");
    setEditModalVisible(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (item: GroceryItem) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa món "${item.name}" không?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGroceryItem(item.id);
              await loadItems();
              Alert.alert("Thành công", "Đã xóa món khỏi danh sách!");
            } catch (err) {
              console.error("Failed to delete item:", err);
              Alert.alert("Lỗi", "Không thể xóa món. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };

  const handleImportFromAPI = async () => {
    try {
      setImporting(true);

      // API mẫu - có thể thay đổi endpoint
      const API_URL = "https://jsonplaceholder.typicode.com/todos?_limit=5";

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Map API data to grocery items format
      const apiItems = data.map((todo: any) => ({
        name: todo.title,
        quantity: 1,
        category: "Từ API",
        completed: todo.completed,
      }));

      // Import vào database với merge logic
      const result = await importItemsFromAPI(apiItems);

      // Reload danh sách
      await loadItems();

      // Hiển thị kết quả
      Alert.alert(
        "Import thành công",
        `Đã import ${result.imported} món mới.\n${result.skipped} món bị bỏ qua (trùng lặp).`
      );
    } catch (err) {
      console.error("Failed to import from API:", err);
      Alert.alert(
        "Lỗi",
        `Không thể import từ API.\n${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setImporting(false);
    }
  };

  // Filter items based on search query using useMemo for optimization
  // Must be called before any conditional returns (Rules of Hooks)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const categoryMatch =
        item.category?.toLowerCase().includes(query) || false;
      return nameMatch || categoryMatch;
    });
  }, [items, searchQuery]);

  if (error) {
    return (
      <View
        className="flex flex-1 items-center justify-center bg-red-50"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-red-600 text-lg font-bold mb-2">
          Database Error
        </Text>
        <Text className="text-red-500 px-4 text-center">{error}</Text>
      </View>
    );
  }

  if (!isDbReady) {
    return (
      <View
        className="flex flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600">Initializing database...</Text>
      </View>
    );
  }

  // Render item component
  const renderItem = ({ item }: { item: GroceryItem }) => (
    <View className="bg-white border border-gray-200 rounded-lg mb-3 mx-4 overflow-hidden">
      <TouchableOpacity
        className="p-4"
        onPress={() => handleToggleBought(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text
              className={`text-lg font-semibold ${
                item.bought ? "text-gray-400 line-through" : "text-gray-800"
              }`}
            >
              {item.name}
            </Text>
            {item.category && (
              <Text className="text-sm text-gray-500 mt-1">
                {item.category}
              </Text>
            )}
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              item.bought ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                item.bought ? "text-green-700" : "text-blue-700"
              }`}
            >
              {item.bought ? "✓ Đã mua" : `SL: ${item.quantity}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Delete Button */}
      <View className="border-t border-gray-200">
        <TouchableOpacity
          className="py-2 px-4 bg-red-50 active:bg-red-100"
          onPress={() => handleDeleteItem(item)}
          activeOpacity={0.7}
        >
          <Text className="text-red-600 text-center text-sm font-semibold">
            🗑️ Xóa món này
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-6xl mb-4">🛒</Text>
      <Text className="text-gray-600 text-lg text-center">
        {searchQuery.trim()
          ? `Không tìm thấy món nào với "${searchQuery}"`
          : "Danh sách trống, thêm món cần mua nhé!"}
      </Text>
    </View>
  );

  return (
    <View className="flex flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="bg-white border-b border-gray-200">
        <View className="p-4 pb-2">
          <Text className="text-2xl font-bold text-gray-800">Grocery List</Text>
          <Text className="text-sm text-gray-600 mt-1">
            {filteredItems.length > 0
              ? `${filteredItems.length} món${
                  searchQuery.trim() ? " được tìm thấy" : " trong danh sách"
                }`
              : "Chưa có món nào"}
          </Text>
        </View>

        {/* Search Input */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Text className="text-gray-400 text-lg mr-2">🔍</Text>
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Tìm kiếm theo tên hoặc danh mục..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text className="text-gray-400 text-lg ml-2">✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={renderEmptyState}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}

      {/* Import từ API Button */}
      <TouchableOpacity
        className="absolute bottom-24 right-6 bg-blue-600 px-4 py-3 rounded-full items-center justify-center shadow-lg"
        onPress={handleImportFromAPI}
        activeOpacity={0.8}
        disabled={importing}
      >
        {importing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View className="flex-row items-center">
            <Text className="text-white text-sm font-bold mr-1">📥</Text>
            <Text className="text-white text-sm font-bold">Import từ API</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-black w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>

      {/* Modal thêm món mới */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View
              className="bg-white rounded-t-3xl p-6"
              style={{ paddingBottom: insets.bottom + 24 }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-800">
                  Thêm món mới
                </Text>
                <TouchableOpacity onPress={handleCancelModal}>
                  <Text className="text-gray-500 text-2xl">✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Tên món - Bắt buộc */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Tên món <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="Ví dụ: Cà chua"
                    value={formData.name}
                    onChangeText={(text) => {
                      setFormData({ ...formData, name: text });
                      setFormError("");
                    }}
                    autoFocus
                  />
                  {formError && (
                    <Text className="text-red-500 text-sm mt-1">
                      {formError}
                    </Text>
                  )}
                </View>

                {/* Số lượng */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Số lượng
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="1"
                    value={formData.quantity}
                    onChangeText={(text) =>
                      setFormData({ ...formData, quantity: text })
                    }
                    keyboardType="numeric"
                  />
                </View>

                {/* Danh mục */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Danh mục (tùy chọn)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="Ví dụ: Rau củ"
                    value={formData.category}
                    onChangeText={(text) =>
                      setFormData({ ...formData, category: text })
                    }
                  />
                </View>

                {/* Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-gray-200 py-3 rounded-lg"
                    onPress={handleCancelModal}
                  >
                    <Text className="text-center text-gray-700 font-semibold text-base">
                      Hủy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-black py-3 rounded-lg"
                    onPress={handleAddItem}
                  >
                    <Text className="text-center text-white font-semibold text-base">
                      Lưu
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal sửa món */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View
              className="bg-white rounded-t-3xl p-6"
              style={{ paddingBottom: insets.bottom + 24 }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-800">
                  Sửa món
                </Text>
                <TouchableOpacity onPress={handleCancelEditModal}>
                  <Text className="text-gray-500 text-2xl">✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Tên món - Bắt buộc */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Tên món <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="Ví dụ: Cà chua"
                    value={formData.name}
                    onChangeText={(text) => {
                      setFormData({ ...formData, name: text });
                      setFormError("");
                    }}
                    autoFocus
                  />
                  {formError && (
                    <Text className="text-red-500 text-sm mt-1">
                      {formError}
                    </Text>
                  )}
                </View>

                {/* Số lượng */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Số lượng
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="1"
                    value={formData.quantity}
                    onChangeText={(text) =>
                      setFormData({ ...formData, quantity: text })
                    }
                    keyboardType="numeric"
                  />
                </View>

                {/* Danh mục */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Danh mục (tùy chọn)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="Ví dụ: Rau củ"
                    value={formData.category}
                    onChangeText={(text) =>
                      setFormData({ ...formData, category: text })
                    }
                  />
                </View>

                {/* Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-gray-200 py-3 rounded-lg"
                    onPress={handleCancelEditModal}
                  >
                    <Text className="text-center text-gray-700 font-semibold text-base">
                      Hủy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-black py-3 rounded-lg"
                    onPress={handleEditItem}
                  >
                    <Text className="text-center text-white font-semibold text-base">
                      Cập nhật
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
