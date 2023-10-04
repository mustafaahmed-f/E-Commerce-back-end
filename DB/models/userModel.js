import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "superAdmin"],
    },
    status: {
      type: String,
      default: "offline",
      enum: ["online", "offline"],
    },
    isConfirmed: {
      type: Boolean,
      default: false,
      enum: ["true", "false"],
    },
    profileImage: {
      secure_url: String,
      public_id: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      enum: ["true", "false"],
    },
    gender: {
      type: String,
      default: "male",
      enum: ["male", "female"],
    },
    customID: String,
    birthDate: String,
    token: String,
    confirmCode: String,
    forgetCode: { type: String, default: null },
    numOfConfirmRequests: { type: Number, default: 0 },
    numOfAddresses: { type: Number, default: 0 },
    newConfirmToken: String,
    confirmToken: String,
  },
  { timestamps: true }
);

userSchema.virtual("Addresses", {
  ref: "UserAddress",
  localField: "_id",
  foreignField: "user_id",
});

//TODO : virtual populate to address .

const userModel = model.User || mongoose.model("User", userSchema);

export default userModel;
