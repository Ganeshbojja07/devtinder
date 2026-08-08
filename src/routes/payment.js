const express = require("express");
const router = express.Router();
const razorpayInstance = require("../utils/razorpay");
const userAuth = require("../middlewares/auth");
const Payment = require("../models/payment");
const { v4: uuidv4 } = require("uuid");
const { prices } = require("../constants");
const User = require("../models/user");
const {validateWebhookSignature} = require("razorpay/dist/utils/razorpay-utils");

router.post("/payment/create", userAuth, async (req, res) => {
  const { memberShipType, planId } = req.body;
  const { firstName, lastName, email } = req.user;
  try {
    const order = await razorpayInstance.orders.create({
      amount: prices[planId] * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: uuidv4(), // you can generate a unique receipt id for each order
      notes: {
        // in the notes object, you can add any additional information you want to associate with the order
        firstName,
        lastName,
        memberShipType: memberShipType,
      },
    });
    // store the order details in the database

    const payment = Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      notes: {
        firstName: order.notes.firstName,
        lastName: order.notes.lastName,
        email: email,
        memberShipType: order.notes.memberShipType,
      },
      status: order.status,
      receipt: order.receipt,
    });
    const savedPayment = await payment.save();
    res.status(200).json({
      success: true,
      data: { ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/payment/webhook", async (req, res) => {
  try {
    const { event, payload } = req.body;
    const signature = req.headers["x-razorpay-signature"];
    const isWehbookValid = validateWebhookSignature(
      JSON.stringify(payload),
      signature,
      process.env.WEBHOOK_SECRET,
    );

    if (!isWehbookValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const paymentDetails = payload?.payment?.entity;
    const payment = await Payment.findOne({
      orderId: paymentDetails?.order_id,
    });

    payment.status = paymentDetails?.status;
    payment.paymentId = paymentDetails?.id;
    await payment.save();

    const user = await User.findById(payment.userId);
    if (user) {
      user.isPremium = true;
      user.memberShipType = payment.notes.memberShipType;
      await user.save();
    }

    // Process the webhook event
    switch (event) {
      case "payment.captured":
        // Handle successful payment capture
        break;
      case "payment.failed":
        // Handle failed payment
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }

    res
      .status(200)
      .json({ success: true, message: "Webhook received successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
