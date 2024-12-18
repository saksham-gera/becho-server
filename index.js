import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";

const app = express();
const port = 3000;
const saltRounds = 10;
const jwtSecret = ""; 
const tokenExpiration = "7d";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access token is missing or invalid" });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Token is invalid" });
    }
    req.user = user; // Attach user info to the request object
    next();
  });
};

app.get(
  "/",
  asyncHandler(async (req, res) => {
    const results = await db.query("SELECT * FROM users");
    res
      .status(200)
      .json({ status: "Server is running!", results: results.rows });
  })
);

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  try {
    const results = await db.query(
      "SELECT * FROM users WHERE username=$1 OR email=$2",
      [username, email]
    );

    if (results.rows.length > 0) {
      res.json({
        success: false,
        message: "Username or email already exists!",
      });
    } else {
      // Hash the password
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          res
            .status(500)
            .json({ success: false, message: "Error hashing password" });
        } else {
          // Insert user into the database
          await db.query(
            "INSERT INTO users(username, password, email) VALUES ($1, $2, $3) RETURNING *",
            [username, hash, email]
          );
          res.json({ success: true, message: "User registered successfully!" });
        }
      });
    }
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

app.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const userResult = await db.query("SELECT * FROM users WHERE email=$1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: "User not found!" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Generate JWT
      const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, {
        expiresIn: tokenExpiration,
      });
      res.status(200).json({
        success: true,
        message: "Login successful!",
        token,
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid password!" });
    }
  })
);

// Example of a protected route
app.get(
  "/protected",
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: "You have access to this protected route!",
      user: req.user,
    });
  })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An internal error occurred",
    error: err.message,
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
