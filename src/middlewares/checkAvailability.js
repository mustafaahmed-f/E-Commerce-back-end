import userModel from "../../DB/models/userModel.js";
import { asyncHandler } from "../utils/errorHandler.js";

export const checkAvailability = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);

  //Check Activation - blocked - status - confirmation

  if (user.deactivated === true) {
    return next(new Error("Account is deactivated . Login to active it !"), {
      cause: 400,
    });
  }

  if (user.status === "offline") {
    return next(new Error("You must login first !!"), { cause: 400 });
  }

  if (user.isBlocked === true) {
    return next(
      new Error(
        "Your account is blocked. Please contact the customer service for more details !!"
      ),
      {
        cause: 400,
      }
    );
  }

  if (user.isConfirmed === false) {
    return next(new Error("Please confirm your email first !"), { cause: 400 });
  }

  return next();
});
