import joi from "joi";
import { generalValidation } from "../../middlewares/validation.js";

const userIDandTokenValidation = {
  query: joi
    .object({
      _id: generalValidation._id.required(),
    })
    .required(),
  headers: joi
    .object({
      authorization: generalValidation.authorization,
    })
    .required()
    .unknown(true),
};

export const getAuser = {
  query: userIDandTokenValidation.query,
};

export const getAllUsers = {
  headers: userIDandTokenValidation.headers,
  query: joi
    .object({
      size: joi.number().integer().min(1).max(20),
      page: joi.number().integer().min(1),
      sort: joi.string(),
      select: joi.string(),
    })
    .unknown(true),
};

export const deleteUser = userIDandTokenValidation;

export const getAddresses = {
  query: joi.object({
    _id: generalValidation._id,
  }),
  headers: userIDandTokenValidation.headers,
};

export const getSpecificUser = userIDandTokenValidation;

export const blockUser = userIDandTokenValidation;

export const changeProfileImage = {
  headers: userIDandTokenValidation.headers,
};

export const deactivateUser = {
  headers: userIDandTokenValidation.headers,
};

export const logOut = {
  headers: userIDandTokenValidation.headers,
  query: joi.object({
    token: generalValidation.token.required(),
  }),
};

export const changeRole = {
  query: userIDandTokenValidation.query,
  headers: userIDandTokenValidation.headers,
  body: joi
    .object({
      role: joi.string().valid("user", "admin"),
    })
    .required(),
};

export const updateUser = {
  //add validation for address
  headers: userIDandTokenValidation.headers,
  body: joi
    .object({
      userName: joi.string().alphanum().min(3).max(20),
      phoneNumber: joi.string().pattern(new RegExp("^(01)[1250][0-9]{8}$")),
      gender: joi.string().valid("male", "female"),
      birthDate: joi.date().iso().less("now"),
    })
    .required(),
};

export const addAdress = {
  headers: userIDandTokenValidation.headers,
  body: generalValidation.addAddress.required(),
};

export const deleteAddress = userIDandTokenValidation;

export const updateAddress = {
  query: joi.object({
    _id: generalValidation._id.required(),
  }),
  headers: userIDandTokenValidation.headers,
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
      city: joi
        .string()
        .min(3)
        .max(30)

        .pattern(new RegExp(/^[A-Z][a-zA-Z\s]+$/)), // Ex : Cairo
      region: joi
        .string()
        .min(3)
        .max(30)

        .pattern(new RegExp(/^[A-Z0-9][a-zA-Z0-9\s]+$/)),

      postal_code: joi.string().min(3).max(30),
      country: joi
        .string()
        .min(3)
        .max(30)

        .pattern(new RegExp(/^[A-Z][a-zA-Z\s]+$/)),
      is_default: joi.boolean(),
    })
    .required(),
};

export const changePassword = {
  headers: userIDandTokenValidation.headers,
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
};
