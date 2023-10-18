import { Router } from "express";
import * as categoryController from "./category.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
const router = Router();
import { uploadFile } from "../../services/multer.cloud.js";
import { fileTypeValidation } from "../../utils/allowedFileTypes.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./category.validation.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";
import { checkAvailability } from "../../middlewares/checkAvailability.js";

router.get(
  "/getEveryCategory",
  asyncHandler(categoryController.getEveryCategory)
);
router.get(
  "/getAllCategories",
  asyncHandler(categoryController.getAllCategories)
);
router.get(
  "/getSpecificCategory/:categoryID",
  asyncHandler(categoryController.getSpecificCategory)
);

router.delete(
  "/deleteCategory",
  auth([userRole.superAdmin]),
  validation(validators.deleteCategory),
  checkAvailability,
  asyncHandler(categoryController.deleteCategory)
);

//===================================================================
//===================================================================
router.use(auth([userRole.admin, userRole.superAdmin]));
router.use(checkAvailability);
router.post(
  "/addCategory",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.addCategory),
  asyncHandler(categoryController.addCategory)
);
router.put(
  "/updateCategory",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.updateCategory),
  asyncHandler(categoryController.updateCategory)
);

export default router;
