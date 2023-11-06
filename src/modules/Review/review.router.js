import { Router } from "express";
import * as reviewController from "./review.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./review.controller.js";
import { checkAvailability } from "../../middlewares/checkAvailability.js";

const router = new Router();

router.delete(
  "/deleteReview",
  auth([userRole.user, userRole.admin, userRole.superAdmin]),
  validation(validators.deleteReview),
  asyncHandler(reviewController.deleteReview)
);

router.use(auth([userRole.user]));
router.use(checkAvailability);

router.post(
  "/addReview",
  validation(validators.addReview),
  asyncHandler(reviewController.addReview)
);
router.put(
  "/updateReview",
  validation(validators.updateReview),
  asyncHandler(reviewController.updateReview)
);

export default router;
