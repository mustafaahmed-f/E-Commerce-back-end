import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const addBrand = {
  body: joi.object({
    name: generalValidation.name,
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

export const deleteBrand = {
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

export const getSpecificBrand = {
  params: joi.object({
    _id: generalValidation._id,
  }),
};
