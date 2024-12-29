import db from "../db.js";

export const getUserData = async (req, res) => {
  const userId = req.user.id;

  const userResult = await db.query("SELECT id, username, email , role FROM users WHERE id=$1", [userId]);

  if (userResult.rows.length === 0) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({
    success: true,
    message: "User data retrieved successfully!",
    user: userResult.rows[0],
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const usersResult = await db.query("SELECT id, username, email, created_at FROM users");

    if (usersResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    res.status(200).json({
      success: true,
      message: "Users data retrieved successfully!",
      users: usersResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
