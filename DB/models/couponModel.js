import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const couponSchema = new Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    couponAmount: {
      type: Number,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    isPercentage: {
      type: Boolean,
      default: false,
    },
    assignedUsers: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        maxUse: {
          type: Number,
        },
        usedTimes: {
          type: Number,
          default: 0,
        },
      },
    ],
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const couponModel = model.Coupon || mongoose.model("Coupon", couponSchema);

export default couponModel;
