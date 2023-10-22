import mongoose, { Schema, Types, model } from "mongoose";
import product_itemModel from "./product_itemModel.js";
import {
  deleteItemsWhenDeleteProduct,
  deleteItemsWithDeleteManyProducts,
  getIDsOfDeletedProducts,
} from "../../src/plugins/deleteProductItems.js";

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

    // customID: String,
    // isCloth: Boolean, //If the product is a cloth, You will show this product not its items. Items will be options inside it.
    //We will show price of any product item of that product,

    categoryID: { type: Types.ObjectId, ref: "Category", required: true },
    subCategoryID: { type: Types.ObjectId, ref: "SubCategory", required: true },
    brandID: { type: Types.ObjectId, ref: "Brands", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("productItems", {
  ref: "Product_item",
  localField: "_id",
  foreignField: "productID",
});

const productModel = model.Product || mongoose.model("Product", productSchema);

productSchema.plugin(deleteItemsWhenDeleteProduct);
productSchema.plugin(getIDsOfDeletedProducts);
productSchema.plugin(deleteItemsWithDeleteManyProducts);

export default productModel;
