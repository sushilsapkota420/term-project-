const express = require("express");
const path = require("path");
const setupDb = require("./db/database");

const app = express();
const PORT = process.env.PORT || 3000;

let db;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

function normalizeString(value) {
  return value.trim().toLowerCase();
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidPrice(value) {
  return !Number.isNaN(Number(value)) && Number(value) >= 0;
}

function isValidStock(value) {
  return Number.isInteger(Number(value)) && Number(value) >= 0;
}

function isValidProduct(product) {
  return (
    product &&
    isValidString(product.id) &&
    isValidString(product.name) &&
    isValidString(product.theme) &&
    isValidPrice(product.price) &&
    isValidStock(product.stock)
  );
}

/* ---------------- View Routes ---------------- */

app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
    currentYear: new Date().getFullYear(),
  });
});

app.get("/products", async (req, res) => {
  const products = await db.all("SELECT * FROM products");

  res.render("products", {
    title: "Products",
    products,
    currentYear: new Date().getFullYear(),
  });
});

app.get("/products/:identifier", async (req, res) => {
  const identifier = normalizeString(req.params.identifier);

  const product = await db.get(
    "SELECT * FROM products WHERE id = ? OR name = ?",
    [identifier, identifier]
  );

  if (!product) {
    return res.status(404).render("404", {
      title: "404 - Not Found",
      identifier: req.params.identifier,
      currentYear: new Date().getFullYear(),
    });
  }

  res.render("product-detail", {
    title: product.name,
    product,
    currentYear: new Date().getFullYear(),
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    currentYear: new Date().getFullYear(),
  });
});

app.post("/login", (req, res) => {
  res.render("login-success", {
    title: "Login Success",
    username: req.body.username || "guest",
    currentYear: new Date().getFullYear(),
  });
});

app.get("/register", (req, res) => {
  res.render("register", {
    title: "Create Account",
    currentYear: new Date().getFullYear(),
  });
});

app.post("/register", (req, res) => {
  res.render("login-success", {
    title: "Account Created",
    username: req.body.username || "new user",
    currentYear: new Date().getFullYear(),
  });
});

app.get("/profile", (req, res) => {
  res.render("profile", {
    title: "Profile",
    currentYear: new Date().getFullYear(),
  });
});

app.get("/cart", (req, res) => {
  res.render("cart", {
    title: "Cart",
    currentYear: new Date().getFullYear(),
  });
});

/* ---------------- API Routes ---------------- */

app.head("/api/products", async (req, res) => {
  const result = await db.get("SELECT COUNT(*) AS count FROM products");
  res.set("X-Mystery-Box-Count", String(result.count));
  res.status(200).end();
});

app.get("/api/products", async (req, res) => {
  const products = await db.all("SELECT * FROM products");
  res.status(200).json(products);
});

app.get("/api/products/:identifier", async (req, res) => {
  const identifier = normalizeString(req.params.identifier);

  const product = await db.get(
    "SELECT * FROM products WHERE id = ? OR name = ?",
    [identifier, identifier]
  );

  if (!product) {
    return res.status(404).json({ error: "not found" });
  }

  res.status(200).json(product);
});

app.post("/api/products/add", async (req, res) => {
  const incomingProduct = req.body;

  if (!isValidProduct(incomingProduct)) {
    return res.status(400).json({ error: "invalid product data" });
  }

  const product = {
    id: normalizeString(incomingProduct.id),
    name: normalizeString(incomingProduct.name),
    theme: normalizeString(incomingProduct.theme),
    price: Number(incomingProduct.price),
    stock: Number(incomingProduct.stock),
  };

  try {
    await db.run(
      "INSERT INTO products (id, name, theme, price, stock) VALUES (?, ?, ?, ?, ?)",
      [product.id, product.name, product.theme, product.price, product.stock]
    );

    res.status(201).json(product);
  } catch (error) {
    res.status(409).json({ error: "duplicate product" });
  }
});

app.delete("/api/products/:identifier", async (req, res) => {
  const identifier = normalizeString(req.params.identifier);

  const result = await db.run(
    "DELETE FROM products WHERE id = ? OR name = ?",
    [identifier, identifier]
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: "not found" });
  }

  res.sendStatus(204);
});

app.use((req, res) => {
  res.status(404).render("404", {
    title: "404 - Not Found",
    identifier: req.originalUrl,
    currentYear: new Date().getFullYear(),
  });
});

setupDb()
  .then((database) => {
    db = database;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
  });