import { Router } from "express";
import * as orderController from "./order.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./order.validation.js";
import { checkAvailability } from "../../middlewares/checkAvailability.js";

const router = Router();

router.get(
  "/completeOrder/:token",
  validation(validators.completeOrder),
  asyncHandler(orderController.completeOrder)
);

router.get(
  "/cancelPayment/:token",
  validation(validators.completeOrder),
  asyncHandler(orderController.cancelPayment)
);

//================================================================================
//================================================================================

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

router.get(
  "/requestNewPaymentSession",
  validation(validators.requestNewPaymentSession),
  asyncHandler(orderController.requestNewPaymentSession)
);
router.get("/getUserOrders", asyncHandler(orderController.getUserOrders));

export default router;
