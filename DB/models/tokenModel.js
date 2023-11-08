import mongoose, { Schema, Types, model } from "mongoose";

const tokenSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: "User", required: true },
  confirmCode: String,
  newConfirmToken: String,
  confirmToken: String,
  forgotPasswordToken: String,
  loginToken: [String],
  userToken: String,
});

const tokenModel = model.Token || mongoose.model("Token", tokenSchema);

export default tokenModel;
