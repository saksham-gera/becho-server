import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import db from "./db.js";

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get("/", async(req, res) => {
  res.status(200).json({ status: "Server is running!" });
  const results = await db.query("SELECT * FROM users");
  res.status(200).json({ results});
});


app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const results = await db.query("SELECT * FROM users WHERE username=$1", [
      username,
    ]);
    if (results.rows.length > 0) {
      res.json({ success: false, message: "Username already exists!" });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          res.status(500).json({ success: false, message: "Error hashing password" });
        } else {
          await db.query(
            "INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *",
            [username, hash]
          );
          res.json({ success: true, message: "User registered successfully!" });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});


app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE username=$1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "User not found!" });
    }

    const user = result.rows[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error verifying password" });
      }
      if (isMatch) {
        res.json({ success: true, message: "Login successful!" });
      } else {
        res.status(401).json({ success: false, message: "Invalid password!" });
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
