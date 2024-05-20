import mongoose, { Schema, Types, model } from "mongoose";
import product_itemModel from "./product_itemModel.js";
import cloudinary from "../../src/utils/cloudinary.js";

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
      trim: true,
      lowercase: true,
      unique: true,
    },
    customID: String,

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
    overAllStock: { type: Boolean, default: true }, //// IF it has no colorsAndSizes, this will be true which
    //// means that it doesn't have different sizes and colors so it is a single item with a single stock number
    stock: { type: Number, default: 0 },
    soldItems: { type: Number, default: 0 },

    specifications: { type: Schema.Types.Mixed, default: null }, //// To make specifications in an object. (For non-clothes products)

    price: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ["percentage", "amount", null] },
    discountFinishDate: Date,
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

    rate: { type: Number, default: 0 },

    productDetails: {
      type: String,
      default: null,
    },

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

productSchema.virtual("Reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productID",
});

//// Hook for deleteing related images when product is deleted
productSchema.pre("findOneAndDelete", async function () {
  try {
    const product = await this.model.findOne({
      _id: this.getQuery()._id,
    });

    if (product.images?.length || product.mainImage?.public_id) {
      await cloudinary.api.delete_resources_by_prefix(
        `${process.env.cloud_folder}/Products/${product.customID}`
      );
      await cloudinary.api.delete_folder(
        `${process.env.cloud_folder}/Products/${product.customID}`
      );
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

const productModel = model.Product || mongoose.model("Product", productSchema);

export default productModel;
