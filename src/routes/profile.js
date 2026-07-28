const express = require("express");
const router = express.Router();
const User = require("../models/user");
const userAuth = require("../middlewares/auth");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { validateProfileUpdate } = require("../utils/validation");

router.get("/user", userAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Error fetching user: " + err.message);
  }
});

router.get("/profile/view", userAuth, async (req, res) => {
  try {
    const userFound = req.user;

    if (!userFound) {
      return res.status(404).send("User not found");
    }
    res.send(userFound);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Error fetching user: " + err.message);
  }
});

router.delete("/user", userAuth, async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User deleted successfully!");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Error deleting user: " + err.message);
  }
});

router.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateProfileUpdate(req, res);
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((update) => {
      loggedInUser[update] = req.body[update];
    });
    await loggedInUser.save();
    res.json({
      message: loggedInUser.firstName + ", your profile updated successfully!",
      data: loggedInUser,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send("Error updating profile: " + err.message);
  }
});

// Update a user
router.patch("/user/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const UPDATES_ALLOWED = ["age", "gender", "photoUrl", "about", "skills"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      UPDATES_ALLOWED.includes(update),
    );

    if (!isValidOperation) {
      return res.status(400).send("Invalid update fields");
    }

    if (req.body.skills?.length > 10) {
      return res.status(400).send("Skills should not exceed 10");
    }

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    }); // add run validators explicitly to run the validators for update.

    res.send("User updated successfully!");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Error updating user: " + err.message);
  }
});

router.patch("/profile/editPassword", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new Error("Missing required fields");
    }

    if (oldPassword === newPassword) {
      throw new Error("New password must not be old password");
    }
    const user = req.user;

    const isMatch = await user.validatePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).send("Old password is incorrect");
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).send("Enter a strong password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.send("Password updated successfully!");
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).send("ERROR: " + err.message);
  }
});

module.exports = router;
