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
    productID: generalValidation._id.required(),
    quantity: joi.number().min(0).required(),
  }),
};

export const removeCart = {
  query: joi.object({
    _id: generalValidation._id,
  }),
  headers: joi.object({
    authorization: generalValidation.authorization,
  }),
};

export const deleteFromCart = {
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  body: joi.object({
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
    productID: generalValidation._id.required(),
    quantity: joi.number().min(0).required(),
  }),
};
