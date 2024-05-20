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

router.delete(
  "/deleteProduct",
  auth([userRole.superAdmin]),
  validation(validators.deleteProduct),
  checkAvailability,
  asyncHandler(productConroller.deleteProduct)
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

router.delete(
  "/removeSpecificSecondaryImage",
  validation(validators.removeSpecificSecondaryImage),
  asyncHandler(productConroller.removeSpecificSecondaryImage)
);

export default router;
