import userModel from "../../DB/models/userModel.js";
import { verifyToken } from "../utils/tokenMethod.js";

const authentication = (accessRoles) => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return next(new Error("Login first !", { cause: 400 }));
      }
      if (!authorization.startWith(process.env.TOKEN_BEARER)) {
        return next(new Error("Invalid bearer !", { cause: 400 }));
      }
      const token = authorization.split(process.env.TOKEN_BEARER)[1];
      if (!token) {
        return next(new Error("Token is required !", { cause: 400 }));
      }

      try {
        const decoded = verifyToken({
          token: token,
          signature: process.env.LOGIN_SIGNATURE,
        });
        if (!decoded._id) {
          return next(new Error("Invalid payload !", { cause: 400 }));
        }
        const user = await userModel.findOne({ _id: decoded._id });

        if (!user) {
          return next(new Error("User is not found !", { cause: 400 }));
        }

        //======================= Authorization =========================
        if (!accessRoles.includes(user.role)) {
          return next(new Error("You are not authorized !", { cause: 403 }));
        }

        req.user = { email: user.email, id: user._id };
        return next();
      } catch (error) {
        //Refresh token :
      }
    } catch (error) {
      return next(new Error("Error in authentication", { cause: 500 }));
    }
  };
};
