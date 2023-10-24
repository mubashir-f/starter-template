import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match:
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["user", "athlete"],
      default: "user",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    timezone: {
      type: Number,
    },
    photoUrl: {
      type: String,
    },
    isActivated: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
    },
    deviceId: {
      type: String,
    },
    platform: {
      type: String,
      enum: ["Android", "IOS", "Web"],
      default: "Web",
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
export default User;
