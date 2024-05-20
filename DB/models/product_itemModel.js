import mongoose, { Schema, Types, model } from "mongoose";

const product_itemSchema = new Schema(
  {
    productID: { type: Types.ObjectId, ref: "Product", required: true },
    item_name: { type: String, required: true, trim: true }, // Name contains any specifications.
    item_slug: { type: String, required: true, trim: true },
    item_customID: String,
    categoryID: { type: Types.ObjectId, ref: "Category", required: true },
    subCategoryID: { type: Types.ObjectId, ref: "SubCategory", required: true },
    colorsAndSizes: [
      {
        color: { type: String, default: null },
        size: {
          type: String,
          default: null,
          // enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
        },
        stock: {
          type: Number,
          default: 0,
        },
        soldItems: {
          type: Number,
          default: 0,
        },
      },
    ],
    overAllStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    // colors: [
    //   {
    //     color: String,
    //     stock: {
    //       type: Number,
    //       default: 0,
    //     },
    //     soldItems: {
    //       type: Number,
    //       default: 0,
    //     },
    //   },
    // ],
    // sizes: [
    //   {
    //     size: {
    //       type: String,
    //       enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    //     },
    //     stock: {
    //       type: Number,
    //       default: 0,
    //     },
    //     soldItems: {
    //       type: Number,
    //       default: 0,
    //     },
    //   },
    // ],
    specifications: Schema.Types.Mixed, //// To make specifications in an object. (For non-clothes products)
    price: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ["percentage", "amount", null] },
    discountFinishDate: Date,
    ProductItem_Details: String,
    discountFinished: { type: Boolean, default: true },
    paymentPrice: { type: Number, default: 0 },
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
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    rate: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, //EXP This causes an additional id field to appear in the response body.
    toObject: { virtuals: true },
  }
);

product_itemSchema.virtual("Reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productID",
});

const product_itemModel =
  model.Product_item || mongoose.model("Product_item", product_itemSchema);

export default product_itemModel;
