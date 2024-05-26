import productModel from "../../../DB/models/productModel.js";

import categoryModel from "../../../DB/models/categoryModel.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import subCategoryModel from "../../../DB/models/subCategoryModel.js";
import brandsModel from "../../../DB/models/brandsModel.js";
import cloudinary from "../../utils/cloudinary.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("12345678!_=abcdefghmZxyiolk:*", 15);
import slugify from "slugify";

export const getEveryProduct = async (req, res, next) => {
  const products = await productModel.find().populate({
    path: "productItems",
    populate: {
      path: "Reviews",
    },
  });
  if (!products.length) {
    return next(new Error("No products were found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", products });
};

export const getAllProducts = async (req, res, next) => {
  console.log(req.query);
  const apiFeaturesInstance = new ApiFeatures(productModel.find(), req.query)
    .sort()
    .paignation()
    .filter()
    .select();

  console.log(apiFeaturesInstance.query);

  const numOfDocuments = await productModel.countDocuments(
    apiFeaturesInstance.query
  );

  console.log(numOfDoc);

  const products = await apiFeaturesInstance.mongooseQuery.populate(
    {
      path: "categoryID",
      select: "name",
    },

    { path: "subCategoryID", select: "name" },

    { path: "brandID", select: "name" }
  );

  if (!products.length) {
    return next(new Error("No products were found !", { cause: 404 }));
  }

  res.status(200).json({ message: "Done", products, numOfDocuments });
};

//===================================================================
//===================================================================

export const getSpecificProduct = async (req, res, next) => {
  const { _id } = req.params;
  const product = await productModel.findById(_id).populate({
    populate: {
      path: "categoryID",
      select: "name",
    },
    populate: {
      path: "subCategoryID",
      select: "name",
    },
    populate: {
      path: "brandID",
      select: "name",
    },
    populate: {
      path: "Reviews",
    },
  });
  if (!product) {
    return next(new Error("No product was found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", product });
};

//===================================================================
//===================================================================

export const deleteProduct = async (req, res, next) => {
  const { _id } = req.query;
  //Only admin added product and SuperAdmin can delete product:
  const checkCreator = await productModel.findOne({
    _id,
    createdBy: req.user.id,
  });
  if (!checkCreator) {
    if (req.user.role != userRole.superAdmin) {
      return next(new Error("You can't delete this product !", { cause: 400 }));
    }
  }

  const product = await productModel.findOneAndDelete({ _id });
  if (!product) {
    return next(new Error("No product was found !", { cause: 404 }));
  }

  res.status(200).json({ message: "Product has been deleted successfully !" });
};

//===================================================================
//===================================================================

export const addProduct = async (req, res, next) => {
  const {
    name,
    price,
    colorsAndSizes,
    productDetails,
    specifications,
    discount,
    discountType,
    discountFinishDate,
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
  const item_customID = nanoid();

  //==================================================================

  //check dublicated name for product and product item :
  const checkProductdublicatedName = await productModel.findOne({
    name,
  });
  if (checkProductdublicatedName) {
    return next(new Error("Product name is duplicated !", { cause: 400 }));
  }

  //==================================================================

  //TODO : remove comment from the below code that checks if there is a main image or not

  // if (!req.files.image) {
  //   return next(
  //     new Error("You should at least upload main image !", { cause: 400 })
  //   );
  // }

  //uploading main image :

  let mainImage = "";
  if (req.files?.image?.length) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.image[0].path,
      {
        folder: `${process.env.cloud_folder}/Products/${customID}/${item_customID}`,
      }
    );
    mainImage = { secure_url: `${secure_url}`, public_id: `${public_id}` };
  }

  let images = [];
  //check for images
  if (req.files?.images?.length) {
    const uploadPromises = req?.files?.images.map(async (image) => {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image.path,
        {
          folder: `${process.env.cloud_folder}/Products/${customID}`,
        }
      );
      return { secure_url: `${secure_url}`, public_id: `${public_id}` };
    });

    images = await Promise.all(uploadPromises);

    req.imagePath = `${process.env.cloud_folder}/Products/${customID}`;
  }

  //==================================================================

  const slug = slugify(name, "_");

  let productPaymentPrice = 0;

  //// Check if discount type or discountFinshData is sent without discount:

  if ((discountType || discountFinishDate) && !discount) {
    return next(new Error("Enter dicount ,please !", { cause: 400 }));
  }
  //check discount and it's type :
  if (discount) {
    if (!discountType) {
      return next(new Error("Enter dicount type ,please !", { cause: 400 }));
    }
    if (discountType == "percentage") {
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

    if (!discountFinishDate) {
      return next(
        new Error("Enter dicount finish date ,please !", { cause: 400 })
      );
    }
  } else {
    productPaymentPrice = price;
  }

  const product = await productModel.create({
    name,
    price,
    paymentPrice: productPaymentPrice,
    slug,
    categoryID,
    subCategoryID,
    brandID,
    colorsAndSizes,
    productDetails,
    specifications,
    discount,
    discountType,
    discountFinishDate,
    overAllStock: colorsAndSizes.length ? false : true,
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

  res.status(200).json({
    message: "Product has been added successfully !",
    product,
  });
};

//===================================================================
//===================================================================

//===================================================================
//====================================================================

export const uploadImages = async (req, res, next) => {
  //used to upload and remove old images from secodary images ONLY
  //To change main image , use the update API;

  const { _id, public_id } = req.query;

  const product = await productModel.findById(_id);
  if (!product) {
    return next(new Error("Product item is not found !", { cause: 404 }));
  }

  if (!req.files.length) {
    return next(
      new Error(
        "Please upload images. If you want to delete only, you can use the images deleting API.",
        { cause: 400 }
      )
    );
  }

  //Remove old images if public_id is sent
  if (public_id) {
    //check if this public_id is of the main image:

    //public id can be multiple values to delete multiple images, so we check if it is an array or not.
    if (!Array.isArray(public_id)) {
      //Prevent deleting main image
      if (product.mainImage.public_id == public_id) {
        return next(new Error("You can't delete main image !", { cause: 400 }));
      }
      await cloudinary.uploader.destroy(public_id).catch((err) => {
        throw new Error(err.message, { cause: 500 });
      });
    } else {
      if (public_id.includes(product.mainImage.public_id)) {
        return next(new Error("You can't delete main image !", { cause: 400 }));
      }
      await Promise.all(
        public_id.map(async (id) => {
          await cloudinary.uploader.destroy(id).catch((err) => {
            throw new Error(err.message, { cause: 500 });
          });
        })
      );
    }
    //Remove image from DB
    const deleteImages = await product.findByIdAndUpdate(_id, {
      $pull: { images: { public_id: public_id } },
    });
    if (!deleteImages) {
      return next(new Error("Failed to delete old images !", { cause: 404 }));
    }
  }

  //upload new images.

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
    await Promise.all(
      req.files.map(async (image) => {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          image.path,
          {
            folder: `${process.env.cloud_folder}/Products/${product.customID}`,
          }
        );
        images.push({ secure_url: `${secure_url}`, public_id: `${public_id}` });
      })
    );

    req.additionalImages = images;
  }

  const updatedProduct = await product.findByIdAndUpdate(
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

export const updateProduct = async (req, res, next) => {
  //Here you can update everything except secondary images. You can use uploadImages API to update secondary images.
  const {
    name,
    productDetails,
    colorsAndSizes,
    price,
    stock,
    discount,
    discountType,
    discountFinishDate,
    specifications,
    RcolorsAndSizes,
    overAllStock,
  } = req.body;
  const { categoryID, subCategoryID, brandID, _id } = req.query;

  const product = await productModel.findById(_id);
  if (!product) {
    return next(new Error("Product is not found !", { cause: 404 }));
  }

  if (product.overAllStock && colorsAndSizes) {
    return next(
      new Error("Product doesn't have colors and sizes !", { cause: 400 })
    );
  }

  let mainImage = null;
  //check if main image is updated.
  if (req.file) {
    await cloudinary.uploader.destroy(product.mainImage.public_id);

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.cloud_folder}/Products/${product.customID}`,
      }
    );

    mainImage = { secure_url, public_id };
  }

  let productPaymentPrice = product.productPaymentPrice;
  let currentPrice = product.price;
  if (price) {
    currentPrice = price;

    //update payment price if there is no change in discount:
    if (!discount) {
      if (product.discountType == "percentage") {
        productPaymentPrice =
          currentPrice - (currentPrice * product.discount) / 100;
      }
      if (product.discountType == "amount") {
        productPaymentPrice = currentPrice - product.discount;
      }
    }
  }

  //if discount is updated:
  //you should enter discount type:
  if (discount) {
    if (discountFinishDate == undefined && product.discountFinishDate == null) {
      return next(
        new Error(
          "Old discount period finished. Enter new discount period, please !",
          { cause: 400 }
        )
      );
    }
    await productModel.findByIdAndUpdate(_id, {
      discountFinished: false,
    });
    if (!discountType) {
      return next(new Error("Enter dicount type, please !", { cause: 400 }));
    }
    if (discountType == "percentage") {
      if (discount > 100 || discount < 0) {
        return next(
          new Error("Discount must be between 0 and 100 !", { cause: 400 })
        );
      }
      productPaymentPrice = currentPrice - (currentPrice * discount) / 100;
    }
    if (discountType == "amount") {
      if (discount < 0 || discount > currentPrice) {
        return next(
          new Error("Discount must be between 0 and price !", { cause: 400 })
        );
      }
      productPaymentPrice = currentPrice - discount;
    }
  }

  let slug = product.slug;
  //name change.
  if (name) {
    //check dublicated name:
    if (
      product.name.split(" ").join("").toLowerCase() ===
      name.split(" ").join("").toLowerCase()
    ) {
      return next(new Error("Name must be unique", { cause: 400 }));
    }
    slug = slugify(name, "_");
  }

  console.log(RcolorsAndSizes);

  let newColorsAndSizes = [];
  if (colorsAndSizes?.length) {
    newColorsAndSizes = [...product.colorsAndSizes, ...colorsAndSizes];
  } else if (RcolorsAndSizes?.length) {
    newColorsAndSizes = product.colorsAndSizes.filter((el) => {
      return !(
        el.color === RcolorsAndSizes[0].color &&
        el.size === RcolorsAndSizes[0].size
      );
    });
  } else {
    newColorsAndSizes = [...product.colorsAndSizes];
  }
  console.log(newColorsAndSizes);

  let newCategory = null;
  let newSubCategory = null;
  let newBrand = null;

  //check if category ID is sent:
  if (categoryID) {
    //check if category exists:
    const category = await categoryModel.findById(categoryID);
    if (!category) {
      return next(new Error("Category was not found !", { cause: 404 }));
    }
    newCategory = category._id;
  }
  //check if subCategory ID is sent:
  if (subCategoryID) {
    //check if subCategory exists:
    const subCategory = await subCategoryModel.findById(subCategoryID);
    if (!subCategory) {
      return next(new Error("SubCategory was not found !", { cause: 404 }));
    }
    newSubCategory = subCategory._id;
  }
  //check if brand ID is sent:
  if (brandID) {
    //check if brand exists:
    const brand = await brandsModel.findById(brandID);
    if (!brand) {
      return next(new Error("Brand was not found !", { cause: 404 }));
    }
    newBrand = brand._id;
  }

  const savedProduct = await productModel.findByIdAndUpdate(
    _id,
    {
      name,
      slug,
      productDetails,
      colorsAndSizes: newColorsAndSizes,
      specifications,
      stock,
      price: currentPrice,
      paymentPrice: productPaymentPrice,
      discount,
      discountType: discountType ?? product.discountType,
      discountFinishDate,
      mainImage,
      overAllStock: overAllStock ?? product.overAllStock,
      categoryID: newCategory ?? product.categoryID,
      subCategoryID: newSubCategory ?? product.subCategoryID,
      brandID: newBrand ?? product.brandID,
    },
    { new: true }
  );

  if (!savedProduct) {
    return next(new Error(" Couldn't save product ", { cause: 500 }));
  }
  return res.status(200).json({ message: "Success", product: savedProduct });
};

//===================================================================
//===================================================================

export const removeSpecificSecondaryImage = async (req, res, next) => {
  const { _id, public_id } = req.query;

  const product = await productModel.findById(_id);
  if (!product) {
    return next(new Error("Product item is not found !", { cause: 404 }));
  }

  if (!product.images?.length) {
    return next(new Error(" Couldn't find images", { cause: 404 }));
  }

  //Remove old images if public_id is sent
  if (public_id == undefined) {
    return next(
      new Error("Add public ids of images to be deleted !", { cause: 400 })
    );
  }

  //check if this public_id is of the main image:
  if (!Array.isArray(public_id)) {
    if (product.mainImage?.public_id == public_id) {
      return next(new Error("You can't delete main image !", { cause: 400 }));
    }
  } else {
    if (public_id.includes(product.mainImage?.public_id)) {
      return next(new Error("You can't delete main image !", { cause: 400 }));
    }
  }

  //Remove image from DB
  const deleteImages = await productModel.findByIdAndUpdate(_id, {
    $pull: { images: { public_id: public_id } },
  });
  if (!deleteImages) {
    return next(new Error("Failed to delete old images !", { cause: 404 }));
  }
  //public id can be multiple values to delete multiple images, so we check if it is an array or not.
  if (!Array.isArray(public_id)) {
    await cloudinary.uploader.destroy(public_id).catch((err) => {
      throw new Error(err.message, { cause: 500 });
    });
  } else {
    for (const id of public_id) {
      await cloudinary.uploader.destroy(id).catch((err) => {
        throw new Error(err.message, { cause: 500 });
      });
    }
  }

  return res.status(200).json({ message: "Images were successfully deleted!" });
};
