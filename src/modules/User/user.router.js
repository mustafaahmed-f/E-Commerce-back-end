import { Router } from "express";
import * as userController from "./user.controller.js";
import { asyncHandler } from "../../utils/errorHandler.js";
import { auth } from "../../middlewares/auth.js";
import { userRole } from "../../utils/userRoles.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./user.validation.js";
import { uploadFile } from "../../services/multer.cloud.js";
import { fileTypeValidation } from "../../utils/allowedFileTypes.js";
import { checkAvailability } from "../../middlewares/checkAvailability.js";

const router = Router();

router.get(
  "/getAuser",
  validation(validators.getAuser),
  asyncHandler(userController.getAuser)
); //For everyone but get only few info.

//================================================================================

//Only super admin:

router.put(
  "/changeRole",
  auth([userRole.superAdmin]),
  validation(validators.changeRole),
  checkAvailability,
  asyncHandler(userController.changeRole)
);

//================================================================================
//super admin or owner of the account can use this API
router.delete(
  "/deleteUser",
  auth([userRole.superAdmin, userRole.user, userRole.admin]),
  validation(validators.deleteUser),
  checkAvailability,
  asyncHandler(userController.deleteUser)
);

router.get(
  "/getAddresses",
  auth([userRole.superAdmin, userRole.user, userRole.admin]),
  validation(validators.getAddresses),
  checkAvailability,
  asyncHandler(userController.getAddresses)
);

//================================================================================
//For owner, admin and superAdmin:
router.get(
  "/getSpecificUser",
  auth([userRole.superAdmin, userRole.admin, userRole.user]),
  checkAvailability,
  asyncHandler(userController.getSpecificUser)
);

//================================================================================
//For admin & superAdmin

router.get(
  "/getAllUsers",
  auth([userRole.superAdmin, userRole.admin]),
  checkAvailability,
  asyncHandler(userController.getAllUsers)
);
router.put(
  "/blockUser",
  auth([userRole.superAdmin, userRole.admin]),
  validation(validators.blockUser),
  checkAvailability,
  asyncHandler(userController.blockUser)
);

//================================================================================

//the owner of the account only can use these APIs (Owner can be user,admin or super admin !).
router.use(auth([userRole.superAdmin, userRole.user, userRole.admin]));
router.use(checkAvailability);
router.post(
  "/addAdress",
  validation(validators.addAdress),
  asyncHandler(userController.addAdress)
);
router.delete(
  "/deleteAddress",
  validation(validators.deleteAddress),
  asyncHandler(userController.deleteAddress)
);
router.put(
  "/updateAddress",
  validation(validators.updateAddress),
  asyncHandler(userController.updateAddress)
);
router.put(
  //used to change or upload profile image if use doesn't have one
  "/changeProfileImage",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.changeProfileImage),
  asyncHandler(userController.changeProfileImage)
);
router.post(
  "/addProfileImage",
  uploadFile(fileTypeValidation.image).single("image"),
  validation(validators.changeProfileImage),
  asyncHandler(userController.addProfileImage)
);
router.delete(
  "/deleteProfileImage",
  validation(validators.changeProfileImage),
  asyncHandler(userController.deleteProfileImage)
);
router.put(
  "/updateUser",
  validation(validators.updateUser),
  asyncHandler(userController.updateUser)
);
router.put(
  "/changePassword",
  validation(validators.changePassword),
  asyncHandler(userController.changePassword)
);
router.put(
  "/deactivateUser",
  validation(validators.deactivateUser),
  asyncHandler(userController.deactivateUser)
);
router.put(
  "/logOut",
  validation(validators.logOut),
  asyncHandler(userController.logOut)
);

export default router;
