const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const connectDB = require("./config/database");
const User = require("./models/user");

// Create a new user
app.post("/signup", async (req, res) => {
  try {
    const user = User(req.body);
    await user.save();
    res.send("User saved successfully!");
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).send("Error saving user: " + err.message);
  }
});

// Get user by email
app.get("/user", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.find({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Error fetching user: " + err.message);
  }
});

// Get all users (feed)
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find();

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
app.patch("/user", async (req, res) => {
  try{
    const {email}=req.body;
    await User.findOneAndUpdate({email},req.body);
    res.send("User updated successfully!");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Error updating user: " + err.message);

  }
})


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
