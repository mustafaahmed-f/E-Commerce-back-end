import mongoose, { Schema, Types, model } from "mongoose";
import { deleteProductsForSubCategories } from "../../src/plugins/deletingRelatedDocs.js";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    slug: { type: String, required: true, lowercase: true, trim: true },
    image: {
      secure_url: { type: String, required: false }, //TODO : make required true after adding fake data
      public_id: { type: String, required: false }, //TODO : make required true after adding fake data
    },
    customID: String,
    createdBy: { type: Types.ObjectId, ref: "user", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    categoryID: { type: Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

subCategorySchema.virtual("Products", {
  ref: "Product",
  localField: "_id",
  foreignField: "subCategoryID",
});

subCategorySchema.plugin(deleteProductsForSubCategories);

const subCategoryModel =
  model.SubCategory || mongoose.model("SubCategory", subCategorySchema);

export default subCategoryModel;
