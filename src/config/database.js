const mongoose = require("mongoose");

async function connectDB() {
  // added db name at the end of the connection string to point a db. It create if not exists.
  await mongoose.connect(process.env.DATABASE_URL);
}

module.exports = connectDB;
