import mongoose, { Schema, Types, model } from "mongoose";

const cartSchema = new Schema(
  {
    userID: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        productID: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },
        unitPaymentPrice: { type: Number, required: true },
        name: { type: String },
        quantity: { type: Number, required: true },
        specifications: { type: Schema.Types.Mixed, default: null },
        colorAndSize: {
          color: { type: String, default: null },
          size: { type: String, default: null },
        },
      },
    ],
    subTotal: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const cartModel = model.Cart || mongoose.model("Cart", cartSchema);

export default cartModel;
