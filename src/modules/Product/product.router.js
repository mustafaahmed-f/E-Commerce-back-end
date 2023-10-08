import { Router } from "express";
import * as productConroller from "./product.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./product.validation.js";

const router = Router();

router.get("/getAllProducts", asyncHandler(productConroller.getAllProducts));
router.get(
  "/getSpecificProduct/:productId",
  asyncHandler(productConroller.getSpecificProduct)
);

//===================================================================
//===================================================================
router.use(auth([userRole.admin, userRole.superAdmin]));
router.post(
  "/addProduct",
  validation(validators.addProduct),
  asyncHandler(productConroller.addProduct)
);
router.put(
  "/updateProduct",
  validation(validators.updateProduct),
  asyncHandler(productConroller.updateProduct)
);
router.delete(
  "/deleteProduct",
  validation(validators.deleteProduct),
  asyncHandler(productConroller.deleteProduct)
);

export default router;
