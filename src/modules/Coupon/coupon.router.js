import { Router } from "express";
import * as couponController from "./coupon.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./coupon.validation.js";
import { uploadFile } from "../../services/multer.cloud.js";
import { fileTypeValidation } from "../../utils/allowedFileTypes.js";
import { checkAvailability } from "../../middlewares/checkAvailability.js";

const router = Router();

router.use(auth([userRole.superAdmin, userRole.admin]));
router.use(checkAvailability);

router.get(
  "/getCoupons",
  validation(validators.getCoupons),
  asyncHandler(couponController.getCoupons)
);

router.post(
  "/addCoupon",
  validation(validators.addCoupon),
  asyncHandler(couponController.addCoupon)
);
router.put(
  "/updateCoupon",
  validation(validators.updateCoupon),
  asyncHandler(couponController.updateCoupon)
);
router.delete(
  "/deleteCoupon",
  validation(validators.deleteCoupon),
  asyncHandler(couponController.deleteCoupon)
);
router.put(
  "/assignUsers",
  validation(validators.assignUsers),
  asyncHandler(couponController.assignUsers)
);
router.put(
  "/assignProducts",
  validation(validators.assignProducts),
  asyncHandler(couponController.assignProducts)
);
// router.delete(
//   "/deleteAssignUsers",
//   validation(validators.deleteAssignUsers),
//   asyncHandler(couponController.deleteAssignUsers)
// );
// router.delete(
//   "/deleteAssignProducts",
//   validation(validators.assignProducts),
//   asyncHandler(couponController.deleteAssignProducts)
// );

export default router;
