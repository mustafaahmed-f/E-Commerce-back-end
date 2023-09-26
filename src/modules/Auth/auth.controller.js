import userModel from "../../../DB/models/userModel.js";
import bcrypt from "bcrypt";
import { signToken, verifyToken } from "../../utils/tokenMethod.js";
import { htmlTemplate } from "../../utils/confirmEmailTemplate.js";
import sendEmail from "../../services/sendEmail.js";
import cloudinary from "../../utils/cloudinary.js";
import { customAlphabet } from "nanoid";
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
    // expiresIn: 60 * 60 * 24 * 14,
    expiresIn: 5,
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

  const newUser = {
    userName,
    email,
    password: hashedPassword,
    phoneNumber,
    role,
    gender,
    birthDate,
    address,
    customID,
    profileImage: { secure_url: secure_url_user, public_id: public_id_user },
    confirmCode: hashedCode,
    newConfirmToken: newConfirmEmailToken,
  };

  const addUser = await userModel.create(newUser);
  req.createdDoc = {
    model: userModel,
    _id: addUser._id,
  };

  if (!newUser) {
    return next(new Error("Failed to add user", { cause: 400 }));
  }

  //TODO : add crons to unsubscribe email after a period if it is not confirmed ..

  return res.status(201).json({
    message: "User added successfully , please confirm your email !",
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

  const user = await userModel.findOneAndUpdate(
    {
      email: decoded.email,
      isConfirmed: false,
      confirmCode: decoded.confirmCode,
    },
    { isConfirmed: true, confirmCode: null },
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
  const { token } = req.params;

  //Make a maximum num. of confirmations

  const user = req.user;

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
};

//============================================================================
//============================================================================

export const forgotPassword = async (req, res, next) => {
  //TODO : make haveResetPassword : false
};

//============================================================================
//============================================================================

export const resetPassword = async (req, res, next) => {
  // TODO : check first if haveResetPassword is false .. if it is true return error
  //TODO : make haveResetpasword : true .. to allow reset password only one time.
};

//============================================================================
//============================================================================

export const logIn = async (req, res, next) => {};
