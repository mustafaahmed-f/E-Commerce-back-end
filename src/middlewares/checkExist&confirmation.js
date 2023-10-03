import userModel from "../../DB/models/userModel.js";
import cloudinary from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { verifyToken } from "../utils/tokenMethod.js";

// export const checkExistAndConfirmation = (utilsType) => {
//   return async (req, res, next) => {
//     const { token } = req.params;
//     // switch (utilsType) {
//     //   case "newConfirmEmail":
//     //     req.newConfirmToken = token;
//     //     break;
//     //   case "unsubscribe": //TODO : some query
//     //     break;
//     //   default:
//     //     break;
//     // }
//     // if (utilsType == "newConfirmEmail") {
//     //   req.newConfirmToken = token;
//     // }
//     try {
//       const decoded = verifyToken({
//         token: token,
//         signature: process.env.CONFIRM_EMAIL_SIGNATURE,
//       });
//       if (!decoded?.email) {
//         return next(new Error("Invalid token or payload ", { cause: 400 }));
//       }

//       //Check User existence
//       const user = await userModel.findOne({
//         email: decoded.email,
//       });

//       if (!user) {
//         return res.send("User is not found");
//       }

//       //check if user is confirmed :
//       const checkConfirmation = await userModel.findOne({
//         isConfirmed: true,
//       });
//       if (checkConfirmation) {
//         return res.send("User is already confirmed.");
//       }
//       req.user = user;
//       return next();
//     } catch (err) {
//       if (req.newConfirmToken && err == "TokenExpiredError: jwt expired") {
//         console.log("Hereeee");
//         return newConfirmError(req, res, err);
//       }
//     }
//   };
// };

export const checkExistAndConfirmation = (utilsType) => {
  return async (req, res, next) => {
    const { token } = req.params;
    req.newConfirmToken = token;
    try {
      const decoded = verifyToken({
        token: token,
        signature: process.env.CONFIRM_EMAIL_SIGNATURE,
      });
      if (!decoded?.email) throw new Error("Invalid token or payload");

      const user = await userModel.findOne({ email: decoded.email });
      if (!user) return res.send("User is not found");

      const checkConfirmation = await userModel.findOne({ isConfirmed: true });
      if (checkConfirmation) return res.send("User is already confirmed.");

      req.user = user;
      return next();
    } catch (err) {
      if (
        utilsType === "newConfirmEmail" &&
        err == "TokenExpiredError: jwt expired"
      ) {
        console.log("Hereeee");
        return newConfirmError(req, res, err);
      }
      next(err);
    }
  };
};

const newConfirmError = async (req, res, err) => {
  const checkUserExistence = await userModel.findOne({
    newConfirmToken: req.newConfirmToken,
  });
  if (!checkUserExistence) {
    return res.send("User is not found !!!");
  }

  const checkUserConfirmation = await userModel.findOne({
    newConfirmToken: req.newConfirmToken,
    isConfirmed: true,
  });
  if (checkUserConfirmation) {
    return res.send("User is already confirmed !");
  }

  if (checkUserExistence.profileImage && !checkUserExistence.isConfirmed) {
    await cloudinary.uploader.destroy(
      checkUserExistence.profileImage.public_id
    );
    await cloudinary.api.delete_folder(
      `${process.env.cloud_folder}/Users/${checkUserExistence.customID}`
    );
  }

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
