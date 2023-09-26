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
  _id: objectId().required(),
  token: joi
    .string()
    .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/),
};
