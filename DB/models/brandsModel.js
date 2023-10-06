import mongoose, { Schema, Types, model } from "mongoose";

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
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "user", required: true },
    customID: { type: String },
  },
  { timestamps: true }
);

const brandsModel = model.Brands || mongoose.model("Brands", brandsSchema);

export default brandsModel;
