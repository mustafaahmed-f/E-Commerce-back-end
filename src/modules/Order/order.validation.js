import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const addOrder = {
  body: joi.object({
    couponCode: joi.string(),
    address: generalValidation.addAddress,
    phoneNumbers: joi
      .array()
      .items(joi.string().pattern(new RegExp("^(01)[1250][0-9]{8}$")))
      .required(),
    productID: generalValidation._id.required(),
    productQuantity: joi.number().min(0).required(),
    paymentMethod: joi.string().valid("card", "cash").required(),
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

//================================================================
//================================================================

export const fromCartToOrder = {
  body: joi.object({
    couponCode: joi.string(),
    address: generalValidation.addAddress,
    phoneNumbers: joi
      .array()
      .items(joi.string().pattern(new RegExp("^(01)[1250][0-9]{8}$")))
      .required(),
    cartID: generalValidation._id.required(),
    paymentMethod: joi.string().valid("visa card", "cash").required(),
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

//================================================================
//================================================================

export const completeOrder = {
  query: joi.object({
    orderID: generalValidation._id.required(),
  }),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

//================================================================
//================================================================

// export const requestNewPaymentSession = {
//   query: joi.object({
//     orderID: generalValidation._id.required(),
//   }),
//   headers: joi
//     .object({
//       authorization: generalValidation.authorization,
//     })
//     .required()
//     .unknown(true),
// };
