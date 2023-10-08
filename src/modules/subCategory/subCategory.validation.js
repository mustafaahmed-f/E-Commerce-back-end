import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";
import JoiObjectId from "joi-objectid";
const objectId = JoiObjectId(joi);

export const addSubCategory = {
  body: joi
    .object({
      name: generalValidation.name.required(),
      // authorization:generalValidation.authorization //TODO : uncomment authorization after creating user model and tokens
    })
    .required(),
  query: joi
    .object({
      categoryId: generalValidation._id,
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const updateSubCategory = {
  body: joi
    .object({
      name: generalValidation.name,
      // a    uthorization:generalValidation.authorization //TODO : uncomment authorization after creating user model and tokens
    })
    .required(),
  query: joi
    .object({
      categoryId: objectId(),
      subCategoryId: generalValidation._id,
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const deleteSubCategory = {
  query: joi
    .object({
      subCategoryId: generalValidation._id,
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};
