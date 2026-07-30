const mongoose = require("mongoose");

async function connectDB() {
  // added db name at the end of the connection string to point a db. It create if not exists.
  await mongoose.connect(
    "mongodb+srv://bojjaganeshkumar1_db_user:vpnAfjaXOXHqMop7@learnnode.y0uxvnc.mongodb.net/devTinder",
  );
}

module.exports = connectDB;
