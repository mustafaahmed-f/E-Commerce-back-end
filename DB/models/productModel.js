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
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    customID: String,
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

//Hook for deleteing related product items when product is deleted
productSchema.pre("findOneAndDelete", async function () {
  try {
    const product = await this.model.findOne({
      _id: this.getQuery()._id,
    });
    const productItems = await product_itemModel.find({
      productID: this.getQuery()._id,
    });

    if (productItems.length > 0) {
      for (let i = 0; i < productItems.length; i++) {
        if (
          productItems[i].images?.length ||
          productItems[i].mainImage?.public_id
        ) {
          await cloudinary.api.delete_resources_by_prefix(
            `${process.env.cloud_folder}/Products/${product.customID}`
          );
          await cloudinary.api.delete_folder(
            `${process.env.cloud_folder}/Products/${product.customID}`
          );
        }
      }
    }

    await product_itemModel.deleteMany({
      productID: this.getQuery()._id,
    });
  } catch (error) {
    console.log(error);
  }
});

const productModel = model.Product || mongoose.model("Product", productSchema);

export default productModel;
