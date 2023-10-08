import mongoose, { Schema, Types, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: String,

    price: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    paymentPrice: { type: Number, default: 0 },

    stock: { type: Number, required: true, default: 0 },
    soldItems: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    images: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    mainImage: {
      secure_url: { type: String },
      public_id: { type: String },
    },

    colors: [String],
    sizes: [{ type: String, enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] }],

    categoryID: { type: Types.ObjectId, ref: "Category", required: true },
    subCategoryID: { type: Types.ObjectId, ref: "SubCategory", required: true },
    brandID: { type: Types.ObjectId, ref: "Brands", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const productModel = model.Product || mongoose.model("Product", productSchema);

export default productModel;
