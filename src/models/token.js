import mongoose from "mongoose";
const { Schema, model } = mongoose;

const tokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users" },
    refreshToken: { type: String, required: true },
    expiresIn: { type: Date, required: true },
    createdByIp: { type: String, required: true },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Token = model("Tokens", tokenSchema);

export default Token;
