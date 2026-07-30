const { Schema, model } = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    lastName: {
      type: String,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 100,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
          );
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Gender must be male, female, or other");
        } // by default validator will work only on insert, if we want it to work on update as well, we need to set runValidators: true in the update query options.
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://img.magnific.com/premium-vector/default-avatar-profile-icon-gray-placeholder-vector-illustration_514344-14757.jpg?semt=ais_test_b&w=740&q=80",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL");
        }
      },
    },
    about: {
      type: String,
      default: "This is a default description",
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true },
); // this will automatically add createdAt and updatedAt fields to the schema

userSchema.methods.getJWT = function (req, res) {
  const user = this;
  try {
    const token = jwt.sign({ _id: user._id }, "Ganesh&02", { expiresIn: "7d" });
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  } catch (err) {
    console.error("Error creating token" + err);
    res.status(500).send("Error creating token" + err.message);
  }
};

userSchema.methods.validatePassword = async function (password) {
  const user = this;
  const isValid = await bcrypt.compare(password, user.password);
  return isValid;
};

module.exports = model("User", userSchema);
