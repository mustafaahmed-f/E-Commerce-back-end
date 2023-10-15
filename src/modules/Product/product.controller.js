import productModel from "../../../DB/models/productModel.js";
import subcategoryModel from "../../../DB/models/subCategoryModel.js";
import categoryModel from "../../../DB/models/categoryModel.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import subCategoryModel from "../../../DB/models/subCategoryModel.js";
import brandsModel from "../../../DB/models/brandsModel.js";
import cloudinary from "../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import slugify from "slugify";

export const getEveryProduct = async (req, res, next) => {
  const products = await productModel.find();
  if (!products.length) {
    return next(new Error("No products were found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", products });
};

export const getAllProducts = async (req, res, next) => {
  const apiFeaturesInstance = new ApiFeatures(productModel.find(), req.query)
    .sort()
    .paignation()
    .filter()
    .select();
  const products = await apiFeaturesInstance.mongooseQuery;
  if (!products.length) {
    return next(new Error("No products were found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", products });
};

//===================================================================
//===================================================================

export const getSpecificProduct = async (req, res, next) => {
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
  const { _id } = req.query;
  const product = await productModel.findByIdAndDelete(_id);
  if (!product) {
    return next(new Error("No product was found !", { cause: 404 }));
  }
  //delete related images :
  if (product.images?.length || product.mainImage?.public_id) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.cloud_folder}/Products/${product.customID}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.cloud_folder}/Products/${product.customID}`
    );
  }
  res.status(200).json({ message: "Product has been deleted successfully !" });
};

//===================================================================
//===================================================================

export const addProduct = async (req, res, next) => {
  const {
    name,
    description,
    price,
    stock,
    colors,
    sizes,
    discount,
    discountType,
  } = req.body;
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

  const customID = nanoid();

  //==================================================================

  let images = [];
  let mainImage = "";
  //check for images
  if (req.files) {
    for (const image of req.files) {
      if (req.files.indexOf(image) === 0) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          image.path,
          {
            folder: `${process.env.cloud_folder}/Products/${customID}`,
          }
        );
        mainImage = { secure_url: `${secure_url}`, public_id: `${public_id}` };
      }
      if (req.files.indexOf(image) !== 0) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          image.path,
          {
            folder: `${process.env.cloud_folder}/Products/${customID}`,
          }
        );
        images.push({ secure_url: `${secure_url}`, public_id: `${public_id}` });
      }
    }

    req.imagePath = `${process.env.cloud_folder}/Products/${customID}`;
  }

  //==================================================================

  const slug = slugify(name, "_");
  let productPaymentPrice = 0;

  //check discount and it's type :
  if (discount) {
    if (!discountType || discountType == "percentage") {
      if (discount > 100 || discount < 0) {
        return next(
          new Error("Discount must be between 0 and 100 !", { cause: 400 })
        );
      }
      productPaymentPrice = price - (price * discount) / 100;
    }
    if (discountType == "amount") {
      if (discount < 0 || discount > price) {
        return next(
          new Error("Discount must be between 0 and price !", { cause: 400 })
        );
      }
      productPaymentPrice = price - discount;
    }
  } else {
    productPaymentPrice = price;
  }

  const product = await productModel.create({
    name,
    slug,
    description,
    price,
    discount,
    stock,
    colors,
    sizes,
    paymentPrice: productPaymentPrice,
    customID,
    images,
    mainImage,
    categoryID,
    subCategoryID,
    brandID,
    createdBy: req.user.id,
  });

  req.createdDoc = {
    model: productModel,
    _id: product._id,
  };

  if (!product) {
    //Delete all images:
    if (mainImage || images.length) {
      await cloudinary.api.delete_resources_by_prefix(
        `${process.env.cloud_folder}/Products/${customID}`
      );
      await cloudinary.api.delete_folder(
        `${process.env.cloud_folder}/Products/${customID}`
      );
    }

    return next(new Error("Failed to add product !", { cause: 404 }));
  }

  res.status(200).json({ message: "Product has been added successfully !" });
};

//===================================================================
//====================================================================

export const uploadImages = async (req, res, next) => {
  const { _id } = req.query;
  const product = await productModel.findById(_id);
  if (!product) {
    return next(new Error("Product is not found !", { cause: 404 }));
  }
  //check number of images :
  if (req.files.length + product.images.length > 5) {
    return next(
      new Error("You can't upload more than 5 secondary images !", {
        cause: 400,
      })
    );
  }

  let images = [];
  if (req.files) {
    for (const image of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image.path,
        {
          folder: `${process.env.cloud_folder}/Products/${product.customID}`,
        }
      );
      images.push({ secure_url: `${secure_url}`, public_id: `${public_id}` });
    }

    req.additionalImages = images;
  }

  const updatedProduct = await productModel.findByIdAndUpdate(
    _id,
    {
      $push: {
        images: [...images],
      },
    },
    {
      new: true,
    }
  );
  if (!updatedProduct) {
    return next(new Error("Failed to update product !", { cause: 404 }));
  }
  return res.status(200).json({
    message: "Product images has been updated successfully !",
    updatedProduct,
  });
};

//===================================================================
//===================================================================

export const updateProduct = async (req, res, next) => {};
