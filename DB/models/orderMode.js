import mongoose, { Schema, Types, model } from "mongoose";

const orderSchema = new Schema(
  {
    userID: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productID: {
          type: Types.ObjectId,
          ref: "Product_item",
          required: true,
        },
        quantity: { type: Number, required: true },
        unitPaymentPrice: { type: Number, required: true },
        name: { type: String, required: true },
      },
    ],
    couponID: {
      type: Types.ObjectId,
      ref: "Coupon",
    },
    subTotal: { type: Number, required: true, default: 0 },
    finalPaidAmount: { type: Number, required: true, default: 0 },
    phoneNumbers: [{ type: String, required: true }],
    address: { type: String, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "visa card"],
    },
    orderStatus: {
      type: String,
      required: true,
      default: "pending",
      enum: [
        "pending",
        "completed",
        "cancelled",
        "delivered",
        "returned",
        "failed",
        "shipped",
      ],
    },
  },
  { timestamps: true }
);

const orderModel = model.Order || mongoose.model("Order", orderSchema);

export default orderModel;
