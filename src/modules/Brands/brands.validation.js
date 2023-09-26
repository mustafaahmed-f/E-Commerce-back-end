import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const addBrand = {
  body: joi.object({
    name: generalValidation.name,
  }),
};

export const updateBrand = {
  body: joi.object({
    name: generalValidation.name,
  }),
  query: joi.object({
    _id: generalValidation._id,
  }),
};

export const deleteBrand = {
  query: joi.object({
    _id: generalValidation._id,
  }),
};

export const getSpecificBrand = {
  params: joi.object({
    _id: generalValidation._id,
  }),
};
