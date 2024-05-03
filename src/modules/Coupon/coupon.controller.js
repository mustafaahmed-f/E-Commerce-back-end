import userModel from "../../../DB/models/userModel.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import cloudinary from "../../utils/cloudinary.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("12345678!_=abcdefghmZxyiolk:*", 15);
import slugify from "slugify";
import addressModel from "../../../DB/models/address/addressModel.js";
import user_addressModel from "../../../DB/models/address/user_addressModel.js";
import couponModel from "../../../DB/models/couponModel.js";
import productModel from "../../../DB/models/productModel.js";

let couponTimer = null;

export const getCoupons = async (req, res, next) => {
  const apiFeaturesInstance = new ApiFeatures(couponModel.find(), req.query)
    .sort()
    .paignation()
    .filter()
    .select();
  const coupons = await apiFeaturesInstance.mongooseQuery
    .populate({
      path: "assignedProducts",
      model: "Product",
      select: "name",
    })
    .populate({
      path: "assignedUsers",
      populate: {
        path: "user_id",
        model: "User",
        select: "userName",
      },
    });
  if (!coupons.length) {
    return next(new Error("No coupons were found !", { cause: 404 }));
  }
  res.status(200).json({ message: "Done", coupons });
};

//===========================================================================
//===========================================================================

export const addCoupon = async (req, res, next) => {
  const { couponCode, couponAmount, isPercentage, fromDate, toDate } = req.body;
  //check dublicated code:
  const checkDublicatedCode = await couponModel.findOne({ couponCode });
  if (checkDublicatedCode) {
    return next(new Error("Coupon code must be unique!", { cause: 400 }));
  }

  if (isPercentage == true) {
    if (couponAmount < 0 || couponAmount > 100) {
      return next(
        new Error("Coupon amount must be between 0 and 100", { cause: 400 })
      );
    }
  }

  const date1 = new Date(fromDate);
  const date2 = new Date(toDate);

  let timerID = setTimeout(async () => {
    await couponModel.findByIdAndDelete(coupon._id);
  }, date2 - date1);

  const coupon = await couponModel.create({
    couponCode,
    couponAmount,
    isPercentage,
    fromDate,
    toDate,
    timerID,
  });

  req.createdDoc = {
    model: couponModel,
    _id: coupon._id,
  };

  return res.status(201).json({
    message: "Coupon has been created successfully !!",
    coupon,
  });
};

//============================================================================
//============================================================================

export const updateCoupon = async (req, res, next) => {
  const { _id } = req.query;
  const { couponCode, couponAmount, isPercentage, fromDate, toDate } = req.body;

  const coupon = await couponModel.findById(_id);
  if (!coupon) {
    return next(new Error("Coupon is not found .", { cause: 404 }));
  }

  if (couponCode) {
    const checkDublicatedCode = couponModel.find({
      couponCode: couponCode.toLowerCase(),
    });

    if (checkDublicatedCode.length) {
      return next(new Error("Coupon code must be unique!", { cause: 400 }));
    }
  }

  const couponNewAmount = couponAmount ?? coupon.couponAmount;
  const newFromDate = new Date(fromDate ?? coupon.fromDate);
  const newToDate = new Date(toDate ?? coupon.toDate);

  console.log(couponNewAmount, newFromDate, newToDate);

  if (isPercentage == true) {
    if (couponNewAmount < 0 || couponNewAmount > 100) {
      return next(
        new Error("Coupon amount must be between 0 and 100", {
          cause: 400,
        })
      );
    }
  }

  if (newToDate <= newFromDate) {
    return next(
      new Error("To date must be greater than from date", { cause: 400 })
    );
  }
  let newTimerID;
  if (fromDate || toDate) {
    clearTimeout(coupon.timerID);
    newTimerID = setTimeout(async () => {
      await couponModel.findByIdAndDelete(_id);
    }, newToDate - newFromDate);
  }

  const updatedCoupon = await couponModel.findOneAndUpdate(
    { _id },
    {
      couponCode,
      couponAmount: couponNewAmount,
      isPercentage,
      fromDate: newFromDate,
      toDate: newToDate,
      timerID: newTimerID,
    },
    {
      new: true,
    }
  );
  if (!updatedCoupon) {
    return next(new Error("Failed to update coupon !", { cause: 404 }));
  }
  return res.status(200).json({
    message: "Coupon has been updated successfully.",
    coupon: updatedCoupon,
  });
};

//============================================================================
//============================================================================

export const deleteCoupon = async (req, res, next) => {
  const { _id } = req.query;
  const deleteCoupon = await couponModel.findByIdAndDelete(_id);
  if (!deleteCoupon) {
    return next(
      new Error("Coupon not found or failed to delete coupon.", { cause: 404 })
    );
  }
  return res
    .status(200)
    .json({ message: "Coupon has been deleted successfully." });
};

//============================================================================
//============================================================================

export const assignUsers = async (req, res, next) => {
  const { _id } = req.query;
  const { users } = req.body;
  const coupon = await couponModel.find({ _id });
  if (!coupon.length) {
    return next(new Error("Coupon is not found", { cause: 404 }));
  }

  //Check users' IDs and avoid dublicated users:
  let usersFound = [];
  for (const user of users) {
    const checkUserExistence = await userModel.findById(user.user_id);
    if (checkUserExistence) {
      usersFound.push(user);
    }
  }
  if (usersFound.length < users.length) {
    return next(
      new Error(
        `${users.length - usersFound.length} user/s is/are not found !`,
        { cause: 404 }
      )
    );
  }

  const updatedCoupon = await couponModel
    .findOneAndUpdate(
      { _id },
      {
        $push: {
          assignedUsers: { $each: [...users] },
        },
      },
      { new: true }
    )
    .populate({
      path: "assignedUsers",
      populate: {
        path: "user_id",
        select: "userName",
      },
    });
  if (!updatedCoupon) {
    return next(new Error("Failed to update coupon !", { cause: 404 }));
  }
  return res.status(200).json({
    message: "Coupon has been updated successfully.",
    coupon: updatedCoupon,
  });
};

//============================================================================
//============================================================================

export const deleteAssignUsers = async (req, res, next) => {
  const { _id } = req.query;
  const { users } = req.body;
  const coupon = await couponModel.find({ _id });

  if (!coupon.length) {
    return next(new Error("Coupon is not found", { cause: 404 }));
  }
  const oneCoupon = coupon[0];
  if (!oneCoupon.assignedUsers.length) {
    return next(new Error("Coupon has no assigned users", { cause: 404 }));
  }

  //Map to check if the user exists in assigned users of coupon
  const userMap = new Map();
  for (const user of oneCoupon.assignedUsers) {
    userMap.set(user.user_id.toString(), "assignedUser");
  }

  //check user existence:
  let usersFound = [];
  for (const user of users) {
    const checkUserExistence = await userModel.findById(user);
    if (!userMap.has(user)) {
      return next(
        new Error(
          `${checkUserExistence.userName} doesn't exist in assigned users of coupon`,
          { cause: 404 }
        )
      );
    }

    if (checkUserExistence) {
      usersFound.push(user);
    }
  }
  if (usersFound.length < users.length) {
    return next(
      new Error(
        `${users.length - usersFound.length} user/s is/are not found !`,
        { cause: 404 }
      )
    );
  }

  const updatedCoupon = await couponModel.findOneAndUpdate(
    { _id },
    {
      $pull: {
        assignedUsers: {
          user_id: {
            $in: users,
          },
        },
      },
    },
    { new: true }
  );
  if (!updatedCoupon) {
    return next(
      new Error("Failed to remove assigned users from coupon !", { cause: 404 })
    );
  }
  return res.status(200).json({
    message: "Users have been removed successfully!",
    coupon: updatedCoupon,
  });
};

//============================================================================
//============================================================================

// export const assignProducts = async (req, res, next) => {
//   const { _id } = req.query;
//   const { products } = req.body;
//   const coupon = await couponModel.find({ _id });
//   if (!coupon.length) {
//     return next(new Error("Coupon is not found", { cause: 404 }));
//   }

//   //Check products' IDs and avoid dublicated products:
//   let productsFound = [];
//   for (const product of products) {
//     const checkProductExistence = await productModel.findById(product);
//     if (checkProductExistence) {
//       productsFound.push(product);
//     }
//   }
//   if (productsFound.length < products.length) {
//     return next(
//       new Error(
//         `${
//           products.length - productsFound.length
//         } product/s is/are not found !`,
//         { cause: 404 }
//       )
//     );
//   }

//   const updatedCoupon = await couponModel
//     .findOneAndUpdate(
//       { _id },
//       {
//         assignedProducts: products,
//       },
//       { new: true }
//     )
//     .populate({
//       path: "assignedProducts",
//       select: "name description price discount paymentPrice stock discountType",
//     });
//   if (!updatedCoupon) {
//     return next(new Error("Failed to update coupon !", { cause: 404 }));
//   }
//   return res.status(200).json({
//     message: "Coupon has been updated successfully.",
//     coupon: updatedCoupon,
//   });
// };

//============================================================================
//============================================================================

// export const deleteAssignProducts = async (req, res, next) => {
//   const { _id } = req.query;
//   const { products } = req.body;
//   const coupon = await couponModel.find({ _id });

//   if (!coupon.length) {
//     return next(new Error("Coupon is not found", { cause: 404 }));
//   }

//   const oneCoupon = coupon[0];
//   //   if (!oneCoupon.assignedProducts.length) {
//   //     return next(new Error("Coupon has no assigned products", { cause: 404 }));
//   //   }

//   //Map to check if the user exists in assigned users of coupon
//   const productMap = new Map();
//   for (const product of oneCoupon.assignedProducts) {
//     productMap.set(product.toString(), "assignedProduct");
//   }

//   //check product existence:
//   let productsFound = [];
//   for (const product of products) {
//     const checkProductExistence = await productModel.findById(product);
//     if (!productMap.has(product)) {
//       return next(
//         new Error(
//           `${checkProductExistence.name} doesn't exist in assigned products of coupon`,
//           { cause: 404 }
//         )
//       );
//     }
//     if (checkProductExistence) {
//       productsFound.push(product);
//     }
//   }
//   if (productsFound.length < products.length) {
//     return next(
//       new Error(
//         `${products.length - productsFound.length} user/s is/are not found !`,
//         { cause: 404 }
//       )
//     );
//   }

//   const updatedCoupon = await couponModel.findOneAndUpdate(
//     { _id },
//     {
//       $pull: {
//         assignedProducts: {
//           $in: [...products], //look how to do it .
//         },
//       },
//     },
//     { new: true }
//   );
//   if (!updatedCoupon) {
//     return next(
//       new Error("Failed to remove assigned users from coupon !", { cause: 404 })
//     );
//   }
//   return res.status(200).json({
//     message: "Users have been removed successfully!",
//     coupon: updatedCoupon,
//   });
// };
