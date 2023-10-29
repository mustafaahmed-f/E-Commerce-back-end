import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const addCoupon = {
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  body: joi
    .object({
      couponCode: joi.string().alphanum().lowercase().required(),
      couponAmount: joi.number().required(),
      isPercentage: joi.boolean(),
      fromDate: joi
        .date()
        .iso()
        .greater(new Date() - 24 * 60 * 60 * 1000)
        .required(),
      toDate: joi.date().iso().greater(joi.ref("fromDate")).required(),
    })
    .required(),
};

export const updateCoupon = {
  query: joi.object({
    _id: generalValidation._id,
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .unknown(true)
    .required(),
  body: joi
    .object({
      couponCode: joi.string().alphanum().lowercase(),
      couponAmount: joi.number(),
      isPercentage: joi.boolean(),
      fromDate: joi
        .date()
        .iso()
        .greater(new Date() - 24 * 60 * 60 * 1000),
      toDate: joi.date().iso().greater(joi.ref("fromDate")),
    })
    .required(),
};

export const deleteCoupon = {
  query: joi
    .object({
      _id: generalValidation._id,
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const assignUsers = {
  query: joi
    .object({
      _id: generalValidation._id,
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  body: joi
    .object({
      users: joi
        .array()
        .items({
          user_id: generalValidation._id.required(),
          maxUse: joi.number().min(0).max(10).required(),
          usedTimes: joi.number().min(0).less(joi.ref("maxUse")).default(0),
        })
        .min(1)
        .required(),
    })
    .required(),
};

export const deleteAssignUsers = {
  query: joi
    .object({
      _id: generalValidation._id,
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
  body: joi
    .object({
      users: joi.array().items(generalValidation._id.required()).required(),
    })
    .required(),
};

// export const assignProducts = {
//   query: joi
//     .object({
//       _id: generalValidation._id,
//     })
//     .required(),
//   headers: joi
//     .object({
//       authorization: generalValidation.authorization,
//     })
//     .required()
//     .unknown(true),
//   body: joi
//     .object({
//       products: joi.array().items(generalValidation._id.required()).required(),
//     })
//     .required(),
// };

export const getCoupons = {
  query: joi
    .object({
      size: joi.number().integer().min(1).max(20),
      page: joi.number().integer().min(1),
      sort: joi.string(),
      select: joi.string(),
    })
    .unknown(true),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};
