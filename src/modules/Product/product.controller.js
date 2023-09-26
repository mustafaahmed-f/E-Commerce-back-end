import productModel from "../../../DB/models/productModel.js";
import subcategoryModel from "../../../DB/models/subCategoryModel.js";
import categoryModel from "../../../DB/models/categoryModel.js";

export const getAllProducts = async (req, res, next) => {
  const { page, size } = req.query;
  const { limit, skip } = pagination({ page, size });
  const products = await productModel.find().limit(limit).skip(skip);
  if (!products) {
    return next(new Error("No products were found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", products });
};
