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
    productQuantity: joi.number().min(0).required(),
    paymentMethod: joi.string().valid("card", "cash").required(),
    colorAndSize: joi.object({
      color: joi.string(),
      size: joi.string(),
    }),
    specifications: joi.object(),
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

export const completeOrder = {
  params: joi.object({
    token: generalValidation.token.required(),
  }),
};

//================================================================
//================================================================

export const requestNewPaymentSession = {
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
