import { Router } from "express";
const router = Router();
import { uploadFile } from "../../services/multer.cloud.js";
import { fileTypeValidation } from "../../utils/allowedFileTypes.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./auth.validation.js";
import * as authController from "./auth.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";

router.post(
  "/signUp",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.signUp),
  asyncHandler(authController.signUp)
);
router.post(
  "/logIn",
  validation(validators.logIn),
  asyncHandler(authController.logIn)
);
router.post(
  "/firstAddAddress",
  validation(validators.firstAddAddress),
  asyncHandler(authController.firstAddAddress)
);
router.get(
  "/confirmEmail/:token",
  validation(validators.tokenOnly),
  asyncHandler(authController.confirmEmail)
);
router.get(
  "/newConfirmEmail/:token",
  validation(validators.tokenOnly),
  // asyncHandler(checkExistAndConfirmation("newConfirmEmail")),
  // checkExistAndConfirmation("newConfirmEmail"),
  asyncHandler(authController.newConfirmEmail)
);
router.get(
  "/unsubscribe/:token",
  validation(validators.tokenOnly),
  // asyncHandler(checkExistAndConfirmation("unsubscribe")),
  asyncHandler(authController.unsubscribe)
);
router.post(
  "/forgotPassword",
  validation(validators.forgotPassword),
  asyncHandler(authController.forgotPassword)
);
router.post(
  "/setNewPassword",
  validation(validators.setNewPassword),
  asyncHandler(authController.setNewPassword)
);
router.post("/loginWithGmail", asyncHandler(authController.loginWithGmail));

router.put(
  "/makeStatusOffline",
  asyncHandler(authController.makeStatusOffline)
);

router.put("/gmailOffline", asyncHandler(authController.gmailOffline));

export default router;
