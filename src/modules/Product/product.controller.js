import productModel from "../../../DB/models/productModel.js";
import subcategoryModel from "../../../DB/models/subCategoryModel.js";
import categoryModel from "../../../DB/models/categoryModel.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import subCategoryModel from "../../../DB/models/subCategoryModel.js";
import brandsModel from "../../../DB/models/brandsModel.js";
import cloudinary from "../../utils/cloudinary.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("12345678!_=abcdefghmZxyiolk:*", 15);
import slugify from "slugify";
import product_itemModel from "../../../DB/models/product_itemModel.js";

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
  const apiFeaturesInstance = new ApiFeatures(productModel.find(), req.query)
    .sort()
    .paignation()
    .filter()
    .select();
  const products = await apiFeaturesInstance.mongooseQuery.populate({
    path: "productItems",
    populate: {
      path: "Reviews",
      populate: {
        path: "userID",
        select: "userName",
      },
    },
  });
  // console.log(products);
  if (!products.length) {
    return next(new Error("No products were found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", products });
};

//===================================================================
//===================================================================

export const getSpecificProduct = async (req, res, next) => {
  const { _id } = req.params;
  const product = await productModel.findById(_id).populate({
    path: "productItems",
  });
  if (!product) {
    return next(new Error("No product was found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", product });
};

//===================================================================
//===================================================================

export const getSpecificProductItem = async (req, res, next) => {
  const { _id } = req.params;
  const productItem = await product_itemModel.findById(_id).populate({
    path: "Reviews",
    populate: {
      path: "userID",
      select: "userName",
    },
  });
  if (!productItem) {
    return next(new Error("No product item was found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", productItem });
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

  const product = await productModel.findByIdAndDelete(_id);
  if (!product) {
    return next(new Error("No product was found !", { cause: 404 }));
  }

  res.status(200).json({ message: "Product has been deleted successfully !" });
};

//===================================================================
//===================================================================

export const deleteProductItem = async (req, res, next) => {
  const { _id } = req.query;
  //Only admin added product and SuperAdmin can delete product:
  const checkCreator = await product_itemModel.findOne({
    _id,
    createdBy: req.user.id,
  });
  if (!checkCreator) {
    if (req.user.role != userRole.superAdmin) {
      return next(new Error("You can't delete this product !", { cause: 400 }));
    }
  }

  const productItem = await product_itemModel.findByIdAndDelete(_id);
  if (!productItem) {
    return next(new Error("No product was found !", { cause: 404 }));
  }
  const product = await productModel.findById(productItem.productID);
  if (!product) {
    return next(new Error("No product was found !", { cause: 404 }));
  }

  //delete related images:
  if (productItem.images?.length || productItem.mainImage?.public_id) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.cloud_folder}/Products/${product.customID}/${productItem.item_customID}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.cloud_folder}/Products/${product.customID}/${productItem.item_customID}`
    );
  }

  res
    .status(200)
    .json({ message: "Product item has been deleted successfully !" });
};

//===================================================================
//===================================================================

let discountTimer = null;

export const addProduct = async (req, res, next) => {
  const {
    name,
    description,
    price,
    stock,
    color,
    size,
    item_name,
    specifications,
    discount,
    discountType,
    discountPeriod,
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

  const checkProductItemdublicatedName = await product_itemModel.findOne({
    item_name,
  });
  if (checkProductItemdublicatedName) {
    return next(new Error("Product Item name is duplicated !", { cause: 400 }));
  }

  //==================================================================

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
    for (const image of req.files.images) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image.path,
        {
          folder: `${process.env.cloud_folder}/Products/${customID}/${item_customID}`,
        }
      );
      images.push({ secure_url: `${secure_url}`, public_id: `${public_id}` });
    }

    req.imagePath = `${process.env.cloud_folder}/Products/${customID}`;
  }
  if (!req.files.image) {
    return next(
      new Error("You should at least upload main image !", { cause: 400 })
    );
  }

  //==================================================================

  const slug = slugify(name, "_");
  const item_slug = slugify(item_name, "_");
  let productPaymentPrice = 0;

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
    if (discountPeriod) {
      discountTimer = setTimeout(async function () {
        console.log("period added and finished");
        await product_itemModel.findOneAndUpdate(
          { item_customID },
          {
            discount: null,
            discountType: null,
            discountPeriod: null,
            discountFinished: true,
            paymentPrice: price,
          }
        );
      }, parseInt(discountPeriod));
    }
  } else {
    productPaymentPrice = price;
  }

  const product = await productModel.create({
    name,
    slug,
    customID,
    categoryID,
    subCategoryID,
    brandID,
    createdBy: req.user.id,
  });

  const productItem = await product_itemModel.create({
    productID: product._id,
    specifications,
    item_name,
    item_customID,
    item_slug,
    description,
    price,
    discount,
    discountType,
    discountPeriod,
    stock,
    color,
    size,
    paymentPrice: productPaymentPrice,
    customID,
    images,
    mainImage,
    createdBy: req.user.id,
  });

  req.createdDoc = {
    model: productModel,
    _id: product._id,
  };

  req.createdDoc1 = {
    model: product_itemModel,
    _id: productItem._id,
  };

  if (!product || !productItem) {
    //Delete all images:
    if (mainImage || images.length) {
      await cloudinary.api.delete_resources_by_prefix(
        `${process.env.cloud_folder}/Products/${customID}/${item_customID}`
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
    productItem,
  });
};

//===================================================================
//===================================================================

export const addProductItem = async (req, res, next) => {
  const {
    item_name,
    description,
    price,
    stock,
    color,
    size,
    specifications,
    discount,
    discountType,
    discountPeriod,
  } = req.body;
  const { productID } = req.query;

  //Check for category , subcategory and brand

  const item_customID = nanoid();

  //check product existence:
  const product = await productModel.findById(productID);
  if (!product) {
    return next(new Error("Product not found !", { cause: 404 }));
  }

  //==================================================================

  //check dublicated name  product item :

  const checkProductItemdublicatedName = await product_itemModel.findOne({
    item_name,
  });
  if (checkProductItemdublicatedName) {
    return next(new Error("Product Item name is duplicated !", { cause: 400 }));
  }

  //==================================================================

  //uploading main image :

  let mainImage = "";
  if (req.files?.image?.length) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.image[0].path,
      {
        folder: `${process.env.cloud_folder}/Products/${product.customID}/${item_customID}`,
      }
    );
    mainImage = { secure_url: `${secure_url}`, public_id: `${public_id}` };
  }

  let images = [];
  //check for images
  if (req.files?.images?.length) {
    for (const image of req.files.images) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image.path,
        {
          folder: `${process.env.cloud_folder}/Products/${product.customID}/${item_customID}`,
        }
      );
      images.push({ secure_url: `${secure_url}`, public_id: `${public_id}` });
    }

    req.imagePath = `${process.env.cloud_folder}/Products/${product.customID}`;
  }
  if (!req.files.image) {
    return next(
      new Error("You should at least upload main image !", { cause: 400 })
    );
  }

  //==================================================================

  const item_slug = slugify(item_name, "_");
  let productPaymentPrice = 0;

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
    if (discountPeriod) {
      discountTimer = setTimeout(async function () {
        console.log("period added and finished");
        await product_itemModel.findOneAndUpdate(
          { item_customID },
          {
            discount: null,
            discountType: null,
            discountPeriod: null,
            discountFinished: true,
            paymentPrice: price,
          }
        );
      }, parseInt(discountPeriod));
    }
  } else {
    productPaymentPrice = price;
  }

  const productItem = await product_itemModel.create({
    productID: product._id,
    specifications,
    item_name,
    item_customID,
    item_slug,
    description,
    price,
    discount,
    discountType,
    discountPeriod,
    stock,
    color,
    size,
    paymentPrice: productPaymentPrice,
    images,
    mainImage,
    createdBy: req.user.id,
  });

  req.createdDoc = {
    model: product_itemModel,
    _id: productItem._id,
  };

  if (!productItem) {
    //Delete all images:
    if (mainImage || images.length) {
      await cloudinary.api.delete_resources_by_prefix(
        `${process.env.cloud_folder}/Products/${product.customID}/${item_customID}`
      );
      await cloudinary.api.delete_folder(
        `${process.env.cloud_folder}/Products/${product.customID}`
      );
    }

    return next(new Error("Failed to add product item !", { cause: 404 }));
  }

  res.status(200).json({
    message: "Product item has been added successfully !",
    productItem,
  });
};

//===================================================================
//====================================================================

export const uploadImages = async (req, res, next) => {
  //used to upload and remove old images from secodary images ONLY
  //To change main image , use the update API;

  const { _id, public_id } = req.query;

  const productItem = await product_itemModel.findById(_id);
  if (!productItem) {
    return next(new Error("Product item is not found !", { cause: 404 }));
  }

  const product = await productModel.findOne({ _id: productItem.productID });
  if (!product) {
    return next(new Error("Product is not found !", { cause: 404 }));
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
      if (productItem.mainImage.public_id == public_id) {
        return next(new Error("You can't delete main image !", { cause: 400 }));
      }
      await cloudinary.uploader.destroy(public_id).catch((err) => {
        throw new Error(err.message, { cause: 500 });
      });
    } else {
      if (public_id.includes(productItem.mainImage.public_id)) {
        return next(new Error("You can't delete main image !", { cause: 400 }));
      }
      for (const id of public_id) {
        await cloudinary.uploader.destroy(id).catch((err) => {
          throw new Error(err.message, { cause: 500 });
        });
      }
    }
    //Remove image from DB
    const deleteImages = await productItem.findByIdAndUpdate(_id, {
      $pull: { images: { public_id: public_id } },
    });
    if (!deleteImages) {
      return next(new Error("Failed to delete old images !", { cause: 404 }));
    }
  }

  //upload new images.

  //check number of images :
  if (req.files.length + productItem.images.length > 5) {
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
          folder: `${process.env.cloud_folder}/Products/${product.customID}/${productItem.item_customID}`,
        }
      );
      images.push({ secure_url: `${secure_url}`, public_id: `${public_id}` });
    }

    req.additionalImages = images;
  }

  const updatedProductItem = await product_itemModel.findByIdAndUpdate(
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
  if (!updatedProductItem) {
    return next(new Error("Failed to update product !", { cause: 404 }));
  }
  return res.status(200).json({
    message: "Product images has been updated successfully !",
    updatedProductItem,
  });
};

//===================================================================
//===================================================================

export const updateProductItem = async (req, res, next) => {
  //Here you can update everything except secondary images. You can use uploadImages API to update secondary images.
  const {
    item_name,
    description,
    price,
    stock,
    color,
    size,
    discount,
    discountType,
    discountPeriod,
    specifications,
  } = req.body;
  const { _id, productID } = req.query;

  const productItem = await product_itemModel.findById(_id);
  if (!productItem) {
    return next(new Error("Product item is not found !", { cause: 404 }));
  }
  const product = await productModel.findOne({ _id: productID });
  if (!product) {
    return next(new Error("Product is not found !", { cause: 404 }));
  }

  let mainImage = null;
  //check if main image is updated.
  if (req.file) {
    await cloudinary.uploader.destroy(productItem.mainImage.public_id);

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.cloud_folder}/Products/${product.customID}/${productItem.item_customID}`,
      }
    );

    mainImage = { secure_url, public_id };
  }

  let productPaymentPrice = productItem.productPaymentPrice;
  let currentPrice = productItem.price;
  if (price) {
    currentPrice = price;

    //update price if not new period:
    if (!discountPeriod) {
      clearTimeout(discountTimer);
      discountTimer = setTimeout(async function () {
        console.log("price updated and finished");
        await product_itemModel.findByIdAndUpdate(
          { _id },
          {
            discount: null,
            discountType: null,
            discountPeriod: null,
            discountFinished: true,
            paymentPrice: price,
          }
        );
      }, parseInt(productItem.discountPeriod));
    }
    //update payment price if there is no change in discount:
    if (!discount) {
      if (productItem.discountType == "percentage") {
        productPaymentPrice =
          currentPrice - (currentPrice * productItem.discount) / 100;
      }
      if (productItem.discountType == "amount") {
        productPaymentPrice = currentPrice - productItem.discount;
      }
    }
  }

  //If period is updated:
  if (discountPeriod) {
    if (productItem.discount == null && discount == undefined) {
      return next(new Error("Add new discount", { cause: 400 }));
    }
    clearTimeout(discountTimer);
    discountTimer = setTimeout(async function () {
      console.log("period updated and finished");
      await product_itemModel.findByIdAndUpdate(
        { _id },
        {
          discount: null,
          discountType: null,
          discountPeriod: null,
          discountFinished: true,
          paymentPrice: currentPrice,
        }
      );
    }, parseInt(discountPeriod));
  }

  //if discount is updated:
  //you should enter discount type:
  if (discount) {
    if (discountPeriod == undefined && productItem.discountPeriod == null) {
      return next(
        new Error(
          "Old discount period finished. Enter new discount period, please !",
          { cause: 400 }
        )
      );
    }
    await product_itemModel.findByIdAndUpdate(_id, {
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

  let slug = productItem.item_slug;
  //name change.
  if (item_name) {
    //check dublicated name:
    if (
      productItem.item_name.split(" ").join("").toLowerCase() ===
      item_name.split(" ").join("").toLowerCase()
    ) {
      return next(new Error("Name must be unique", { cause: 400 }));
    }
    slug = slugify(item_name, "_");
  }

  let productColor = productItem.color;
  let productSize = productItem.size;
  if (color) {
    productColor = color;
  }

  if (size) {
    productSize = size;
  }

  const savedProductItem = await product_itemModel.findByIdAndUpdate(
    _id,
    {
      size: productSize,
      color: productColor,
      item_name,
      item_slug: slug,
      description,
      specifications,
      stock,
      price: currentPrice,
      paymentPrice: productPaymentPrice,
      discount,
      discountType: discountType ?? productItem.discountType,
      discountPeriod,
      productID,
      mainImage,
    },
    { new: true }
  );

  if (!savedProductItem) {
    return next(new Error(" Couldn't save product item ", { cause: 500 }));
  }
  return res
    .status(200)
    .json({ message: "Success", product_Item: savedProductItem });
};

//===================================================================
//===================================================================

export const updateProduct = async (req, res, next) => {
  const { name } = req.body;
  const { categoryID, subCategoryID, brandID, _id } = req.query;

  //check product existence:
  const product = await productModel.findById(_id);
  if (!product) {
    return next(new Error("Product is not found !", { cause: 404 }));
  }

  let newCategory = null;
  let newSubCategory = null;
  let newBrand = null;
  let newName = null;
  let newSlug = null;

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
  //check if name is exist and check name duplication:
  if (name) {
    //check dublicated name:
    if (
      product.name.split(" ").join("").toLowerCase() ===
      name.split(" ").join("").toLowerCase()
    ) {
      return next(new Error("Name must be unique", { cause: 400 }));
    }
    newName = name;
    newSlug = slugify(newName, "_");
  }

  const savedProduct = await productModel.findByIdAndUpdate(
    _id,
    {
      name: newName ?? product.name,
      categoryID: newCategory ?? product.categoryID,
      subCategoryID: newSubCategory ?? product.subCategoryID,
      brandID: newBrand ?? product.brandID,
      slug: newSlug ?? product.slug,
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

  const productItem = await product_itemModel.findById(_id);
  if (!productItem) {
    return next(new Error("Product item is not found !", { cause: 404 }));
  }

  if (!productItem.images?.length) {
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
    if (productItem.mainImage?.public_id == public_id) {
      return next(new Error("You can't delete main image !", { cause: 400 }));
    }
  } else {
    if (public_id.includes(productItem.mainImage?.public_id)) {
      return next(new Error("You can't delete main image !", { cause: 400 }));
    }
  }

  //Remove image from DB
  const deleteImages = await product_itemModel.findByIdAndUpdate(_id, {
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
