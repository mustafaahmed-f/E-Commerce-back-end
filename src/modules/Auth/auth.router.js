import { Router } from "express";
const router = Router();
import { uploadFile } from "../../services/multer.cloud.js";
import { fileTypeValidation } from "../../utils/allowedFileTypes.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./auth.validation.js";
import * as authController from "./auth.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { checkExistAndConfirmation } from "../../middlewares/checkExist&confirmation.js";

router.post(
  "/signUp",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.signUp),
  asyncHandler(authController.signUp)
);
router.get(
  "/confirmEmail/:token",
  validation(validators.tokenOnly),
  asyncHandler(authController.confirmEmail)
);
router.get(
  "/newConfirmEmail/:token",
  validation(validators.tokenOnly),
  checkExistAndConfirmation("newConfirmEmail"),
  asyncHandler(authController.newConfirmEmail)
);
router.get(
  "/unsubscribe/:token",
  validation(validators.tokenOnly),
  asyncHandler(checkExistAndConfirmation("unsubscribe")),
  asyncHandler(authController.unsubscribe)
);

export default router;
