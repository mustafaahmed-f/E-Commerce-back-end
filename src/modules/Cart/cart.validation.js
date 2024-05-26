import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const getUserCart = {
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const addToCart = {
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  body: joi.object({
    productQuantity: joi.number().min(0).required(),
    colorAndSize: joi.object({
      color: joi.string(),
      size: joi.string(),
    }),
  }),
  query: joi.object({
    productID: generalValidation._id.required(),
  }),
};

export const removeCart = {
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const deleteFromCart = {
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  body: joi.object({
    colorAndSize: joi.object({
      color: joi.string(),
      size: joi.string(),
    }),
  }),
  query: joi.object({
    productID: generalValidation._id.required(),
  }),
};

export const updateCart = {
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  body: joi.object({
    productQuantity: joi.number().min(0).required(),
    colorAndSize: joi.object({
      color: joi.string(),
      size: joi.string(),
    }),
  }),
  query: joi.object({
    productID: generalValidation._id.required(),
  }),
};
