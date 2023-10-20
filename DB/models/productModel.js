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
    // description: String,

    // price: { type: Number, required: true, default: 0 },
    // discount: { type: Number, default: 0 },
    // discountType: { type: String, enum: ["percentage", "amount"] },
    // discountPeriod: Number,
    // discountFinished: { type: Boolean },
    // paymentPrice: { type: Number, default: 0 },

    // stock: { type: Number, required: true, default: 0 },
    // soldItems: { type: Number, default: 0 },
    // totalAmount: { type: Number, default: 0 },
    customID: String,
    isCloth: Boolean, //If the product is a cloth, You will show this product not its items. Items will be options inside it.
    //We will show price of any product item of that product,
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

    // details: {
    //   color: String,
    //   size: {
    //     type: String,
    //     enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    //   },
    //   specifications: String,
    // },

    categoryID: { type: Types.ObjectId, ref: "Category", required: true },
    subCategoryID: { type: Types.ObjectId, ref: "SubCategory", required: true },
    brandID: { type: Types.ObjectId, ref: "Brands", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    // updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, //This causes an additional id field to appear in the response body.
    toObject: { virtuals: true },
  }
);

productSchema.virtual("productItems", {
  ref: "Product_item",
  localField: "_id",
  foreignField: "productID",
});

const productModel = model.Product || mongoose.model("Product", productSchema);

export default productModel;
