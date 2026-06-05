const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---------------------------------------------
// Create First Admin (Run only once manually)
// ---------------------------------------------
exports.createInitialAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    let existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = new Admin({
      username,
      password: hashed,
    });

    await admin.save();

    res.json({ message: "Initial admin created successfully", admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------------------------
// Admin Login
// ---------------------------------------------
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hardcoded admin login
    if (
      username === "ManjulaSuresh" &&
      password === "ManjulaSuresh@admin1234"
    ) {
      const token = jwt.sign(
        { username: "ManjulaSuresh", role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Login successful",
        token,
      });
    }

    // Database admin login
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
