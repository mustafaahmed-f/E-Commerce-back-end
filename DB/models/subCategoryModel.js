import mongoose, { Schema, Types, model } from "mongoose";

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
    categoryID: { type: Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

const subCategoryModel =
  model.SubCategory || mongoose.model("SubCategory", subCategorySchema);

export default subCategoryModel;
