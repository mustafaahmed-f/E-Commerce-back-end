import brandsModel from "../../../DB/models/brandsModel.js";
import slugify from "slugify";
import cloudinary from "../../utils/cloudinary.js";
import { customAlphabet } from "nanoid";
import { ApiFeatures } from "../../utils/apiFeatures.js";
const nanoid = customAlphabet("12345678!_=abcdefghm*", 10);

export const getEveryBrand = async (req, res, next) => {
  const brands = await brandsModel.find();
  if (!brands.length) {
    return next(new Error("No brands were found", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", brands });
};

const getAllBrands = async (req, res, next) => {
  const apiFeaturesInstance = new ApiFeatures(brandsModel.find(), req.query)
    .sort()
    .paignation()
    .filter()
    .select();
  const brands = await apiFeaturesInstance.mongooseQuery;
  if (!brands.length) {
    return next(new Error("No brands were found", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", brands });
};

//============================================================================
//============================================================================

const addBrand = async (req, res, next) => {
  const { name } = req.body;

  const checkDublicatedName = await brandsModel.findOne({ name });
  if (checkDublicatedName) {
    return next(new Error("Name must be unique !", { cause: 400 }));
  }
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
    trim: true,
  });

  if (!req.file) {
    return next(new Error("Logo is required ", { cause: 400 }));
  }

  const customID = nanoid();

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.cloud_folder}/Brands/${customID}`,
    }
  );

  req.imagePath = `${process.env.cloud_folder}/Brands/${customID}`;

  const brand = await brandsModel.create({
    name,
    slug,
    customID,
    logo: { secure_url: secure_url, public_id: public_id },
    createdBy: req.user.id,
  });

  if (!brand) {
    await cloudinary.uploader.destroy(public_id);
    await cloudinary.api.delete_folder(req.imagePath);
    return res
      .status(500)
      .json({ message: "Something went wrong", cause: 500 });
  }

  req.createdDoc = {
    model: brandsModel,
    _id: brand._id,
  };

  return res
    .status(200)
    .json({ message: "Brand has been added successfully", brand });
};

//============================================================================
//============================================================================

const updateBrand = async (req, res, next) => {
  const { name } = req.body;
  const { _id } = req.query;

  const brand = await brandsModel.findOne({ _id });
  if (!brand) {
    return next(new Error("Brand not found!", { cause: 404 }));
  }

  if (name) {
    //check same old name:
    if (name.toLowerCase() === brand.name) {
      return next(
        new Error("New name can't be same as old one !", { cause: 400 })
      );
    }

    //check duplicated name
    const checkDuplicatedName = await brandsModel.findOne({
      name: name.toLowerCase(),
    });
    if (checkDuplicatedName) {
      return next(new Error("Name must be unique!", { cause: 400 }));
    }

    const slug = slugify(name, {
      replacement: "_",
      lower: true,
      trim: true,
    });

    brand.name = name;
    brand.slug = slug;
  }

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.cloud_folder}/Brands/${brand.customID}`,
      }
    );
    await cloudinary.uploader.destroy(brand.logo.public_id);

    brand.image = { secure_url: secure_url, public_id: public_id };
  }
  brand.updatedBy = req.user.id;
  brand
    .save()
    .then(() => {
      return res.status(200).json({ message: "Done", brand });
    })
    .catch(() => {
      return next(new Error("Something went wrong", { cause: 500 }));
    });
};

//============================================================================
//============================================================================

const deleteBrand = async (req, res, next) => {
  const { _id } = req.query;

  const brand = await brandsModel.findByIdAndDelete(_id);

  if (!brand) {
    return next(new Error("Brand not found", { cause: 404 }));
  }

  if (brand.logo?.public_id) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.cloud_folder}/Brands/${brand.customID}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.cloud_folder}/Brands/${brand.customID}`
    );
  }

  return res
    .status(200)
    .json({ message: "Brand has been successfully deleted !" });
};

//============================================================================
//============================================================================

const getSpecificBrand = async (req, res, next) => {
  const { _id } = req.params;
  console.log(_id);
  const brand = await brandsModel.findById(_id);
  if (!brand) {
    return next(new Error("No brand was found !", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", brand });
};

//============================================================================
//============================================================================

export { getAllBrands, addBrand, updateBrand, getSpecificBrand, deleteBrand };
