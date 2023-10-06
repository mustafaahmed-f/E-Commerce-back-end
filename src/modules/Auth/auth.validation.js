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

export const firstAddAddress = {
  query: joi
    .object({
      customID: joi.string().required(),
    })
    .required(),
  body: generalValidation.addAddress.required(),
};

export const logIn = {
  body: joi.object({
    userName: joi.string().min(3).max(20),
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
      newPassword: joi
        .string()
        .min(8)
        .max(25)
        .pattern(
          new RegExp(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,25}$/
          )
        )
        .required(),
      confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
    })
    .required(),
  query: joi
    .object({
      token: generalValidation.token.required(),
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
