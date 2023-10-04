import userModel from "../../../DB/models/userModel.js";
import bcrypt from "bcrypt";
import { signToken, verifyToken } from "../../utils/tokenMethod.js";
import { htmlTemplate } from "../../utils/confirmEmailTemplate.js";
import sendEmail from "../../services/sendEmail.js";
import cloudinary from "../../utils/cloudinary.js";
import { customAlphabet } from "nanoid";
import { resetHtmlTemplate } from "../../utils/resetPasswordTemplate.js";
import addressModel from "../../../DB/models/address/addressModel.js";
import user_addressModel from "../../../DB/models/address/user_addressModel.js";

const nanoid = customAlphabet("12345678!_=abcdefghm*", 10);

export const signUp = async (req, res, next) => {
  const {
    userName,
    email,
    password,
    phoneNumber,
    role,
    gender,
    birthDate,
    address,
  } = req.body;

  // Check dublicated email , userName & phoneNumber;
  const checkDublicatedUserName = await userModel.findOne({ userName });
  if (checkDublicatedUserName) {
    return next(new Error("User name must be unique !", { cause: 400 }));
  }

  const checkDublicatedEmail = await userModel.findOne({ email });
  if (checkDublicatedEmail) {
    return next(new Error("Email must be unique!", { cause: 400 }));
  }

  const checkDublicatedPhoneNumber = await userModel.findOne({ phoneNumber });
  if (checkDublicatedPhoneNumber) {
    return next(new Error("Phone number must be unique", { cause: 400 }));
  }

  const hashedPassword = await bcrypt.hashSync(
    password,
    parseInt(process.env.SALT_ROUND)
  );

  const customID = nanoid();

  let secure_url_user = null;
  let public_id_user = null;

  //check if there is a profile image ..

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.cloud_folder}/Users/${customID}`,
      }
    );

    req.imagePath = `${process.env.cloud_folder}/Users/${customID}`;
    secure_url_user = secure_url;
    public_id_user = public_id;
  }

  const newUser = {
    userName,
    email,
    password: hashedPassword,
    phoneNumber,
    role,
    gender,
    birthDate,
    customID,
    profileImage: { secure_url: secure_url_user, public_id: public_id_user },
  };

  const addUser = await userModel.create(newUser);
  req.createdDoc = {
    model: userModel,
    _id: addUser._id,
  };

  if (!newUser) {
    return next(new Error("Failed to add user", { cause: 400 }));
  }

  req.createdDoc = {
    model: userModel,
    _id: addUser._id,
  };

  const confirmCode = nanoid();
  const hashedCode = await bcrypt.hashSync(
    confirmCode,
    parseInt(process.env.SALT_ROUND)
  );

  const confirmEmailToken = signToken({
    payload: { email, confirmCode: hashedCode },
    signature: process.env.CONFIRM_EMAIL_SIGNATURE,
    expiresIn: "1h",
    // expiresIn: 10,
  });

  const newConfirmEmailToken = signToken({
    payload: { email },
    signature: process.env.CONFIRM_EMAIL_SIGNATURE,
    expiresIn: 60 * 60 * 24 * 14,
    // expiresIn: 5,
  });
  //   console.log(newConfirmEmailToken);

  const html = htmlTemplate({
    protocol: req.protocol,
    host: req.headers.host,
    confirmToken: confirmEmailToken,
    newConfirmToken: newConfirmEmailToken,
  });

  const isEmailSent = await sendEmail({
    from: "mostafafikry971@gmail.com",
    to: email,
    html: html,
    subject: "Confirm email",
  });

  if (!isEmailSent) {
    return next(new Error("Failed to send email", { cause: 500 }));
  }

  // confirmCode: hashedCode,
  // newConfirmToken: newConfirmEmailToken,
  // confirmToken: confirmEmailToken,

  addUser.confirmCode = hashedCode;
  addUser.newConfirmToken = newConfirmEmailToken;
  addUser.confirmToken = confirmEmailToken;

  await addUser.save();

  return res.status(201).json({
    message: "User added successfully , please confirm your email !",
  });
};

//===================================================================================
//===================================================================================

export const firstAddAddress = async (req, res, next) => {
  const { user_id } = req.query;
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
  //check user Existence :
  const user = await userModel.findOne({ _id: user_id });
  if (!user) {
    return next(new Error("User is not found", { cause: 400 }));
  }

  //This API is used only during signUp.
  if (user.numOfAddresses === 1) {
    return next(
      new Error("This API is used to add first address only during sign up!", {
        cause: 400,
      })
    );
  }

  //If user is confirmed , he should use the add address API in the user module.
  if (user.isConfirmed) {
    return next(new Error("Token is needed !!", { cause: 400 }));
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
  };

  const addAddress = await addressModel.create(newAddress);
  if (!addAddress) {
    return next(new Error("Failed to add address", { cause: 400 }));
  }

  req.createdDoc = {
    model: addressModel,
    _id: addAddress._id,
  };

  const addUserAddress = await user_addressModel.create({
    user_id,
    address: addAddress._id,
    is_default: is_default ?? false,
  });

  if (!addUserAddress) {
    await addressModel.findByIdAndDelete(addAddress._id);
    return next(new Error("Failed to add address", { cause: 400 }));
  }

  req.createdDoc1 = {
    model: user_addressModel,
    _id: addUserAddress._id,
  };

  const updatedUser = await userModel.findByIdAndUpdate(
    user._id,
    {
      $inc: { numOfAddresses: 1 },
    },
    { new: true }
  );

  if (!updatedUser) {
    return next(new Error("Failed to add address", { cause: 400 }));
  }

  return res.status(200).json({
    message: "Address added successfully",
    Address: addAddress,
  });
};

//===================================================================================
//===================================================================================

export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;

  req.utils = "confirmEmail"; //used to tell user to request new confirmation in error handler .

  const decoded = verifyToken({
    token: token,
    signature: process.env.CONFIRM_EMAIL_SIGNATURE,
  });
  if (!decoded?.email && !decoded?.confirmCode) {
    return next(new Error("Invalid token or payload ", { cause: 400 }));
  }

  //Check User existence
  const userExistence = await userModel.findOne({ email: decoded.email });
  if (!userExistence) {
    return res.send("User is not found");
  }

  if (token !== userExistence.confirmToken) {
    return res.send("Error !!");
  }

  const user = await userModel.findOneAndUpdate(
    {
      email: decoded.email,
      isConfirmed: false,
      confirmCode: decoded.confirmCode,
    },
    { isConfirmed: true, confirmCode: null, numOfConfirmRequests: null },
    { new: true }
  );
  if (!user) {
    return res.send("User is already confirmed");
  }

  return res
    .status(200)
    .send(
      "User has been confirmed successfully. You can now log in to your account. "
    );
};

//============================================================================
//============================================================================

export const newConfirmEmail = async (req, res, next) => {
  // const user = checkExistAndConfirmation("newConfirmEmail", req, res, next);

  const { token } = req.params;
  req.newConfirmToken = token;
  const decoded = verifyToken({
    token: token,
    signature: process.env.CONFIRM_EMAIL_SIGNATURE,
  });

  req.continueApi = true;

  const user = await checkExistAndConfirmationFunction(
    req,
    res,
    next,
    decoded,
    token
  );
  if (!req.continueApi) {
    return;
  }
  //Make a maximum num. of confirmations

  if (user.numOfConfirmRequests == 5) {
    const deletedUser = await userModel.findByIdAndDelete(user._id);
    if (!deletedUser) {
      return res.send("Error.. Refresh page");
    }

    //Delete resources from cloud
    if (user.profileImage.public_id) {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
      await cloudinary.api.delete_folder(
        `${process.env.cloud_folder}/Users/${user.customID}`
      );
    }

    return res.send(
      "Your account has been deleted after reaching maximum number of confirmation requests."
    );
  }

  await userModel.findByIdAndUpdate(user._id, {
    $inc: { numOfConfirmRequests: 1 },
  });

  //send new confirmation email

  const confirmEmailToken = signToken({
    payload: { email: user.email, confirmCode: user.confirmCode },
    signature: process.env.CONFIRM_EMAIL_SIGNATURE,
    expiresIn: "1h",
  });

  const html = htmlTemplate({
    protocol: req.protocol,
    host: req.headers.host,
    confirmToken: confirmEmailToken,
    newConfirmToken: token,
  });

  const isEmailSent = await sendEmail({
    from: "mostafafikry971@gmail.com",
    to: user.email,
    html: html,
    subject: "Confirm email",
  });

  user.confirmToken = confirmEmailToken;
  await user.save();

  if (!isEmailSent) {
    return next(new Error("Failed to send email", { cause: 500 }));
  }

  return res.send(
    "New confirmation has been sent to your email, check your inbox. REMEMBER:: You can request a new confirmation for 5 times ONLY!"
  );
};

//============================================================================
//============================================================================

export const unsubscribe = async (req, res, next) => {
  const { token } = req.params;
  req.newConfirmToken = token;
  const decoded = verifyToken({
    token: token,
    signature: process.env.CONFIRM_EMAIL_SIGNATURE,
  });

  req.continueApi = true;

  const user = await checkExistAndConfirmationFunction(req, res, next, decoded);
  if (!req.continueApi) {
    return;
  }

  //check if there is a profile image:
  if (user.profileImage.public_id && user.isConfirmed == false) {
    await cloudinary.uploader.destroy(user.profileImage.public_id);
    await cloudinary.api.delete_folder(
      `${process.env.cloud_folder}/Users/${user.customID}`
    );
  }

  //Delete user:
  const deletedUser = await userModel.findByIdAndDelete(user._id);
  if (!deletedUser) {
    return res.send("Failed to delete user !");
  }
  return res.send("User has been deleted successfully");
};

//============================================================================
//============================================================================

export const forgotPassword = async (req, res, next) => {
  //TODO : make haveResetPassword : false
  const { email } = req.body;

  req.continueApi = true;

  const user = await checkExistForResetPassword(req, res, next, email);
  if (!req.continueApi) {
    return;
  }

  const forgotPassToken = signToken({
    payload: user.email,
    signature: process.env.FORGOT_PASS_SIGNATUE,
  });

  const html = resetHtmlTemplate({
    protocol: req.protocol,
    host: req.headers.host,
    forgotPasswordToken: forgotPassToken,
  });

  const isEmailSent = await sendEmail({
    from: "mostafafikry971@gmail.com",
    to: email,
    html: html,
    subject: "Reset password",
  });

  if (!isEmailSent) {
    return next(new Error("Failed to send email", { cause: 500 }));
  }

  return res
    .status(200)
    .json({ message: "Check your inbox to reset your password !" });
};

//============================================================================
//============================================================================

export const setNewPassword = async (req, res, next) => {
  // TODO : check first if forgetCode is not null .. if it is null return error
  //TODO : make forgetCode : null .. to allow reset password only one time.

  // User will be redirected to the reset page of the front end . Front end will recieve the token
  // From the params of reset link in the email . This token will be send in query with the new Password
  // in body to the set new password API.

  const { token } = req.query;
  const { newPassword } = req.body;

  const decoded = verifyToken({
    token: token,
    signature: process.env.CONFIRM_EMAIL_SIGNATURE,
  });

  if (!decoded?.email) {
    return next(new Error("Invalid token or payload ", { cause: 400 }));
  }

  //Check User existence
  let user = await userModel.findOne({
    email: decoded.email,
  });

  if (!user) {
    req.continueApi = false;
    return res.send("User is not found");
  }

  //Check if user made forgot-password request :

  if (!user.forgetCode) {
    return next(
      new Error("Make a forgot-password request first !", { cause: 400 })
    );
  }

  //Check if new password is same as old password :

  const match = await bcrypt.compare(newPassword, user.password);
  if (match) {
    return next(
      new Error("New password can't be same as old password", { cause: 400 })
    );
  }

  const hashedNewPass = await bcrypt.hashSync(
    newPassword,
    parseInt(process.env.SALT_ROUND)
  );
  const updatedUser = await userModel.findOneAndUpdate(
    { email: decoded.email },
    { password: hashedNewPass }
  );
  if (!updatedUser) {
    return next(new Error("Failed", { cause: 500 }));
  }
  return res
    .status(200)
    .json({ message: "Password has been updated successfully !" });
};

//============================================================================
//============================================================================

export const logIn = async (req, res, next) => {};

//============================================================================
//============================================================================

const checkExistAndConfirmationFunction = async (
  req,
  res,
  next,
  decoded,
  token
) => {
  if (!decoded?.email) {
    return next(new Error("Invalid token or payload ", { cause: 400 }));
  }

  //Check User existence
  let user = await userModel.findOne({
    email: decoded.email,
  });

  if (!user) {
    req.continueApi = false;
    return res.send("User is not found");
  }

  if (token !== user.newConfirmToken) {
    req.continueApi = false;
    return res.send("Error !!");
  }

  //check if user is confirmed :
  const checkConfirmation = await userModel.findOne({
    email: decoded.email,
    isConfirmed: true,
  });
  if (checkConfirmation) {
    req.continueApi = false;

    return res.send("User is already confirmed.");
  }
  return user;
};

//============================================================================
//============================================================================

const checkExistForResetPassword = async (req, res, next, email) => {
  //Check User existence
  let user = await userModel.findOne({
    email,
  });

  if (!user) {
    req.continueApi = false;
    return res.send("User is not found or wrong email !");
  }

  //check if user is confirmed :
  const checkConfirmation = await userModel.findOne({
    email,
    isConfirmed: true,
  });
  if (!checkConfirmation) {
    req.continueApi = false;

    return res.send("User is not confirmed.");
  }
  return user;
};
