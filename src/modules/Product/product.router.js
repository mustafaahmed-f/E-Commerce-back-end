import { Router } from "express";
import * as productConroller from "./product.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";

const router = Router();

router.get("/getAllProducts", asyncHandler(productConroller.getAllProducts));

export default router;
