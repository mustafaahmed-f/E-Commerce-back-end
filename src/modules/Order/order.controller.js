import orderModel from "../../../DB/models/orderMode.js";
import product_itemModel from "../../../DB/models/product_itemModel.js";
import { couponValidation } from "../../utils/couponValidation.js";

export const addOrder = async (req, res, next) => {
  const {
    couponCode,
    address,
    phoneNumbers,
    productID,
    productQuantity,
    paymentMethod,
  } = req.body;

  //TODO : know if user is allowerd to make multiple orders;
  //   const checkOrder = await orderModel.findOne({ userID: req.user.id });
  //   if (checkOrder) {
  //     return next(new Error("You already have an order !", { cause: 404 }));
  //   }

  const productCheck = await product_itemModel.findById(productID);
  if (!productCheck) {
    return next(new Error("No product was found !", { cause: 404 }));
  }
  if (productCheck.stock < productQuantity) {
    return next(new Error("Quantity is out of range !", { cause: 404 }));
  }

  if (couponCode) {
    const isCouponValid = await couponValidation(req.user.id, couponCode);
    if (isCouponValid.status !== 200) {
      return next(new Error(`${isCouponValid.msg}`, { cause: 404 }));
    }

    req.coupon = isCouponValid.coupon;

    for (const user of req.coupon.assignedUsers) {
      if (user.user_id.toString() == req.user.id.toString()) {
        user.usedTimes = user.usedTimes + 1;
        await req.coupon.save();
      }
    }
  }

  let products = [];
  products.push({
    productID,
    quantity: productQuantity,
    unitPaymentPrice: productCheck.paymentPrice,
    finalPaymentPrice: productCheck.paymentPrice * productQuantity,
    name: productCheck.item_name,
  });

  productCheck.stock -= productQuantity;
  await productCheck.save();

  let subtotal = products[0].finalPaymentPrice;
  let finalPaidAmount = subtotal;

  if (req.coupon?.isPercentage) {
    finalPaidAmount =
      finalPaidAmount -
      (finalPaidAmount * (req.coupon?.couponAmount || 0)) / 100;
  } else if (!req.coupon?.isPercentage) {
    finalPaidAmount = finalPaidAmount - (req.coupon?.couponAmount || 0);
  }

  const order = await orderModel.create({
    userID: req.user.id,
    products,
    coupon: req.coupon,
    subTotal: subtotal,
    finalPaidAmount: finalPaidAmount,
    phoneNumbers,
    address,
    paymentMethod,
    orderStatus: paymentMethod === "cash" ? "completed" : "pending",
  });
  if (!order) {
    //return old stock value;
    productCheck.stock += productQuantity;
    await productCheck.save();

    //return old usedTimes value
    if (couponCode) {
      if (user.user_id === req.user.id) {
        user.usedTimes--;
        await req.coupon.save();
      }
    }

    return next(new Error("Something went wrong !", { cause: 404 }));
  }

  return res
    .status(200)
    .json({ message: "Order was successfully created", order });
};
