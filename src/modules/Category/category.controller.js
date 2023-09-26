import categoryModel from "../../../DB/models/categoryModel.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("12345678!_=abcdefghm*", 10);
import cloudinary from "../../utils/cloudinary.js";
import subCategoryModel from "../../../DB/models/subCategoryModel.js";
import brandsModel from "../../../DB/models/brandsModel.js";
import { pagination } from "../../utils/pagination.js";

export const getAllCategories = async (req, res, next) => {
  const { page, size } = req.query;
  const { limit, skip } = pagination({ page, size });
  const categories = await categoryModel
    .find()
    .limit(limit)
    .skip(skip)
    .populate({
      path: "subCategories",
    });

  if (!categories.length) {
    return res.status(404).json({ message: "No categories were found !" });
  }
  return res.status(200).json({ message: "Done", Categories: categories });
};

export const addCategory = async (req, res, next) => {
  const { name } = req.body;

  const checkDublicatedName = await categoryModel.findOne({ name });
  if (checkDublicatedName) {
    return next(new Error("Category name is dublicated !", { cause: 400 }));
  }

  const slug = slugify(name, {
    replacement: "_",
    lower: true,
    trim: true,
  });
  const customID = nanoid();

  if (!req.file) {
    return next(new Error("Image is required", { cause: 400 }));
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.cloud_folder}/Categories/${customID}` }
  );

  req.imagePath = `${process.env.cloud_folder}/Categories/${customID}`;

  const category = await categoryModel.create({
    name,
    slug,
    customID,
    image: { secure_url, public_id },
  });

  if (!category) {
    await cloudinary.uploader.destroy(public_id);
    await cloudinary.api.delete_folder(req.imagePath);

    return next(new Error("Failed to add category", { Cause: 500 }));
  }
  return res
    .status(200)
    .json({ message: "Category has been added successfully !", category });
};

//================================================================================================

export const getSpecificCategory = async (req, res, next) => {
  const { categoryID } = req.params;
  const category = await categoryModel.findById(categoryID);
  if (!category) {
    return next(new Error("Category is not found!", { cause: 404 }));
  }
  return res.status(200).json({ messsage: "Done", category });
};

//================================================================================

export const updateCategory = async (req, res, next) => {
  const { categoryID } = req.query;

  const category = await categoryModel.findById(categoryID);

  if (!category) {
    return next(new Error("Category is not found !", { cause: 404 }));
  }

  const { name } = req.body;

  if (name) {
    if (name.toLowerCase() == category.name) {
      return next(
        new Error("New name can't be same as old one !", { cause: 400 })
      );
    }
    const checkDublicate = await categoryModel.findOne({ name });
    if (checkDublicate) {
      return next(new Error("Name must be unique", { cause: 400 }));
    }

    const slug = slugify(name, "_");
    category.name = name;
    category.slug = slug;
  }
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.cloud_folder}/Categories/${category.customID}` }
    );

    await cloudinary.uploader
      .destroy(category.image.public_id)
      .then((result) => {
        console.log(result);
      });
    category.image = { secure_url, public_id };
  }

  await category.save();
  return res
    .status(200)
    .json({ message: "Category has been updated successfully !", category });
};

export const deleteCategory = async (req, res, next) => {
  const { _id } = req.query;

  //DB
  //TODO : delete related products

  const checkSubCategoriesExistence = await subCategoryModel.find({
    categoryID: _id,
  });
  if (checkSubCategoriesExistence.length) {
    const deletedSubCategories = await subCategoryModel.deleteMany({
      categoryID: _id,
    });
    if (!deletedSubCategories.deletedCount) {
      return next(
        new Error("Failed to delete subCategories !", { cause: 500 })
      );
    }
  }

  // check products existence :
  //TODO : import product model and correct name if not the same name

  // const checkProductsExistence = await productModel.find({categoryID:_id})
  // if(checkProductsExistence.length) {
  //   const deletedProducts = await productModel.deleteMany({categoryID:_id})
  //   if(!deletedProducts.deletedCount) {return next(new Error("Failed to delete related products!", { cause: 500 }));}
  // }

  //host

  const deletedCategory = await categoryModel.findByIdAndDelete(_id);
  if (!deletedCategory) {
    return next(
      new Error("Failed to delete category or category is not found !", {
        cause: 500,
      })
    );
  }

  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.cloud_folder}/Categories/${deletedCategory.customID}`
  );
  await cloudinary.api.delete_folder(
    `${process.env.cloud_folder}/Categories/${deletedCategory.customID}`
  );

  return res
    .status(200)
    .json({ message: "Category has been deleted successfully." });
};
