import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const addProduct = {
  body: joi
    .object({
      name: joi
        .string()
        .min(2)
        .max(35)
        .pattern(new RegExp(/^[a-zA-Z0-9 ]{2,35}$/))
        .required(),
      // validation for first product item :
      item_name: joi
        .string()
        .min(2)
        .max(35)
        .pattern(new RegExp(/^[a-zA-Z0-9 ]{2,35}$/))
        .required(),
      color: joi
        .string()
        .pattern(new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)), //Hexadecimal color,
      size: joi.string().valid("XS", "S", "M", "L", "XL", "XXL", "XXXL"),
      specifications: joi.object(),
      description: joi.string().min(10).max(500),
      price: joi.number().required(),
      discount: joi.number(),
      discountType: joi.string().valid("percentage", "amount"),
      discountPeriod: joi.number().min(0),
      stock: joi.number().required(),
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  query: joi
    .object({
      categoryID: generalValidation._id.required(),
      subCategoryID: generalValidation._id.required(),
      brandID: generalValidation._id.required(),
    })
    .required(),
};

export const addProductItem = {
  body: joi
    .object({
      item_name: joi
        .string()
        .min(2)
        .max(35)
        .pattern(new RegExp(/^[a-zA-Z0-9 ]{2,35}$/))
        .required(),
      color: joi
        .string()
        .pattern(new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)), //Hexadecimal color,
      size: joi.string().valid("XS", "S", "M", "L", "XL", "XXL", "XXXL"),
      specifications: joi.object(),
      description: joi.string().min(10).max(500),
      price: joi.number().required(),
      discount: joi.number(),
      discountType: joi.string().valid("percentage", "amount"),
      discountPeriod: joi.number().min(0),
      stock: joi.number().required(),
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  query: joi
    .object({
      productID: generalValidation._id.required(),
    })
    .required(),
};

export const uploadImages = {
  query: joi
    .object({
      _id: generalValidation._id.required(),
      public_id: joi.alternatives([
        joi
          .string()
          .pattern(new RegExp(/^eCommerce\/Products\/.+\/[A-Za-z0-9]+$/)),
        joi
          .array()
          .items(
            joi
              .string()
              .pattern(new RegExp(/^eCommerce\/Products\/.+\/[A-Za-z0-9]+$/))
          ),
      ]),
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const deleteProduct = {
  query: joi
    .object({
      _id: generalValidation._id.required(),
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const getSpecificProduct = {
  params: joi.object({
    _id: generalValidation._id.required(),
  }),
};

export const updateProductItem = {
  body: joi
    .object({
      item_name: joi
        .string()
        .min(2)
        .max(35)
        .pattern(new RegExp(/^[a-zA-Z0-9 ]{2,35}$/)),
      color: joi
        .string()
        .pattern(new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)),
      size: joi.string().valid("XS", "S", "M", "L", "XL", "XXL", "XXXL"),
      description: joi.string().min(10).max(500),
      price: joi.number(),
      discount: joi.number(),
      discountType: joi.string().valid("percentage", "amount"),
      discountPeriod: joi.number().min(0),
      stock: joi.number(),
      specifications: joi.object(),
    })
    .required(),
  query: joi
    .object({
      _id: generalValidation._id.required(),
      productID: generalValidation._id,
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const updateProduct = {
  body: joi.object({
    name: joi
      .string()
      .min(2)
      .max(35)
      .pattern(new RegExp(/^[a-zA-Z0-9 ]{2,35}$/)),
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  query: joi
    .object({
      _id: generalValidation._id.required(),
      categoryID: generalValidation._id,
      subCategoryID: generalValidation._id,
      brandID: generalValidation._id,
    })
    .required(),
};

export const removeSpecificSecondaryImage = {
  query: joi
    .object({
      _id: generalValidation._id.required(),
      public_id: joi.alternatives([
        joi
          .string()
          .pattern(new RegExp(/^eCommerce\/Products\/.+\/[A-Za-z0-9]+$/)),
        joi
          .array()
          .items(
            joi
              .string()
              .pattern(new RegExp(/^eCommerce\/Products\/.+\/[A-Za-z0-9]+$/))
          ),
      ]),
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};
