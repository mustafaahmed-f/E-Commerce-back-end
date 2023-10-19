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
    discountType: { type: String, enum: ["percentage", "amount"] },
    discountPeriod: Number,
    discountFinished: { type: Boolean },
    paymentPrice: { type: Number, default: 0 },

    totalStock: { type: Number, required: true, default: 0 },
    totalSoldItems: { type: Number, default: 0 },
    totalProductAmount: { type: Number, default: 0 },
    customID: String,
    images: [
      {
        secure_url: { type: String, required: false }, //TODO : make required true after adding fake data
        public_id: { type: String, required: false }, //TODO : make required true after adding fake data
      },
    ],
    mainImage: {
      secure_url: { type: String, required: false }, //TODO : make required true after adding fake data
      public_id: { type: String, required: false }, //TODO : make required true after adding fake data
    },

    details: [
      {
        color: String,
        sizes: [
          { type: String, enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] },
        ],
        specifications: String,
        stock: { type: Number, required: true, default: 0 },
        soldItems: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
      },
    ],

    // colors: [String],
    // sizes: [{ type: String, enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] }],

    categoryID: { type: Types.ObjectId, ref: "Category", required: true },
    subCategoryID: { type: Types.ObjectId, ref: "SubCategory", required: true },
    brandID: { type: Types.ObjectId, ref: "Brands", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const productModel = model.Product || mongoose.model("Product", productSchema);

export default productModel;
