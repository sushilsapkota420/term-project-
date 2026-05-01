const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

let mysteryBoxes = [
  {
    id: "box-001",
    name: "starter surprise",
    theme: "gaming",
    price: 24.99,
    stock: 10,
  },
  {
    id: "box-002",
    name: "collector chaos",
    theme: "anime",
    price: 39.99,
    stock: 6,
  },
  {
    id: "box-003",
    name: "cozy mystery",
    theme: "self-care",
    price: 29.99,
    stock: 14,
  },
];

/* ---------------- Helper Functions ---------------- */

function normalizeString(value) {
  return value.trim().toLowerCase();
}

function normalizeMysteryBox(box) {
  return {
    id: normalizeString(box.id),
    name: normalizeString(box.name),
    theme: normalizeString(box.theme),
    price: Number(box.price),
    stock: Number(box.stock),
  };
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

function isValidMysteryBox(box) {
  return (
    box &&
    isValidString(box.id) &&
    isValidString(box.name) &&
    isValidString(box.theme) &&
    isValidPrice(box.price) &&
    isValidStock(box.stock)
  );
}

function findMysteryBoxByIdentifier(identifier) {
  const normalizedIdentifier = normalizeString(identifier);

  return mysteryBoxes.find(
    (box) =>
      box.id === normalizedIdentifier || box.name === normalizedIdentifier
  );
}

function hasDuplicateMysteryBox(newBox) {
  return mysteryBoxes.some(
    (box) => box.id === newBox.id || box.name === newBox.name
  );
}

/* ---------------- View Routes (HTML) ---------------- */

// Home page
app.get("/", (req, res) => {
  res.render("home", { currentYear: new Date().getFullYear() });
});

// Products page
app.get("/products", (req, res) => {
  res.render("products", {
    title: "All Products",
    products: mysteryBoxes,
    currentYear: new Date().getFullYear(),
  });
});

// Product detail page
app.get("/products/:identifier", (req, res) => {
  const { identifier } = req.params;
  const box = findMysteryBoxByIdentifier(identifier);

  if (!box) {
    return res.status(404).render("404", {
      title: "404 - Not Found",
      identifier,
      currentYear: new Date().getFullYear(),
    });
  }

  return res.render("product-detail", {
    title: box.name,
    product: box,
    currentYear: new Date().getFullYear(),
  });
});

// Login page
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    currentYear: new Date().getFullYear(),
  });
});

// Handle login form submission (dummy only)
app.post("/login", (req, res) => {
  const { username } = req.body;

  res.render("login-success", {
    title: "Login Success",
    username: username || "guest",
    currentYear: new Date().getFullYear(),
  });
});

// Static profile page
app.get("/profile", (req, res) => {
  res.render("profile", {
    title: "Profile",
    currentYear: new Date().getFullYear(),
  });
});

// Static cart page
app.get("/cart", (req, res) => {
  res.render("cart", {
    title: "Shopping Cart",
    currentYear: new Date().getFullYear(),
  });
});

/* ---------------- API Routes (JSON) ---------------- */

// HEAD /api/products -> return mystery box count in custom header
app.head("/api/products", (req, res) => {
  res.set("X-Mystery-Box-Count", String(mysteryBoxes.length));
  res.status(200).end();
});

// GET /api/products -> return all mystery boxes
app.get("/api/products", (req, res) => {
  res.status(200).json(mysteryBoxes);
});

// GET /api/products/:identifier -> return one mystery box by id or name
app.get("/api/products/:identifier", (req, res) => {
  const { identifier } = req.params;
  const box = findMysteryBoxByIdentifier(identifier);

  if (!box) {
    return res.status(404).json({ error: "not found" });
  }

  return res.status(200).json(box);
});

// POST /api/products/add -> validate, normalize, prevent duplicates
app.post("/api/products/add", (req, res) => {
  const incomingBox = req.body;

  if (!isValidMysteryBox(incomingBox)) {
    return res.status(400).json({ error: "invalid mystery box data" });
  }

  const normalizedBox = normalizeMysteryBox(incomingBox);

  if (hasDuplicateMysteryBox(normalizedBox)) {
    return res.status(409).json({ error: "duplicate mystery box" });
  }

  mysteryBoxes.push(normalizedBox);
  return res.status(201).json(normalizedBox);
});

// DELETE /api/products/:identifier -> delete by id or name
app.delete("/api/products/:identifier", (req, res) => {
  const { identifier } = req.params;
  const normalizedIdentifier = normalizeString(identifier);

  const index = mysteryBoxes.findIndex(
    (box) =>
      box.id === normalizedIdentifier || box.name === normalizedIdentifier
  );

  if (index === -1) {
    return res.status(404).json({ error: "not found" });
  }

  mysteryBoxes.splice(index, 1);
  return res.sendStatus(204);
});

// Catch-all 404 for unknown routes
app.use((req, res) => {
  res.status(404).render("404", {
    title: "404 - Not Found",
    identifier: req.originalUrl,
    currentYear: new Date().getFullYear(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});