import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const jwtSecret = process.env.JWT_SECRET;
const tokenExpiration = "7d";

// Register a new user
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await db.query(
    "SELECT * FROM users WHERE username=$1 OR email=$2",
    [username, email]
  );

  if (existingUser.rows.length > 0) {
    return res
      .status(400)
      .json({ success: false, message: "Username or email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, hashedPassword]
  );

  const token = jwt.sign({ id:result.rows[0].id}, jwtSecret, {
    expiresIn: tokenExpiration,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully!",
    user: { id: result.rows[0].id, username, email },
    token
  });
};

// Log in a user
export const login = async (req, res) => {
  const { email, password } = req.body;

  const userResult = await db.query("SELECT * FROM users WHERE email=$1", [email]);

  if (userResult.rows.length === 0) {
    return res.status(401).json({ success: false, message: "User not found!" });
  }

  const user = userResult.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid password!" });
  }

  const token = jwt.sign({ id:user.id}, jwtSecret, {
    expiresIn: tokenExpiration,
  });

  res.status(200).json({
    success: true,
    message: "Login successful!",
    token,
  });
};
