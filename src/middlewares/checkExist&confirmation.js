import userModel from "../../DB/models/userModel.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { verifyToken } from "../utils/tokenMethod.js";

export const checkExistAndConfirmation = (utilsType) => {
  return asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    switch (utilsType) {
      case "newConfirmEmail":
        req.newConfirmToken = token;
        break;
      case "unsubscribe": //TODO : some query
        break;
      default:
        break;
    }
    // if (utilsType == "newConfirmEmail") {
    //   req.newConfirmToken = token;
    // }
    const decoded = verifyToken({
      token: token,
      signature: process.env.CONFIRM_EMAIL_SIGNATURE,
    });
    if (!decoded?.email) {
      return next(new Error("Invalid token or payload ", { cause: 400 }));
    }

    //Check User existence
    const user = await userModel.findOne({
      email: decoded.email,
    });

    if (!user) {
      return res.send("User is not found");
    }

    //check if user is confirmed :
    const checkConfirmation = await userModel.findOne({
      isConfirmed: true,
    });
    if (checkConfirmation) {
      return res.send("User is already confirmed.");
    }
    req.user = user;
    return next();
  });
};
