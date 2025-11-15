import { useState, useEffect, useCallback } from "react";
import * as db from "../db";
import type { GroceryItem } from "../db";

export const useGroceryItems = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize database
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await db.initDatabase();
        await db.seedSampleData();
        setIsDbReady(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Database initialization failed"
        );
      }
    };

    setupDatabase();
  }, []);

  // Load items from database
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const groceryItems = await db.getAllGroceryItems();
      setItems(groceryItems);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load items when database is ready
  useEffect(() => {
    if (isDbReady) {
      loadItems();
    }
  }, [isDbReady, loadItems]);

  // Add new item
  const addItem = useCallback(
    async (name: string, quantity: string, category: string) => {
      try {
        await db.insertGroceryItem(name, parseInt(quantity) || 1, category);
        await loadItems();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to add item",
        };
      }
    },
    [loadItems]
  );

  // Update existing item
  const updateItem = useCallback(
    async (id: number, name: string, quantity: string, category: string) => {
      try {
        await db.updateGroceryItem(id, name, parseInt(quantity) || 1, category);
        await loadItems();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update item",
        };
      }
    },
    [loadItems]
  );

  // Delete item
  const deleteItem = useCallback(
    async (id: number) => {
      try {
        await db.deleteGroceryItem(id);
        await loadItems();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to delete item",
        };
      }
    },
    [loadItems]
  );

  // Toggle bought status
  const toggleBought = useCallback(
    async (id: number) => {
      try {
        const item = items.find((i) => i.id === id);
        if (!item) throw new Error("Item not found");
        await db.toggleBoughtStatus(id, item.bought);
        await loadItems();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to toggle bought status",
        };
      }
    },
    [items, loadItems]
  );

  // Import items from API
  const importFromAPI = useCallback(async () => {
    try {
      setImporting(true);
      setError(null);

      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos?_limit=10"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data from API");
      }

      const todos = await response.json();
      const groceryItems = todos.map((todo: any) => ({
        name: todo.title,
        quantity: 1,
        category: "Imported",
        completed: todo.completed,
      }));

      const result = await db.importItemsFromAPI(groceryItems);
      await loadItems();

      return {
        success: true,
        imported: result.imported,
        skipped: result.skipped,
      };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to import items";
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setImporting(false);
    }
  }, [loadItems]);

  // Refresh items (for pull-to-refresh)
  const refreshItems = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadItems();
    } finally {
      setRefreshing(false);
    }
  }, [loadItems]);

  return {
    // State
    isDbReady,
    error,
    items,
    loading,
    importing,
    refreshing,
    // Actions
    loadItems,
    addItem,
    updateItem,
    deleteItem,
    toggleBought,
    importFromAPI,
    refreshItems,
  };
};
