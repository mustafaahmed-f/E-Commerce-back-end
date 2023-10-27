import { Router } from "express";
import * as cartController from "./cart.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./cart.validation.js";
import { checkAvailability } from "../../middlewares/checkAvailability.js";

const router = Router();

router.use(auth([userRole.user]));
router.use(checkAvailability);

router.get(
  "/getUserCart",
  validation(validators.getUserCart),
  asyncHandler(cartController.getUserCart)
);
router.post(
  "/addToCart",
  validation(validators.addToCart),
  asyncHandler(cartController.addToCart)
);
router.put(
  "/updateCart",
  validation(validators.updateCart),
  asyncHandler(cartController.updateCart)
);
router.delete(
  "/deleteFromCart",
  validation(validators.deleteFromCart),
  asyncHandler(cartController.deleteFromCart)
);
router.delete(
  "/removeCart",
  validation(validators.removeCart),
  asyncHandler(cartController.removeCart)
);
router.put(
  "/emptyCart",
  validation(validators.removeCart),
  asyncHandler(cartController.emptyCart)
);

export default router;
