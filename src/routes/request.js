const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { run } = require("../utils/sendEmail");

router.post(
  "/connectionRequest/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { toUserId, status } = req.params;
      const allowedStatus = ["interested", "ignored"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status: " + status });
      }

      const user = await User.findById(toUserId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const existingConnectionRequest = await ConnectionRequest.find({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest.length) {
        return res
          .status(400)
          .json({ message: "Connection request already exists" });
      }

      const connectionRequest = ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      const emailResponse = await run(); // Call the run function from sendEmail.js
      console.log("Email response:", emailResponse);
      res.json({
        message: `${req.user.firstName} to ${user.firstName}: ${status}`,
        data,
      });
    } catch (err) {
      console.error("Error sending connection request:", err);
      res.status(500).send("Error: " + err.message);
    }
  },
);

router.post(
  "/connectionRequest/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user._id;
      const { status, requestId } = req.params;
      const allowedStatus = ["rejected", "accepted"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status: " + status });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res.status(400).json({
          message: "Connection request not found",
        });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({ message: `Connection request ${status}`, data });
    } catch (err) {
      res.status(500).send("Error: " + err.message);
    }
  },
);

module.exports = router;
