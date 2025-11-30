const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");


const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const corsOptions = {
  origin: '*', // Only this origin is allowed
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
  credentials: true, // Allow cookies and authentication headers
  optionsSuccessStatus: 204 // Some legacy browsers choke on 200
};
app.use(cors(corsOptions));
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "photo-" + unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const mongoUrl = "mongodb://admin:test123@localhost:27017";
const dbName = "todos";
let db;
MongoClient.connect(mongoUrl)
  .then((client) => {
    db = client.db(dbName);
    console.log("Connected to MongoDB →", dbName);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

let todos = [];

app.use(express.static(__dirname));
app.use("/uploads", express.static(uploadDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/todos", async (req, res) => {
  const todos = await db.collection("todos").find().toArray();
  res.json(todos);
});

app.post("/todos", upload.single("photo"), async (req, res) => {
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ error: "text required" });

  const todo = {
    id: Date.now(),
    text,
    image: req.file ? `/uploads/${req.file.filename}` : null,
  };
  const result = await db.collection("todos").insertOne(todo);
  todo._id = result.insertedId;
  res.json(todo);
});

app.listen(PORT, () => {
  console.log(`Server → http://localhost:${PORT}`);
});
