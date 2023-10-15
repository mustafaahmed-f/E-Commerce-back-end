import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const addProduct = {
  body: joi.object({
    name: joi
      .string()
      .min(2)
      .max(35)
      .pattern(new RegExp(/^[a-zA-Z0-9 ]{2,35}$/)),
    colors: joi
      .array()
      .items(
        joi.string().pattern(new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/))
      ), //Hexadecimal color
    sizes: joi
      .array()
      .items(joi.string().valid("XS", "S", "M", "L", "XL", "XXL", "XXXL")),
    description: joi.string().min(10).max(500),
    price: joi.number().required(),
    discount: joi.number(),
    discountType: joi.string().valid("percentage", "amount"),
    stock: joi.number().required(),
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  query: joi.object({
    categoryID: generalValidation._id,
    subCategoryID: generalValidation._id,
    brandID: generalValidation._id,
  }),
};

export const uploadImages = {
  query: joi.object({
    _id: generalValidation._id,
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const updateBrand = {
  body: joi.object({
    name: generalValidation.name,
  }),
  query: joi.object({
    _id: generalValidation._id,
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const deleteProduct = {
  query: joi.object({
    _id: generalValidation._id,
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const getSpecificProduct = {
  params: joi.object({
    _id: generalValidation._id,
  }),
};
