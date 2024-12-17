import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import db from "./db.js";

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: "Server is running!" });
});


app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const results = await db.query("SELECT * FROM users WHERE username=$1", [
      username,
    ]);
    if (results.rows.length > 0) {
      res.json({ success: false });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          res.status(500).json({ success: false });
        } else {
          await db.query(
            "INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *",
            [username, hash]
          );
          res.json({ success: true });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  
});
