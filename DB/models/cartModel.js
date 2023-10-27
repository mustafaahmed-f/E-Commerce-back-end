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
          ref: "Product_item",
          required: true,
        },
        unitPaymentPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
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
