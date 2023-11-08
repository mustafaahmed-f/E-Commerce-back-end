import userModel from "../../../DB/models/userModel.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import cloudinary from "../../utils/cloudinary.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("12345678!_=abcdefghmZxyiolk:*", 15);
import slugify from "slugify";
import addressModel from "../../../DB/models/address/addressModel.js";
import user_addressModel from "../../../DB/models/address/user_addressModel.js";
import tokenModel from "../../../DB/models/tokenModel.js";

export const getAuser = async (req, res, next) => {
  const { _id } = req.query;
  const user = await userModel
    .findOne({ _id })
    .select("userName role profileImage gender");
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

  const checkAddressExistence = await addressModel.findOne({ _id });
  if (!checkAddressExistence) {
    return next(new Error("Address is not found", { cause: 400 }));
  }

  //check multiple default addresses:

  const userAddresses = await user_addressModel
    .findOne({
      user_id: req.user.id,
    })
    .populate("addresses");

  //To avoid multiple default addresses
  for (let i = 0; i < userAddresses.addresses.length; i++) {
    if (userAddresses.addresses[i]?.is_default === true && is_default == true) {
      return next(new Error("You can only have one default address"));
    }
  }

  const updateAddress = await addressModel.findByIdAndUpdate(
    _id,
    {
      unit_number,
      street_number,
      region,
      city,
      postal_code,
      address_line1,
      address_line2,
      country,
      is_default,
    },
    { new: true }
  );
  if (!updateAddress) {
    return next(new Error("Failed to update address", { cause: 400 }));
  }
  return res.status(200).json({
    message: "Address has been updated successfully !!",
    address: updateAddress,
  });
};

//================================================================
//================================================================

export const deleteAddress = async (req, res, next) => {
  const { _id } = req.query;

  const updateUserAddresses = await user_addressModel.findOneAndUpdate(
    {
      user_id: req.user.id,
    },
    {
      $pull: { addresses: _id },
    }
  );
  if (!updateUserAddresses) {
    return next(
      new Error("Failed to delete address", {
        cause: 400,
      })
    );
  }

  const deleteAddress = await addressModel.findByIdAndDelete(_id);
  if (!deleteAddress) {
    return next(
      new Error("Failed to delete address or address is not found", {
        cause: 400,
      })
    );
  }

  const updateUser = await userModel.findByIdAndUpdate(req.user.id, {
    $inc: { numOfAddresses: -1 },
  });

  return res
    .status(200)
    .json({ message: "Address has been deleted successfully" });
};

//================================================================
//================================================================

export const changeProfileImage = async (req, res, next) => {
  const user = await userModel.findById(req.user.id);
  if (!user.profileImage.public_id) {
    return next(new Error("You don't have a profile image", { cause: 400 }));
  }
  await cloudinary.uploader.destroy(user.profileImage.public_id);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.cloud_folder}/Users/${user.customID}`,
    }
  );
  const updateUser = await userModel.updateOne(
    { _id: req.user.id },
    {
      profileImage: {
        secure_url,
        public_id,
      },
    }
  );
  if (!updateUser) {
    return next(new Error("Failed to update profile image", { cause: 400 }));
  }
  return res.status(200).json({
    message: "Profile image has been changed successfully !!",
  });
};

//================================================================
//================================================================

export const addProfileImage = async (req, res, next) => {
  const user = await userModel.findById(req.user.id);
  if (user.profileImage.public_id) {
    return next(new Error("Profile image already exists", { cause: 400 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.cloud_folder}/Users/${user.customID}`,
    }
  );
  const updateUser = await userModel.updateOne(
    { _id: req.user.id },
    {
      profileImage: {
        secure_url,
        public_id,
      },
    }
  );
  if (!updateUser) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("Failed to upload profile image", { cause: 400 }));
  }
  return res.status(200).json({
    message: "Profile image has been uploaded successfully !!",
  });
};

//================================================================
//================================================================

export const deleteProfileImage = async (req, res, next) => {
  const user = await userModel.findById(req.user.id);
  if (!user.profileImage.public_id) {
    return next(new Error("You don't have a profile image", { cause: 400 }));
  }
  await cloudinary.uploader.destroy(user.profileImage.public_id);
  const updateUser = await userModel.updateOne(
    { _id: req.user.id },
    {
      profileImage: {
        secure_url: null,
        public_id: null,
      },
    }
  );
  if (!updateUser) {
    return next(new Error("Failed to delete profile image", { cause: 400 }));
  }
  return res.status(200).json({
    message: "Profile image has been deleted successfully !!",
  });
};

//================================================================
//================================================================

export const changePassword = async (req, res, next) => {
  const { password } = req.body;
  const user = await userModel.findById(req.user.id);
  user.password = password;
  await user.save();
  return res.status(200).json({
    message: "Password has been changed successfully !!",
  });
};

//================================================================
//================================================================

export const deactivateUser = async (req, res, next) => {
  const user = await userModel.updateOne(
    { _id: req.user.id },
    {
      deactivated: true,
    }
  );
  if (!user.modifiedCount) {
    return next(
      new Error("User is not found or failed to be deactivated!", {
        cause: 400,
      })
    );
  }
  return res.status(200).json({
    message: "User has been deactivated successfully !!",
  });
};

//================================================================
//================================================================

export const logOut = async (req, res, next) => {
  const { token } = req.query;
  const user = await userModel.updateOne(
    { _id: req.user.id },
    {
      avoidMultipleLogIns: false,
    }
  );
  const updateUserTokens = await tokenModel.findOneAndUpdate(
    {
      user_id: req.user.id,
    },
    {
      $pull: { loginToken: token },
    }
  );

  if (!updateUserTokens) {
    return next(
      new Error("failed to be logged out!", {
        cause: 500,
      })
    );
  }

  if (!user.modifiedCount) {
    return next(
      new Error("User is not found", {
        cause: 400,
      })
    );
  }
  return res.status(200).json({
    message: "User has been logged out successfully !!",
  });
};

//================================================================
//================================================================

export const updateUser = async (req, res, next) => {
  const { userName, phoneNumber, gender, birthDate } = req.body;
  //check dublicated userName:
  const checkDublUserName = await userModel.findOne({ userName });
  if (checkDublUserName) {
    return next(new Error("User name already exists", { cause: 400 }));
  }
  const user = await userModel.updateOne(
    { _id: req.user.id },
    {
      userName,
      phoneNumber,
      gender,
      birthDate,
    }
  );
  if (!user.modifiedCount) {
    return next(
      new Error("User is not found or failed to be updated!", {
        cause: 400,
      })
    );
  }
  const userInfo = await userModel
    .findOne({ _id: req.user.id })
    .select("-password");
  return res.status(200).json({
    message: "User has been updated successfully !!",
    user: userInfo,
  });
};
