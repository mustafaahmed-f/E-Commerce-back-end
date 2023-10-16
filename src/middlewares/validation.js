import joi from "joi";
import { Types } from "mongoose";
import JoiObjectId from "joi-objectid";
const objectId = JoiObjectId(joi);

const reqMethods = ["body", "query", "params", "headers", "file", "files"];

export const validation = (joiSchema) => {
  return (req, res, next) => {
    const validationErrorArr = [];
    for (const key of reqMethods) {
      if (joiSchema[key]) {
        const validationResult = joiSchema[key].validate(req[key], {
          abortEarly: false,
        });
        if (validationResult.error) {
          validationErrorArr.push(validationResult.error.details);
        }
      }
    }

    if (validationErrorArr.length) {
      req.validationErrorArr = validationErrorArr;
      return next(new Error(" ", { cause: 400 }));
    }
    return next();
  };
};

export const generalValidation = {
  authorization: joi.string().required(),
  name: joi
    .string()
    .min(2)
    .max(20)
    .pattern(new RegExp(/^[a-zA-Z ]{2,20}$/)),
  _id: objectId(),
  token: joi
    .string()
    .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/),

  addAddress: joi.object({
    address_line1: joi
      .string()
      .pattern(new RegExp(/^(\d{1,}) [a-zA-Z0-9\s]+ (st)(\.)?$/))
      .required(), // Ex : 25 Abo elmagd el naggar st. ,
    address_line2: joi
      .string()
      .alphanum()
      .min(4)
      .max(30)
      .pattern(new RegExp(/^[a-zA-Z0-9\s]+$/)),
    unit_number: joi.number().min(1).max(100),
    street_number: joi.number().min(1).max(100),
    city: joi
      .string()
      .min(3)
      .max(30)
      .required()
      .pattern(new RegExp(/^[A-Z][a-zA-Z\s]+$/)), // Ex : Cairo
    region: joi
      .string()
      .min(3)
      .max(30)
      .required()
      .pattern(new RegExp(/^[A-Z][a-zA-Z\s]+$/)),
    postal_code: joi.string().min(3).max(30),
    country: joi
      .string()
      .min(3)
      .max(30)
      .required()
      .pattern(new RegExp(/^[A-Z][a-zA-Z\s]+$/)),
    is_default: joi.boolean().default(false),
  }),
};
