import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const signUp = {
  body: joi.object({
    userName: joi.string().alphanum().min(3).max(20).required(),
    email: joi.string().email().required(),
    password: joi
      .string()
      .min(8)
      .max(25)
      .pattern(
        new RegExp(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,25}$/
        )
      )
      .required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    phoneNumber: joi
      .string()
      .pattern(new RegExp("^(01)[1250][0-9]{8}$"))
      .required(),
    role: joi.string().valid("user", "admin", "superAdmin"),
    gender: joi.string().valid("male", "female"),
    birthDate: joi.date().iso().less("now"),
    token: generalValidation.token,
    address: joi.array().items(
      joi
        .string()
        .pattern(
          new RegExp(
            /^(\d{1,}) [a-zA-Z0-9\s]+ (st)(\,)? [a-zA-Z]+(\,)? [a-zA-Z]+(\,)? [a-zA-Z]+?$/
          )
        ) // Ex : 25 Abo elmagd el naggar st, Haram, Giza, Egypt
    ),
  }),
};

export const logIn = {
  body: joi.object({
    userName: joi.string().min(3).max(20),
    phoneNumber: joi.string().pattern(new RegExp("^(01)[1250][0-9]{8}$")),
    email: joi.string().email(),
    password: joi
      .string()
      .min(8)
      .max(25)
      .pattern(
        new RegExp(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,25}$/
        )
      )
      .required(),
  }),
};

export const tokenOnly = {
  params: joi.object({
    token: generalValidation.token.required(),
  }),
};
