import { Router } from "express";
import * as reviewController from "./review.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./review.controller.js";
import { checkAvailability } from "../../middlewares/checkAvailability.js";

const router = new Router();

export default router;
