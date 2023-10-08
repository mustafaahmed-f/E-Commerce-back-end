import productModel from "../../../DB/models/productModel.js";
import subcategoryModel from "../../../DB/models/subCategoryModel.js";
import categoryModel from "../../../DB/models/categoryModel.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import subCategoryModel from "../../../DB/models/subCategoryModel.js";
import brandsModel from "../../../DB/models/brandsModel.js";

export const getAllProducts = async (req, res, next) => {
  const apiFeaturesInstance = new ApiFeatures(productModel.find(), req.query);
  const products = await apiFeaturesInstance.mongooseQuery;
  if (!products) {
    return next(new Error("No products were found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", products });
};

//===================================================================
//===================================================================

export const getSingleProduct = async (req, res, next) => {
  const { _id } = req.params;
  const product = await productModel.findById(_id);
  if (!product) {
    return next(new Error("No product was found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", product });
};

//===================================================================
//===================================================================

export const deleteProduct = async (req, res, next) => {
  const { _id } = req.params;
  const product = await productModel.findByIdAndDelete(_id);
  if (!product) {
    return next(new Error("No product was found !", { cause: 404 }));
  }
  //delete related images :
  if (product.images?.public_id || product.mainImage?.public_id) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.cloud_folder}/Products/${product.customID}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.cloud_folder}/Products/${product.customID}`
    );
  }
  res.status(200).json({ message: "Done", product });
};

//===================================================================
//===================================================================

export const addProduct = async (req, res, next) => {
  const { name, description, price, stock, colors, sizes, discount } = req.body;
  const { categoryID, subCategoryID, brandID } = req.query;

  //Check for category , subcategory and brand
  const category = await categoryModel.findById(categoryID);
  if (!category) {
    return next(new Error("Category was not found !", { cause: 404 }));
  }
  const subCategory = await subCategoryModel.findById(subCategoryID);
  if (!subCategory) {
    return next(new Error("SubCategory was not found !", { cause: 404 }));
  }
  const brand = await brandsModel.findById(brandID);
  if (!brand) {
    return next(new Error("Brand was not found !", { cause: 404 }));
  }
  //==================================================================
  //==================================================================
};
