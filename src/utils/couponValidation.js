import moment from "moment";
import couponModel from "../../DB/models/couponModel.js";

export const couponValidation = async (userID, couponCode) => {
  const coupon = await couponModel.findOne({ couponCode });
  if (!coupon) {
    return {
      msg: "coupon is not found",
    };
  }
  //check to date:
  if (moment(coupon.fromDate).isAfter(moment(new Date()))) {
    return {
      msg: "Coupon is not valid now",
    };
  }

  //check after date:
  if (moment(coupon.toDate).isBefore(moment(new Date())) || !coupon.isValid) {
    return {
      msg: "Coupon is expired !",
    };
  }

  //check assign users:
  let assignedUser = false;
  let maxUsed = false;

  if (coupon.assignedUsers.length)
    for (const user of coupon.assignedUsers) {
      if (user.user_id.toString() == userID.toString()) {
        assignedUser = true;

        if (user.usedTimes >= user.maxUse) {
          maxUsed = true;
        }
      }
    }
  if (!assignedUser) {
    return {
      msg: "Coupon is not assigned to user !",
    };
  }
  if (maxUsed) {
    return {
      msg: "You have reached max. use !",
    };
  }

  return {
    status: 200,
    coupon,
  };
};
