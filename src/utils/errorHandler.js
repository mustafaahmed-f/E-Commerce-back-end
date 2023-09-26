import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
import cloudinary from "./cloudinary.js";
import userModel from "../../DB/models/userModel.js";

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(async (err) => {
      //Delete files from cloudinary if a problem happens on the server level.
      removeResources(req);

      //Delete failed document from DB
      removeFailedDocument(req);

      //catch error for new confirm email token expiration.
      if (req.newConfirmToken && err == "TokenExpiredError: jwt expired") {
        return newConfirmError(req, res, err);
      }

      // catch error for token expiration of resetPassword and email confirmation
      if (req.utils && err == "TokenExpiredError: jwt expired") {
        return confirmAndResetErrors(req, res, err);
      }

      return next(new Error(err, { cause: 501 }));
    });
  };
};

export const globalErrorHandler = (err, req, res, next) => {
  if (err) {
    if (req.validationErrorArr) {
      return res.status(err.cause || 500).json({
        message: "Validation Error",
        Error: req.validationErrorArr,
      });
    }
    return res
      .status(err.cause || 400)
      .json({ errMsg: err.message, status: getReasonPhrase(err.cause || 400) });
  }
};

const newConfirmError = async (req, res, err) => {
  //check user existence:
  const checkUserExistence = await userModel.findOne({
    newConfirmToken: req.newConfirmToken,
  });
  if (!checkUserExistence) {
    return res.send("User is not found !");
  }

  //check if user is confirmed
  const checkUserConfirmation = await userModel.findOne({
    newConfirmToken: req.newConfirmToken,
    isConfirmed: true,
  });
  if (checkUserConfirmation) {
    return res.send("User is already confirmed !");
  }

  //check If user has profile image and delete it if it exists.

  if (
    checkUserExistence.profileImage &&
    checkUserExistence.isConfirmed == false
  ) {
    await cloudinary.uploader.destroy(
      checkUserExistence.profileImage.public_id
    );
    await cloudinary.api.delete_folder(
      `${process.env.cloud_folder}/Users/${checkUserExistence.customID}`
    );
  }

  //Delete user
  const deletedUser = await userModel.deleteOne({
    newConfirmToken: req.newConfirmToken,
    isConfirmed: false,
  });
  if (!deletedUser.deletedCount) {
    return res.send("Server error");
  }

  return res.send(
    "Account has been deleted after 14 days without email confirmation."
  );
};

async function confirmAndResetErrors(req, res, err) {
  switch (req.utils) {
    case "confirmEmail":
      return res.send(
        "Time estimated to confirm email finished. If you haven't confirmed your account, Please request new confirmation!"
      );
      break;

    default:
      break;
  }
}

async function removeResources(req) {
  if (req.method !== "GET") {
    if (req.imagePath) {
      await cloudinary.api.delete_resources_by_prefix(req.imagePath);
      await cloudinary.api.delete_folder(req.imagePath);
    }
  }
}

async function removeFailedDocument(req) {
  if (req.createdDoc) {
    const { model, _id } = req.createdDoc;
    await model.findByIdAndDelete(_id);
  }
}
