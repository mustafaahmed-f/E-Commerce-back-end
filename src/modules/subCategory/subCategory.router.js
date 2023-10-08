import { Router } from "express";
const router = Router();
import * as subCategoriesController from "./subCategory.controller.js";
import { uploadFile } from "../../services/multer.cloud.js";
import { fileTypeValidation } from "../../utils/allowedFileTypes.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./subCategory.validation.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";

router.get("/getAllSubCategories", subCategoriesController.getAllSubCategories);
router.get(
  "/getSpecificSubCategory/:subCategoryId",
  asyncHandler(subCategoriesController.getSpecificSubCategory)
);
//===================================================================
//===================================================================
router.use(auth([userRole.admin, userRole.superAdmin]));

router.post(
  "/addSubCategory",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.addSubCategory),
  subCategoriesController.addSubCategory
);
router.put(
  "/updateSubCategory",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.updateSubCategory),
  subCategoriesController.updateSubCategory
);
router.delete(
  "/deleteSubCategory",
  validation(validators.deleteSubCategory),
  subCategoriesController.deleteSubCategory
);

export default router;
