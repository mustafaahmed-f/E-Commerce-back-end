import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

export const signUp = {
  body: joi
    .object({
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
    })
    .required(),
};

export const addAddress = {
  query: joi
    .object({
      user_id: generalValidation._id,
    })
    .required(),
  body: joi
    .object({
      address_line1: joi
        .string()
        .pattern(new RegExp(/^(\d{1,}) [a-zA-Z0-9\s]+ (st)(\.)?$/)), // Ex : 25 Abo elmagd el naggar st. ,
      address_line2: joi
        .string()
        .alphanum()
        .min(4)
        .max(30)
        .pattern(new RegExp(/^[a-zA-Z0-9\s]+$/)),
      unit_number: joi.number().min(1).max(100),
      street_number: joi.number().min(1).max(100),
      city: joi.string().min(3).max(30),
      region: joi.string().min(3).max(30),
      postal_code: joi.string().min(3).max(30),
      country: joi.string().min(3).max(30),
    })
    .required(),
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

export const forgotPassword = {
  body: joi
    .object({
      email: joi.string().email().required(),
    })
    .required(),
};

export const setNewPassword = {
  body: joi
    .object({
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
    })
    .required(),
  query: joi
    .object({
      token: generalValidation.token,
    })
    .required(),
};

export const tokenOnly = {
  params: joi
    .object({
      token: generalValidation.token.required(),
    })
    .required(),
};
