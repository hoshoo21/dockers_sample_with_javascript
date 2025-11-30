const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "photo-" + unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

let todos = [];

app.use(express.static(__dirname));
app.use("/uploads", express.static(uploadDir));

app.get("/todos", (req, res) => {
  res.json(todos);
});

app.post("/todos", upload.single("photo"), (req, res) => {
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ error: "text required" });

  const todo = {
    id: Date.now(),
    text,
    image: req.file ? `/uploads/${req.file.filename}` : null,
  };

  todos.push(todo);
  res.json(todo);
});

app.listen(PORT, () => {
  console.log(`Server → http://localhost:${PORT}`);
});
