const { model, Schema } = require("mongoose");

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User", //fromUserId reference to the Users collection
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "rejected", "accepted"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true },
);

connectionRequestSchema.pre("save", function () {
  // it runs before saving connectionRequest document.
  // we are adding a validation here we can also do it inside the route handler.
  // but works only before saving api we can do it insde the route handler even before hitting the db.
  // We are adding just to learn prev middlewares.
  const connection = this;
  if (connection.fromUserId.equals(connection.toUserId)) {
    throw new Error("fromUserId and toUserId should be different");
  }
});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

module.exports = model("ConnectionRequest", connectionRequestSchema);
