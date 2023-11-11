import mongoose, { Schema, Types, model } from "mongoose";
import {
  deleteProductsForCategories,
  deleteSubCategoriesForCategories,
} from "../../src/plugins/deletingRelatedDocs.js";

const categorySchema = new Schema(
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
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, //This causes an additional id field to appear in the response body.
    toObject: { virtuals: true },
  },
  { unique: true }
);

categorySchema.virtual("subCategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "categoryID",
});

categorySchema.virtual("Products", {
  ref: "Product",
  localField: "_id",
  foreignField: "categoryID",
});

categorySchema.plugin(deleteProductsForCategories);
categorySchema.plugin(deleteSubCategoriesForCategories);

const categoryModel =
  model.Category || mongoose.model("Category", categorySchema);

export default categoryModel;
