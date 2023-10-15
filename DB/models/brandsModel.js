import mongoose, { Schema, Types, model } from "mongoose";
import { deleteProdoctsForBrands } from "../../src/plugins/deletingRelatedDocs.js";

const brandsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      secure_url: { type: String, required: false }, //TODO : make required true after adding fake data
      public_id: { type: String, required: false }, //TODO : make required true after adding fake data
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    customID: { type: String },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

brandsSchema.plugin(deleteProdoctsForBrands);

const brandsModel = model.Brands || mongoose.model("Brands", brandsSchema);

export default brandsModel;
