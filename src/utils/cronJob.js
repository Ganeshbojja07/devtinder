const cron = require("node-cron");
const connectionRequest = require("../models/connectionRequest");
const { startOfYesterday, endOfYesterday } = require("date-fns");
const { run } = require("./sendEmail");

// Schedule a cron job to run every day at 8:00 AM
cron.schedule(
  "0 8 * * *",
  async () => {
    try {
      const connections = await connectionRequest
        .find({
          status: "interested",
          createdAt: { $gte: startOfYesterday(), $lte: endOfYesterday() },
        })
        .populate("fromUserId", "email firstName")
        .populate("toUserId", "email firstName");
      for (let connection of connections) {
        try {
          await Promise.all(
            connections.map((connection) =>
              run(
                connection.fromUserId.firstName,
                connection.toUserId.firstName,
              ),
            ),
          );
        } catch (err) {
          console.error("Error sending email:", err);
        }
      }
    } catch (err) {
      console.log("Error in cron job:", err);
    }
  },
  {
    timezone: "Asia/Kolkata",
  },
);

module.exports = cron;
