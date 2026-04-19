const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 

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

/* ---------------- Routes ---------------- */

// HEAD / -> return mystery box count in custom header
app.head("/", (req, res) => {
  res.set("X-Mystery-Box-Count", String(mysteryBoxes.length));
  res.status(200).end();
});

// GET / -> return all mystery boxes
app.get("/", (req, res) => {
  res.status(200).json(mysteryBoxes);
});

// GET /:identifier -> return one mystery box by id or name
app.get("/:identifier", (req, res) => {
  const { identifier } = req.params;
  const box = findMysteryBoxByIdentifier(identifier);

  if (!box) {
    return res.status(404).json({ error: "not found" });
  }

  return res.status(200).json(box);
});

// POST /add -> validate, normalize, prevent duplicates
app.post("/add", (req, res) => {
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

// DELETE /:identifier -> delete by id or name
app.delete("/:identifier", (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
