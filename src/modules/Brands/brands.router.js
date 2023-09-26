import { Router } from "express";
const router = Router();
import * as brandsController from "./brands.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./brands.validation.js";
import { uploadFile } from "../../services/multer.cloud.js";
import { fileTypeValidation } from "../../utils/allowedFileTypes.js";

router.get("/getAllBrands", asyncHandler(brandsController.getAllBrands));
router.post(
  "/addBrand",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.addBrand),
  asyncHandler(brandsController.addBrand)
);
router.put(
  "/updateBrand",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.updateBrand),
  asyncHandler(brandsController.updateBrand)
);
router.get(
  "/getSpecificBrand/:_id",
  validation(validators.getSpecificBrand),
  asyncHandler(brandsController.getSpecificBrand)
);
router.delete(
  "/deleteBrand",
  validation(validators.deleteBrand),
  asyncHandler(brandsController.deleteBrand)
);

export default router;
