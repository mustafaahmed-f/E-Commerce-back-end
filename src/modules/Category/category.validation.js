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
    .required(),
};

export const updateCategory = {
  body: joi.object({
    name: generalValidation.name,
  }),
  query: joi.object({
    categoryID: generalValidation._id,
  }),
};

export const deleteCategory = {
  query: joi.object({
    _id: generalValidation._id,
  }),
};
