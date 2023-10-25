import { Router } from "express";
import * as productConroller from "./product.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./product.validation.js";
import { uploadFile } from "../../services/multer.cloud.js";
import { fileTypeValidation } from "../../utils/allowedFileTypes.js";
import { checkAvailability } from "../../middlewares/checkAvailability.js";

const router = Router();

router.get("/getEveryProduct", asyncHandler(productConroller.getEveryProduct));
router.get("/getAllProducts", asyncHandler(productConroller.getAllProducts));
router.get(
  "/getSpecificProduct/:_id",
  validation(validators.getSpecificProduct),
  asyncHandler(productConroller.getSpecificProduct)
);
router.get(
  "/getSpecificProductItem/:_id",
  validation(validators.getSpecificProduct),
  asyncHandler(productConroller.getSpecificProductItem)
);

router.delete(
  "/deleteProduct",
  auth([userRole.superAdmin]),
  validation(validators.deleteProduct),
  checkAvailability,
  asyncHandler(productConroller.deleteProduct)
);

router.delete(
  "/deleteProductItem",
  auth([userRole.superAdmin]),
  validation(validators.deleteProduct),
  checkAvailability,
  asyncHandler(productConroller.deleteProductItem)
);

//===================================================================
//===================================================================
router.use(auth([userRole.admin, userRole.superAdmin]));
router.use(checkAvailability);
router.post(
  "/addProduct",
  uploadFile(fileTypeValidation.image).fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 3 },
  ]),
  validation(validators.addProduct),
  asyncHandler(productConroller.addProduct)
);
router.post(
  "/addProductItem",
  uploadFile(fileTypeValidation.image).fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 3 },
  ]),
  validation(validators.addProductItem),
  asyncHandler(productConroller.addProductItem)
);
router.post(
  "/uploadImages",
  uploadFile(fileTypeValidation.image).array("images", 3),
  validation(validators.uploadImages),
  asyncHandler(productConroller.uploadImages)
);
router.put(
  "/updateProduct",
  validation(validators.updateProduct),
  asyncHandler(productConroller.updateProduct)
);

router.put(
  "/updateProductItem",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.updateProductItem),
  asyncHandler(productConroller.updateProductItem)
);

router.delete(
  "/removeSpecificSecondaryImage",
  validation(validators.removeSpecificSecondaryImage),
  asyncHandler(productConroller.removeSpecificSecondaryImage)
);

export default router;
