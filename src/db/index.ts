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

// Export database instance
export default db;
