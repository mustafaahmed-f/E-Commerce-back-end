import tokenModel from "../../DB/models/tokenModel.js";
import userModel from "../../DB/models/userModel.js";
import { signToken, verifyToken } from "../utils/tokenMethod.js";

export const auth = (accessRoles) => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return next(new Error("Login first !", { cause: 400 }));
      }

      if (!authorization.startsWith(process.env.TOKEN_BEARER)) {
        return next(new Error("Invalid bearer !", { cause: 400 }));
      }

      const token = authorization.split(process.env.TOKEN_BEARER)[1];
      if (!token) {
        return next(new Error("Token is required !", { cause: 400 }));
      }

      //Try and catch to refresh Token :
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

        req.user = {
          email: user.email,
          id: user._id,
          role: user.role,
          userName: user.userName,
        };

        //update login token in token model if token is refreshed ..
        // const userLoginToken = await tokenModel.findOne({
        //   user_id: user._id,
        // });
        // if (userLoginToken.loginToken != token) {
        //   userLoginToken.loginToken = token;
        //   await userLoginToken.save();
        // }

        return next();
      } catch (error) {
        console.log({ error });
        //Refresh token :
        if (error.message == "jwt expired") {
          const searchForUserID = await tokenModel.findOne({
            loginToken: { $in: [token] },
          });
          if (!searchForUserID) {
            return next(new Error("Invalid Token !", { cause: 400 }));
          }
          const userID = searchForUserID.user_id.toString();
          const user = await userModel.findOne({ _id: userID });
          if (!user) {
            return next(new Error("User is not found !", { cause: 400 }));
          }
          //Generating new Token :
          const newToken = signToken({
            payload: { _id: user._id },
            signature: process.env.LOGIN_SIGNATURE,
            expiresIn: "1d",
          });
          if (!newToken) {
            return next(
              new Error("Error in generating new token !", { cause: 500 })
            );
          }

          //push new token in token model :
          searchForUserID.loginToken.push(newToken);
          await searchForUserID.save();

          return res.status(200).json({
            message: "Token refreshed successfully !",
            New_Token: newToken,
          });
        }
        return next(new Error("invalid token", { cause: 500 }));
      }
    } catch (error) {
      return next(new Error("Error in authentication", { cause: 500 }));
    }
  };
};
