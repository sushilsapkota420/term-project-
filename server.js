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

/* ---------------- View Routes ---------------- */

app.get("/", (req, res) => {
  res.render("home", {
    pageTitle: "Home",
    groupName: "Bigyan & Sushil",
    year: new Date().getFullYear(),
  });
});

app.get("/products", (req, res) => {
  res.render("products", {
    pageTitle: "Products",
    boxes: mysteryBoxes,
    groupName: "Bigyan & Sushil",
    year: new Date().getFullYear(),
  });
});

app.get("/products/:identifier", (req, res) => {
  const { identifier } = req.params;
  const box = findMysteryBoxByIdentifier(identifier);

  if (!box) {
    return res.status(404).render("404", {
      pageTitle: "404 Not Found",
      identifier,
      groupName: "Bigyan & Sushil",
      year: new Date().getFullYear(),
    });
  }

  return res.render("product-detail", {
    pageTitle: box.name,
    box,
    groupName: "Bigyan & Sushil",
    year: new Date().getFullYear(),
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    pageTitle: "Login",
    groupName: "Bigyan & Sushil",
    year: new Date().getFullYear(),
  });
});

app.post("/login", (req, res) => {
  res.redirect("/");
});

app.get("/profile", (req, res) => {
  res.render("profile", {
    pageTitle: "Profile",
    groupName: "Bigyan & Sushil",
    year: new Date().getFullYear(),
  });
});

app.get("/cart", (req, res) => {
  res.render("cart", {
    pageTitle: "Cart",
    groupName: "Bigyan & Sushil",
    year: new Date().getFullYear(),
  });
});

/* ---------------- API Routes ---------------- */

app.head("/api/products", (req, res) => {
  res.set("X-Mystery-Box-Count", String(mysteryBoxes.length));
  res.status(200).end();
});

app.get("/api/products", (req, res) => {
  res.status(200).json(mysteryBoxes);
});

app.get("/api/products/:identifier", (req, res) => {
  const { identifier } = req.params;
  const box = findMysteryBoxByIdentifier(identifier);

  if (!box) {
    return res.status(404).json({ error: "not found" });
  }

  return res.status(200).json(box);
});

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

app.use((req, res) => {
  res.status(404).render("404", {
    pageTitle: "404 Not Found",
    identifier: req.originalUrl,
    groupName: "Bigyan & Sushil",
    year: new Date().getFullYear(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});