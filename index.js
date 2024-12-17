import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import db from "./db.js";

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get("/", asyncHandler(async (req, res) => {
  const results = await db.query("SELECT * FROM users");
  res.status(200).json({ status: "Server is running!", results: results.rows });
}));

app.post("/register", asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  const userExists = await db.query("SELECT * FROM users WHERE username=$1", [username]);

  if (userExists.rows.length > 0) {
    return res.status(409).json({ success: false, message: "Username already exists!" });
  }

  const hash = await bcrypt.hash(password, saltRounds);
  const newUser = await db.query(
    "INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *",
    [username, hash]
  );

  res.status(201).json({ success: true, message: "User registered successfully!", user: newUser.rows[0] });
}));

app.post("/login", asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  const userResult = await db.query("SELECT * FROM users WHERE username=$1", [username]);

  if (userResult.rows.length === 0) {
    return res.status(401).json({ success: false, message: "User not found!" });
  }

  const user = userResult.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    res.status(200).json({ success: true, message: "Login successful!" });
  } else {
    res.status(401).json({ success: false, message: "Invalid password!" });
  }
}));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "An internal error occurred", error: err.message });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});