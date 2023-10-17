import userModel from "../../../DB/models/userModel.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import cloudinary from "../../utils/cloudinary.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("12345678!_=abcdefghmZxyiolk:*", 15);
import slugify from "slugify";

export const getAuser = async (req, res, next) => {
  const { _id } = req.query;
  const user = await userModel
    .findOne({ _id })
    .select("userName role status profileImage gender");
  if (!user) {
    return next(new Error("User is not found", { cause: 400 }));
  }
  return res.status(200).json({ message: "Done", user });
};

//================================================================
//================================================================

export const changeRole = async (req, res, next) => {
  const { _id } = req.query;
  const { role } = req.body;
  const user = await userModel.updateOne(
    { _id, role: { $ne: "superAdmin" } },
    { role },
    { new: true }
  );
  if (!user.modifiedCount) {
    return next(
      new Error("User is not found or role can't be changed !", { cause: 400 })
    );
  }
  return res
    .status(200)
    .json({ message: "Role has been updated successfully !" });
};

//================================================================
//================================================================

//delete related images :
export const deleteUser = async (req, res, next) => {
  const { _id } = req.query;
  //Only owner or super admin can delete
  if (req.user.id !== _id) {
    if (req.user.role !== "superAdmin") {
      return next(new Error("You can't delete user!", { cause: 403 }));
    }
  }

  const user = await userModel.findOneAndDelete({ _id });
  if (!user) {
    return next(new Error("User is not found", { cause: 400 }));
  }

  if (user.profileImage?.public_id) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.cloud_folder}/Users/${user.customID}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.cloud_folder}/Users/${user.customID}`
    );
  }
  return res
    .status(200)
    .json({ message: "User has been deleted successfully !" });
};

//==================================================================
//==================================================================

export const getSpecificUser = async (req, res, next) => {
  const { _id } = req.query;
  if (req.user.id !== _id) {
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      return next(new Error("Not allowed !", { cause: 403 }));
    }
  }
  const user = await userModel.findOne({ _id });
  if (!user) {
    return next(new Error("User is not found", { cause: 400 }));
  }
  return res.status(200).json({ message: "Done", user });
};

//==================================================================
//==================================================================

export const getAllUsers = async (req, res, next) => {
  //API features
  const apiFeaturesInstance = new ApiFeatures(userModel.find(), req.query)
    .filter()
    .paignation()
    .select()
    .sort();

  const users = await apiFeaturesInstance.mongooseQuery;
  if (!users) {
    return next(new Error("Users are not found", { cause: 400 }));
  }
  return res.status(200).json({ message: "Done", users });
};

//==================================================================
//==================================================================
