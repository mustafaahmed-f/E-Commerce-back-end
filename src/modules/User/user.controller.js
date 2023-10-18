import { populate } from "dotenv";
import userModel from "../../../DB/models/userModel.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import cloudinary from "../../utils/cloudinary.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("12345678!_=abcdefghmZxyiolk:*", 15);
import slugify from "slugify";
import addressModel from "../../../DB/models/address/addressModel.js";
import user_addressModel from "../../../DB/models/address/user_addressModel.js";

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

export const blockUser = async (req, res, next) => {
  const { _id } = req.query;
  const findUser = await userModel.findOne({ _id });
  if (!findUser) {
    return next(new Error("User is not found", { cause: 400 }));
  }
  const user = await userModel.updateOne(
    {
      _id,
      role: "user",
      isBlocked: false,
    },
    { isBlocked: true }
  );
  if (!user.modifiedCount) {
    return next(
      new Error(
        "User is already blocked or can't be blocked (admin or super admin)!",
        { cause: 400 }
      )
    );
  }
  return res
    .status(200)
    .json({ message: "User has been blocked successfully !" });
};

//==================================================================
//==================================================================

export const addAdress = async (req, res, next) => {
  const {
    unit_number,
    street_number,
    region,
    city,
    postal_code,
    address_line1,
    address_line2,
    country,
    is_default,
  } = req.body;
  const findUser = await userModel.findOne({ _id: req.user.id });
  if (!findUser) {
    return next(new Error("User is not found", { cause: 400 }));
  }
  //check number of addresses:
  if (findUser.numOfAddresses === 3) {
    return next(
      new Error("You have reached the max. number of addresses !", {
        cause: 400,
      })
    );
  }

  const checkOldAddresses = await user_addressModel
    .findOne({
      user_id: findUser._id,
    })
    .populate("addresses");

  if (!checkOldAddresses) {
    const addUserAddress = await user_addressModel.create({
      user_id: findUser._id,
    });

    req.createdDoc1 = {
      model: user_addressModel,
      _id: addUserAddress._id,
    };
  }

  //To avoid multiple default addresses
  for (let i = 0; i < checkOldAddresses.addresses.length; i++) {
    if (
      checkOldAddresses.addresses[i]?.is_default === true &&
      is_default == true
    ) {
      return next(new Error("You can only have one default address"));
    }
  }

  const newAddress = {
    unit_number,
    street_number,
    region,
    city,
    postal_code,
    address_line1,
    address_line2,
    country,
    is_default: is_default ?? false,
  };

  const addAddress = await addressModel.create(newAddress);
  if (!addAddress) {
    return next(new Error("Failed to add address", { cause: 400 }));
  }

  req.createdDoc = {
    model: addressModel,
    _id: addAddress._id,
  };

  const pushAddress = await user_addressModel.findOneAndUpdate(
    { user_id: findUser._id },
    {
      $push: { addresses: addAddress._id },
    },
    { new: true }
  );

  if (!pushAddress) {
    await addressModel.findByIdAndDelete(addAddress._id);
    return next(new Error("Failed to add address", { cause: 400 }));
  }

  const updatedUser = await userModel.findByIdAndUpdate(
    findUser._id,
    {
      $inc: { numOfAddresses: 1 },
    },
    { new: true }
  );

  if (!updatedUser) {
    await addressModel.findByIdAndDelete(addAddress._id);
    await user_addressModel.findByIdAndUpdate(pushAddress._id, {
      $pull: { addresses: addAddress._id },
    });
    return next(new Error("Failed to add address", { cause: 400 }));
  }

  return res.status(200).json({
    message: "Address added successfully",
    Address: addAddress,
  });
};

//================================================================
//================================================================

export const getAddresses = async (req, res, next) => {
  //super admin or owner of the account can use this API
  //check if the user_id of the addresses is the same as req.id  and a nested if to check if it is a superadmin
  const { _id } = req.query;
  let userID = null;
  if (req.user.role === "superAdmin") {
    if (!_id) {
      return next(
        new Error("As a super admin, you should send user's ID", { cause: 400 })
      );
    }
    userID = _id;
  } else {
    userID = req.user.id;
  }
  const checkUserExistence = await userModel.findOne({ _id: userID });
  if (!checkUserExistence) {
    return next(new Error("User is not found", { cause: 400 }));
  }
  const addresses = await user_addressModel
    .find({
      user_id: userID,
    })
    .populate("addresses")
    .populate({ path: "user_id", select: "userName" });
  if (!addresses) {
    return next(new Error("Addresses are not found", { cause: 400 }));
  }
  return res.status(200).json({ message: "Done", addresses });
};

//================================================================
//================================================================

export const updateAddress = async (req, res, next) => {
  const { _id } = req.query;
  const {
    unit_number,
    street_number,
    region,
    city,
    postal_code,
    address_line1,
    address_line2,
    country,
    is_default,
  } = req.body;
};

//================================================================
//================================================================

export const deleteAddress = async (req, res, next) => {
  const { _id } = req.query;
};
