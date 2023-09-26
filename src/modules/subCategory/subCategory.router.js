import { Router } from "express";
const router = Router();
import * as subCategoriesController from "./subCategory.controller.js";
import { uploadFile } from "../../services/multer.cloud.js";
import { fileTypeValidation } from "../../utils/allowedFileTypes.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./subCategory.validation.js";
import { asyncHandler } from "../../utils/errorHandler.js";

router.get("/getAllSubCategories", subCategoriesController.getAllSubCategories);
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
router.get(
  "/getSpecificSubCategory/:subCategoryId",
  asyncHandler(subCategoriesController.getSpecificSubCategory)
);

export default router;
