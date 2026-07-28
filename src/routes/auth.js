const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const {validateSignup} = require("../utils/validation");

router.post("/signup", async (req, res) => {
  try {
    validateSignup(req);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = User({ ...req.body, password: hashedPassword });
    await user.save();
    res.send("User saved successfully!");
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).send("Error: " + err.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({message:"Invalid credentials"});
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
       return res.status(404).json({message:"Invalid credentials"});
    }
    user.getJWT(req, res);
    res.send("Login successful!");
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Error: " + err.message);
  }
});

router.post("/logout", (req, res) => {
  res
    .cookie("token", null, { expires: new Date(Date.now()) })
    .send("Logout successfully");
});

module.exports = router;
