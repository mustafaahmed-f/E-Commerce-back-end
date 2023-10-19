import mongoose, { Schema, Types, model } from "mongoose";

const product_itemSchema = new Schema(
  {
    productID: { type: Types.ObjectId, ref: "Product", required: true },
    color: String,
    sizes: [
      {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
      },
    ],
    specifications: String,
    stock: { type: Number, required: true, default: 0 },
    soldItems: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const product_itemModel =
  model.Product_item || mongoose.model("Product_item", product_itemSchema);

export default product_itemModel;
