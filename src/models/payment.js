const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    notes: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
      },
      memberShipType: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      required: true,
    },
    receipt: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
