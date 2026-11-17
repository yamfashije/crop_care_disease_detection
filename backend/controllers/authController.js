
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================================
// REGISTER FARMER
// ======================================

const registerUser = async (req, res) => {
  try {
    const fullName = String(
      req.body.fullName || req.body.full_name || req.body.name || ""
    ).trim();

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const phone = String(req.body.phone || "").trim();
    const district = String(req.body.district || "").trim();
    const password = req.body.password;

    // Validate required fields
    if (!fullName || !email || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    // Validate name and email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      fullName.length > 100 ||
      !emailPattern.test(email) ||
      email.length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name and email.",
      });
    }

    // Validate password
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must contain 8 to 72 characters.",
      });
    }

    // Check existing email
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save farmer in MySQL
    const [result] = await db.execute(
      `INSERT INTO users
       (full_name, email, phone, district, password, role)
       VALUES (?, ?, ?, ?, ?, 'farmer')`,
      [
        fullName,
        email,
        phone || null,
        district || null,
        hashedPassword,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful. You can now log in.",
      userId: result.insertId,
    });

  } catch (error) {
    console.error("Register error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
};

// ======================================
// LOGIN USER
// ======================================

const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = req.body.password;

    if (!email || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    // Find user
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = rows[0];

    // Compare password
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        district: user.district,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

// ======================================
// GET LOGGED-IN USER
// ======================================

const getMe = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
        id,
        full_name AS fullName,
        email,
        phone,
        district,
        role
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      user: rows[0],
    });

  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve user profile.",
    });
  }
};

// ======================================
// EXPORT FUNCTIONS
// ======================================

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
