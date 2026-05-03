const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function openDb() {
  return open({
    filename: "./db/mystery_boxes.sqlite",
    driver: sqlite3.Database,
  });
}

async function setupDb() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      theme TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL
    )
  `);

  const result = await db.get("SELECT COUNT(*) AS count FROM products");

  if (result.count === 0) {
    await db.run(
      "INSERT INTO products (id, name, theme, price, stock) VALUES (?, ?, ?, ?, ?)",
      ["box-001", "starter surprise", "gaming", 24.99, 10]
    );

    await db.run(
      "INSERT INTO products (id, name, theme, price, stock) VALUES (?, ?, ?, ?, ?)",
      ["box-002", "collector chaos", "anime", 39.99, 6]
    );

    await db.run(
      "INSERT INTO products (id, name, theme, price, stock) VALUES (?, ?, ?, ?, ?)",
      ["box-003", "cozy mystery", "self-care", 29.99, 14]
    );
  }

  return db;
}

module.exports = setupDb;