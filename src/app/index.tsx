import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { initDatabase } from "../db";

export default function Page() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        setIsDbReady(true);
        console.log("Database setup complete");
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    setupDatabase();
  }, []);

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

  return (
    <View className="flex flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800">Grocery List</Text>
        <Text className="text-sm text-green-600 mt-2">
          ✓ Database connected successfully
        </Text>
      </View>
    </View>
  );
}
