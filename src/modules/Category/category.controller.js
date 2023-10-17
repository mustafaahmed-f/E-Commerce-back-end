import categoryModel from "../../../DB/models/categoryModel.js";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("12345678!_=abcdefghm*", 10);
import cloudinary from "../../utils/cloudinary.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import { userRole } from "../../utils/userRoles.js";

export const getEveryCategory = async (req, res, next) => {
  const categories = await categoryModel.find();
  if (!categories.length) {
    return res.status(404).json({ message: "No categories were found !" });
  }
  return res.status(200).json({ message: "Done", Categories: categories });
};

export const getAllCategories = async (req, res, next) => {
  const apiFeaturesInstance = new ApiFeatures(categoryModel.find(), req.query)
    .sort()
    .paignation()
    .filter()
    .select();
  const categories = await apiFeaturesInstance.mongooseQuery;

  if (!categories.length) {
    return res.status(404).json({ message: "No categories were found !" });
  }
  return res.status(200).json({ message: "Done", Categories: categories });
};

//===============================================================================
//===============================================================================

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
    createdBy: req.user.id,
    image: { secure_url, public_id },
  });

  if (!category) {
    await cloudinary.uploader.destroy(public_id);
    await cloudinary.api.delete_folder(req.imagePath);

    return next(new Error("Failed to add category", { Cause: 500 }));
  }

  req.createdDoc = {
    model: categoryModel,
    _id: category._id,
  };

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
  category.updatedBy = req.user.id;

  await category.save();
  return res
    .status(200)
    .json({ message: "Category has been updated successfully !", category });
};

export const deleteCategory = async (req, res, next) => {
  const { _id } = req.query;
  //Only superAdmin can delete product

  //DB
  //deleting related products
  //It occurs throw hooks in plugin

  //Deleting related subcategories:
  //It occurs throw hooks in plugin

  //host

  const deletedCategory = await categoryModel.findByIdAndDelete(_id);
  if (!deletedCategory) {
    return next(
      new Error("Failed to delete category or category is not found !", {
        cause: 500,
      })
    );
  }

  if (deleteCategory.image?.public_id) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.cloud_folder}/Categories/${deletedCategory.customID}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.cloud_folder}/Categories/${deletedCategory.customID}`
    );
  }

  return res
    .status(200)
    .json({ message: "Category has been deleted successfully." });
};
