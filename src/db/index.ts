import * as SQLite from "expo-sqlite";

// Định nghĩa type cho GroceryItem
export interface GroceryItem {
  id: number;
  name: string;
  quantity: number;
  category: string | null;
  bought: number;
  created_at: number;
}

// Mở kết nối SQLite
const db = SQLite.openDatabaseSync("grocery.db");

// Khởi tạo database và tạo bảng grocery_items
export const initDatabase = async (): Promise<void> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS grocery_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        category TEXT,
        bought INTEGER DEFAULT 0,
        created_at INTEGER
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Seed dữ liệu mẫu nếu bảng đang trống
export const seedSampleData = async (): Promise<void> => {
  try {
    // Kiểm tra xem bảng đã có dữ liệu chưa
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM grocery_items"
    );

    if (result && result.count === 0) {
      // Thêm dữ liệu mẫu
      const now = Date.now();
      await db.execAsync(`
        INSERT INTO grocery_items (name, quantity, category, bought, created_at) VALUES
        ('Sữa', 2, 'Đồ uống', 0, ${now}),
        ('Trứng', 12, 'Thực phẩm', 0, ${now}),
        ('Bánh mì', 1, 'Thực phẩm', 0, ${now});
      `);
      console.log("Sample data seeded successfully");
    } else {
      console.log("Data already exists, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding sample data:", error);
    throw error;
  }
};

// Lấy tất cả grocery items từ database
export const getAllGroceryItems = async (): Promise<GroceryItem[]> => {
  try {
    const items = await db.getAllAsync<GroceryItem>(
      "SELECT * FROM grocery_items ORDER BY created_at DESC"
    );
    return items || [];
  } catch (error) {
    console.error("Error getting grocery items:", error);
    throw error;
  }
};

// Thêm mới grocery item
export const insertGroceryItem = async (
  name: string,
  quantity: number = 1,
  category: string | null = null
): Promise<void> => {
  try {
    const created_at = Date.now();
    await db.runAsync(
      "INSERT INTO grocery_items (name, quantity, category, bought, created_at) VALUES (?, ?, ?, 0, ?)",
      [name, quantity, category, created_at]
    );
    console.log("Item inserted successfully");
  } catch (error) {
    console.error("Error inserting grocery item:", error);
    throw error;
  }
};

// Toggle trạng thái bought (0 ↔ 1)
export const toggleBoughtStatus = async (
  id: number,
  currentStatus: number
): Promise<void> => {
  try {
    const newStatus = currentStatus === 1 ? 0 : 1;
    await db.runAsync("UPDATE grocery_items SET bought = ? WHERE id = ?", [
      newStatus,
      id,
    ]);
    console.log(`Item ${id} bought status toggled to ${newStatus}`);
  } catch (error) {
    console.error("Error toggling bought status:", error);
    throw error;
  }
};

// Cập nhật grocery item (name, quantity, category)
export const updateGroceryItem = async (
  id: number,
  name: string,
  quantity: number,
  category: string | null
): Promise<void> => {
  try {
    await db.runAsync(
      "UPDATE grocery_items SET name = ?, quantity = ?, category = ? WHERE id = ?",
      [name, quantity, category, id]
    );
    console.log(`Item ${id} updated successfully`);
  } catch (error) {
    console.error("Error updating grocery item:", error);
    throw error;
  }
};

// Export database instance
export default db;
