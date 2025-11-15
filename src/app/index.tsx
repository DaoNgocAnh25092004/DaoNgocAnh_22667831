import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  initDatabase,
  seedSampleData,
  getAllGroceryItems,
  GroceryItem,
} from "../db";

export default function Page() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
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

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <View className="bg-white border border-gray-200 rounded-lg p-4 mb-3 mx-4">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text
            className={`text-lg font-semibold ${
              item.bought ? "text-gray-400 line-through" : "text-gray-800"
            }`}
          >
            {item.name}
          </Text>
          {item.category && (
            <Text className="text-sm text-gray-500 mt-1">{item.category}</Text>
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
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-6xl mb-4">🛒</Text>
      <Text className="text-gray-600 text-lg text-center">
        Danh sách trống, thêm món cần mua nhé!
      </Text>
    </View>
  );

  return (
    <View className="flex flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Grocery List</Text>
        <Text className="text-sm text-gray-600 mt-1">
          {items.length > 0
            ? `${items.length} món trong danh sách`
            : "Chưa có món nào"}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}
