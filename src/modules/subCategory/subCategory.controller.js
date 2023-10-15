import { asyncHandler } from "../../utils/errorHandler.js";
import subCategoryModel from "../../../DB/models/subCategoryModel.js";
import slugify from "slugify";
import cloudinary from "../../utils/cloudinary.js";
import categoryModel from "../../../DB/models/categoryModel.js";
import { customAlphabet } from "nanoid";
import brandsModel from "../../../DB/models/brandsModel.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import productModel from "../../../DB/models/productModel.js";
const nanoid = customAlphabet("12345678!_=abcdefghm*", 10);

const getEverySubCategory = asyncHandler(async (req, res, next) => {
  const subCategories = await subCategoryModel.find();
  if (!subCategories.length) {
    return next(new Error("No subCategories were found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", subCategories });
});

const addSubCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { categoryId } = req.query;
  const checkCategoryExistence = await categoryModel.findById(categoryId);
  if (!checkCategoryExistence) {
    return next(new Error("Category not found ! ", { cause: 400 }));
  }

  const checkDublicatedname = await subCategoryModel.findOne({ name });
  if (checkDublicatedname) {
    return next(new Error("Name must be unique !", { cause: 400 }));
  }
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
    trim: true,
  });

  if (!req.file) {
    return next(new Error("Image is required", { cause: 400 }));
  }
  const customID = nanoid();

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.cloud_folder}/Categories/${checkCategoryExistence.customID}/subCategories/${customID}`,
    }
  );

  req.imagePath = `${process.env.cloud_folder}/Categories/${checkCategoryExistence.customID}/subCategories/${customID}`;

  const subCategory = await subCategoryModel.create({
    name,
    slug,
    categoryID: categoryId,
    customID,
    image: { public_id, secure_url },
    createdBy: req.user.id,
  });

  if (!subCategory) {
    await cloudinary.uploader.destroy(public_id);
    await cloudinary.api.delete_folder(req.imagePath);
    return next(new Error("Something went wrong! ", { cause: 500 }));
  }

  req.createdDoc = {
    model: subCategoryModel,
    _id: subCategory._id,
  };

  return res.status(201).json({ message: "Done", subCategory });
});

//======================================================================
//======================================================================

const getAllSubCategories = asyncHandler(async (req, res, next) => {
  const apiFeaturesInstance = new ApiFeatures(
    subCategoryModel.find(),
    req.query
  )
    .select()
    .filter()
    .sort()
    .paignation();

  // .populate({
  //   path: "categoryID",
  // });

  const subCategories = await apiFeaturesInstance.mongooseQuery;

  if (!subCategories.length) {
    return next(new Error("No SubCategories were found !", { cause: 400 }));
  }
  return res
    .status(200)
    .json({ message: "Done", subCategories: subCategories });
});

//======================================================================
//======================================================================

const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { subCategoryId, categoryId } = req.query;
  const checkCreator = await subCategoryModel.findOne({
    _id: subCategoryId,
    createdBy: req.user.id,
  });
  if (!checkCreator && req.user.role != userRole.superAdmin) {
    return next(
      new Error("You can't update this sub-category!", { cause: 400 })
    );
  }

  const subCategory = await subCategoryModel.findById(subCategoryId);
  let newCategory = null;

  if (!subCategory) {
    return next(new Error("No SubCategory was found", { cause: 404 }));
  }

  const currentCategory = await categoryModel.findById(subCategory.categoryID);

  if (categoryId && categoryId !== subCategory.categoryID) {
    newCategory = await categoryModel.findById(categoryId);
    if (!newCategory) {
      return next(new Error("Category not found", { cause: 404 }));
    }
  }

  if (name) {
    //check same as old :
    if (name.toLowerCase() == subCategory.name) {
      return next(
        new Error("New name shouldn't be same as old", { cause: 400 })
      );
    }

    //check unique name
    const checkDublicatedName = await subCategoryModel.find({ name });
    if (checkDublicatedName) {
      return next(new Error("Name must be unique", { cause: 400 }));
    }

    slug = slugify(name, "_");
    subCategory.name = name;
    subCategory.slug = slug;
  }

  //If category is changed and a new image is uploaded :

  if (req.file) {
    if (categoryId && categoryId != subCategory.categoryID) {
      await cloudinary.uploader.destroy(subCategory.image.public_id);
      await cloudinary.api.delete_folder(
        `${process.env.cloud_folder}/Categories/${currentCategory.customID}/subCategories/${subCategory.customID}`
      );

      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `${process.env.cloud_folder}/Categories/${newCategory.customID}/subCategories/${subCategory.customID}`,
        }
      );

      subCategory.image = { secure_url, public_id };
    } else {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `${process.env.cloud_folder}/Categories/${currentCategory.customID}/subCategories/${subCategory.customID}`,
        }
      );
      await cloudinary.uploader.destroy(subCategory.image.public_id);
      subCategory.image = { secure_url, public_id };
    }
  } else {
    //If category is changed without uploading new image :

    if (categoryId && categoryId !== subCategory.categoryID) {
      //change location of image To the new category :

      const publicID = subCategory.image.public_id.split("/");
      const imageName = publicID[publicID.length - 1];

      await cloudinary.uploader.rename(
        subCategory.image.public_id,
        `${process.env.cloud_folder}/Categories/${newCategory.customID}/subCategories/${subCategory.customID}/${imageName}`
      );
      await cloudinary.uploader.destroy(subCategory.image.public_id);
      await cloudinary.api.delete_folder(
        `${process.env.cloud_folder}/Categories/${currentCategory.customID}/subCategories/${subCategory.customID}`
      );
      //save new public_id :
      subCategory.image.public_id = `${process.env.cloud_folder}/Categories/${newCategory.customID}/subCategories/${subCategory.customID}/${imageName}`;
      //save new secure_url :

      let old_secure_url = subCategory.image.secure_url;
      let old_url_array = old_secure_url.split("/");
      let indexOfCategories = old_url_array.indexOf("Categories");
      old_url_array[indexOfCategories + 1] = `${newCategory.customID}`;
      let new_url = old_url_array.join("/");
      subCategory.image.secure_url = new_url;
    }
  }

  subCategory.categoryID = newCategory._id;
  subCategory.updatedBy = req.user.id;
  await subCategory.save();
  return res.status(200).json({ message: "Done", subCategory });
});

//======================================================================
//======================================================================

const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.query;

  const checkCreator = await subCategoryModel.findOne({
    _id: subCategoryId,
    createdBy: req.user.id,
  });

  if (!checkCreator && req.user.role != userRole.superAdmin) {
    return next(
      new Error("You can't delete this sub-category!", { cause: 400 })
    );
  }
  const subCategory = await subCategoryModel.findById(subCategoryId);
  const category = await categoryModel.findById(subCategory.categoryID);

  if (!subCategory) {
    return next(new Error("Sub-category is not found !", { cause: 500 }));
  }

  //deleting related products
  //It occurs throw hooks in plugin

  if (subCategory.image?.public_id) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.cloud_folder}/Categories/${category.customID}/subCategories/${subCategory.customID}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.cloud_folder}/Categories/${category.customID}/subCategories/${subCategory.customID}`
    );
  }

  const deletedSubCategory = await subCategoryModel.findByIdAndDelete(
    subCategoryId
  );
  if (!deletedSubCategory) {
    return next(new Error("Failed to delete sub category", { cause: 500 }));
  }

  return res
    .status(200)
    .json({ message: "subCategory has been deleted successfully" });
});

//============================================================================

const getSpecificSubCategory = async (req, res, next) => {
  const { subCategoryId } = req.params;
  const subCategory = await subCategoryModel.findById(subCategoryId);
  if (!subCategory) {
    return next(new Error("No SubCategory was found", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", subCategory });
};

export {
  addSubCategory,
  getAllSubCategories,
  updateSubCategory,
  deleteSubCategory,
  getSpecificSubCategory,
  getEverySubCategory,
};
