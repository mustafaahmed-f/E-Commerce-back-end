import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const addCategory = {
  body: joi
    .object({
      name: generalValidation.name,
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const updateCategory = {
  body: joi.object({
    name: generalValidation.name,
  }),
  query: joi.object({
    categoryID: generalValidation._id,
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const deleteCategory = {
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
