const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const userAuth = require("./middlewares/auth");
const port = 3000;

app.use(express.json());
app.use(cookieParser());

const connectDB = require("./config/database");
const User = require("./models/user");
const validateSignup = require("./utils/validation");

// Create a new user
app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("Invalid credentials");
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }
    user.getJWT(req, res);
    res.send("Login successful!");
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Error: " + err.message);
  }
});

// Get user by email
app.get("/user", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.find({ email });
    if (user.length === 0) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Error fetching user: " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
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

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user.firstName + " sent connection request");
  } catch (err) {
    console.error("Error sending connection request:", err);
    res.status(500).send("Error sending connection request: " + err.message);
  }
});

// Get all users (feed)
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});

    if (!users) {
      return res.status(404).send("No users found");
    }

    res.send(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Error fetching users: " + err.message);
  }
});

// Delete a user by Id

app.delete("/user", async (req, res) => {
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

// Update a user
app.patch("/user/:id", async (req, res) => {
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
    console.log(updatedUser);
    res.send("User updated successfully!");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Error updating user: " + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
