import { Router } from "express";
import * as categoryController from "./category.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
const router = Router();
import { uploadFile } from "../../services/multer.cloud.js";
import { fileTypeValidation } from "../../utils/allowedFileTypes.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./category.validation.js";

router.get(
  "/getAllCategories",
  asyncHandler(categoryController.getAllCategories)
);

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
router.delete(
  "/deleteCategory",
  validation(validators.deleteCategory),
  asyncHandler(categoryController.deleteCategory)
);
router.get(
  "/getSpecificCategory/:categoryID",
  asyncHandler(categoryController.getSpecificCategory)
);

export default router;
