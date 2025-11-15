import React, { useState, useMemo } from "react";
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
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGroceryItems } from "../hooks/useGroceryItems";
import type { GroceryItem } from "../db";

export default function Page() {
  const {
    isDbReady,
    error,
    items,
    loading,
    importing,
    refreshing,
    addItem,
    updateItem,
    deleteItem,
    toggleBought,
    importFromAPI,
    refreshItems,
  } = useGroceryItems();

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

  const handleAddItem = async () => {
    if (!formData.name.trim()) {
      setFormError("Tên món không được để trống!");
      Alert.alert("Lỗi", "Vui lòng nhập tên món cần mua");
      return;
    }

    const result = await addItem(
      formData.name.trim(),
      formData.quantity,
      formData.category.trim()
    );

    if (result.success) {
      setFormData({ name: "", quantity: "1", category: "" });
      setFormError("");
      setModalVisible(false);
      Alert.alert("Thành công", "Đã thêm món mới vào danh sách!");
    } else {
      Alert.alert(
        "Lỗi",
        result.error || "Không thể thêm món. Vui lòng thử lại."
      );
    }
  };

  const handleCancelModal = () => {
    setFormData({ name: "", quantity: "1", category: "" });
    setFormError("");
    setModalVisible(false);
  };

  const handleToggleBought = async (item: GroceryItem) => {
    const result = await toggleBought(item.id);
    if (!result.success) {
      Alert.alert("Lỗi", result.error || "Không thể cập nhật trạng thái.");
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

    if (!formData.name.trim()) {
      setFormError("Tên món không được để trống!");
      Alert.alert("Lỗi", "Vui lòng nhập tên món cần mua");
      return;
    }

    const result = await updateItem(
      editingItem.id,
      formData.name.trim(),
      formData.quantity,
      formData.category.trim()
    );

    if (result.success) {
      setFormData({ name: "", quantity: "1", category: "" });
      setFormError("");
      setEditModalVisible(false);
      setEditingItem(null);
      Alert.alert("Thành công", "Đã cập nhật món!");
    } else {
      Alert.alert("Lỗi", result.error || "Không thể cập nhật món.");
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
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const result = await deleteItem(item.id);
            if (result.success) {
              Alert.alert("Thành công", "Đã xóa món khỏi danh sách!");
            } else {
              Alert.alert("Lỗi", result.error || "Không thể xóa món.");
            }
          },
        },
      ]
    );
  };

  const handleImportFromAPI = async () => {
    const result = await importFromAPI();

    if (result.success) {
      Alert.alert(
        "Import thành công",
        `Đã import ${result.imported} món mới.\n${result.skipped} món bị bỏ qua (trùng lặp).`
      );
    } else {
      Alert.alert("Lỗi", result.error || "Không thể import từ API.");
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
      <View className="bg-indigo-50 rounded-full w-32 h-32 items-center justify-center mb-6">
        <Text className="text-7xl">🛒</Text>
      </View>
      <Text className="text-gray-800 text-2xl font-bold text-center mb-2">
        {searchQuery.trim() ? "Không tìm thấy" : "Danh sách trống"}
      </Text>
      <Text className="text-gray-500 text-base text-center mb-6 px-4">
        {searchQuery.trim()
          ? `Không có món nào khớp với "${searchQuery}"`
          : "Bắt đầu thêm các món bạn cần mua vào danh sách nhé!"}
      </Text>
      {!searchQuery.trim() && (
        <View className="bg-white border border-gray-200 rounded-lg p-4 mx-4">
          <Text className="text-gray-600 text-sm text-center mb-2">
            💡 <Text className="font-semibold">Mẹo:</Text>
          </Text>
          <Text className="text-gray-600 text-sm text-center">
            • Nhấn nút <Text className="font-bold">+</Text> để thêm món mới
            {"\n"}• Kéo xuống để làm mới danh sách{"\n"}• Nhấn{" "}
            <Text className="font-bold">📥 Import</Text> để lấy dữ liệu mẫu
          </Text>
        </View>
      )}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshItems}
              colors={["#4f46e5"]}
              tintColor="#4f46e5"
              title="Đang tải..."
              titleColor="#6b7280"
            />
          }
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}

      {/* Import từ API Button */}
      <TouchableOpacity
        className={`absolute bottom-24 right-6 px-4 py-3 rounded-full items-center justify-center shadow-lg ${
          importing || loading ? "bg-blue-400" : "bg-blue-600"
        }`}
        onPress={handleImportFromAPI}
        activeOpacity={0.8}
        disabled={importing || loading}
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
        className={`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center shadow-lg ${
          loading || importing ? "bg-gray-400" : "bg-black"
        }`}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        disabled={loading || importing}
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
