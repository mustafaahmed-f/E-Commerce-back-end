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
        finalPaymentPrice: { type: Number, required: true },
        name: { type: String, required: true },
        specifications: { type: Schema.Types.Mixed, default: null },
        colorAndSize: {
          color: { type: String, default: null },
          size: { type: String, default: null },
        },
      },
    ],
    couponID: {
      type: Types.ObjectId,
      ref: "Coupon",
    },

    subTotal: { type: Number, required: true, default: 0 },
    finalPaidAmount: { type: Number, required: true, default: 0 },
    phoneNumbers: [{ type: String, required: true }],
    address: { type: Schema.Types.Mixed, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "card"],
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
    isFromCart: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const orderModel = model.Order || mongoose.model("Order", orderSchema);

export default orderModel;
