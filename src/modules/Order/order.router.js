import { Router } from "express";
import * as orderController from "./order.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./order.validation.js";
import { checkAvailability } from "../../middlewares/checkAvailability.js";

const router = Router();

router.use(auth([userRole.user]));
router.use(checkAvailability);

router.post(
  "/addOrder",
  validation(validators.addOrder),
  asyncHandler(orderController.addOrder)
);

router.post(
  "/fromCartToOrder",
  validation(validators.fromCartToOrder),
  asyncHandler(orderController.fromCartToOrder)
);

export default router;
