import mongoose, { Schema, Types, model } from "mongoose";

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
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    customID: String,
    createdBy: { type: Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("subCategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "categoryID",
});

const categoryModel =
  model.Category || mongoose.model("Category", categorySchema);

export default categoryModel;
