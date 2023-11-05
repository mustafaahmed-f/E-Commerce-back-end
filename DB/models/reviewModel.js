import mongoose, { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema({
  userID: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  productID: {
    type: Types.ObjectId,
    ref: "Product_item",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    enum: [1, 2, 3, 4, 5],
  },
  comment: {
    type: String,
  },
});

const reviewModel = model.Review || mongoose.model("Review", reviewSchema);

export default reviewModel;
