const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignup } = require("../utils/validation");

router.post("/signup", async (req, res) => {
  try {
    validateSignup(req);
    const existingUser = await User.findOne({ email: req.body?.email });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please login",
      });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = User({ ...req.body, password: hashedPassword });
    const savedUser = await user.save();
    user.getJWT(req, res);
    res.json({ message: "Profile created successfully", data: savedUser });
  } catch (err) {
    console.error("Error saving user:", err);
    return res.status(400).json({
      success: false,
      message: "Internal Sever Error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    user.getJWT(req, res);
    const { firstName, lastName, age, gender, about, photoUrl, skills } = user;
    res.json({
      message: "Login successful",
      data: { firstName, lastName, age, gender, about, photoUrl, skills },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/logout", (req, res) => {
  res
    .cookie("token", null, { expires: new Date(Date.now()) })
    .json({ message: "You are logged out" });
});

module.exports = router;
