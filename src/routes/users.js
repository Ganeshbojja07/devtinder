const express = require("express");
const userAuth = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const router = express.Router();

const USER_SAFE_DATA = "firstName lastName age gender skills photoUrl about";

router.get("/users/requests/received", userAuth, async (req, res) => {
  try {
    let loggedInUser = req.user;
    let connections = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    res.json({ message: "Requests fetched successfully", data: connections });
  } catch (err) {
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});

router.get("/users/connections", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const connectionObjs = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    const connections = connectionObjs.map((item) =>
      !item.fromUserId._id.equals(userId) ? item.fromUserId : item.toUserId,
    );
    res.json({ message: "Connections fetched succesfully", data: connections });
  } catch (err) {
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});

router.get("/users/feed", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });
    const excludedUserIds = connections.map((conn) =>
      conn.fromUserId.equals(userId) ? conn.toUserId : conn.fromUserId,
    );
    const feed = await User.find({
      _id: { $nin: [userId, ...excludedUserIds] },
    }).select(USER_SAFE_DATA);
    res.json({ message: "Feed fetched successfully", data: feed });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
