import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const addReview = {
  body: joi.object({
    rating: joi.number().min(1).max(5).required(),
    comment: joi.string().min(1).max(255).optional(),
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  query: joi.object({
    productID: generalValidation._id.required(),
  }),
};

export const updateReview = {
  body: joi.object({
    rating: joi.number().min(1).max(5).optional(),
    comment: joi.string().min(1).max(255).optional(),
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  query: joi.object({
    productID: generalValidation._id.required(),
    _id: generalValidation._id.required(),
  }),
};

export const deleteReview = {
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  query: joi.object({
    _id: generalValidation._id.required(),
  }),
};
