import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const addProduct = {
  body: joi
    .object({
      name: joi
        .string()
        .min(2)
        .max(35)
        // .pattern(new RegExp(/^[a-zA-Z0-9 ]{2,35}$/))
        .required(),
      // validation for first product item :

      stock: joi.number().min(0),
      colorsAndSizes: joi.array().items(
        joi.object({
          color: joi.string(),
          size: joi.string(),

          stock: joi.number(),
          soldItems: joi.number(),
        })
      ),
      specifications: joi.object(),
      price: joi.number().required(),
      discount: joi.number(),
      productDetails: joi.string(),
      discountType: joi.string().valid("percentage", "amount"),
      discountFinishDate: joi
        .date()
        .iso()
        .greater(joi.ref("fromDate"))
        .default(null),
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

export const updateProduct = {
  body: joi.object({
    name: joi
      .string()
      .min(2)
      .max(35)
      .pattern(new RegExp(/^[a-zA-Z0-9 ]{2,35}$/)),
    price: joi.number(),
    discount: joi.number(),
    discountType: joi.string().valid("percentage", "amount"),
    discountFinishDate: joi
      .date()
      .iso()
      .greater(joi.ref("fromDate"))
      .required(),
    colorsAndSizes: joi.array().items(
      joi.object({
        color: joi.string(),
        size: joi.string(),
        stock: joi.number().required(),
        soldItems: joi.number().required(),
      })
    ),
    productDetails: joi.string(),
    specifications: joi.object(),
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
