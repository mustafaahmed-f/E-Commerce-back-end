import { nanoid } from "nanoid";
import user_addressModel from "../../../DB/models/address/user_addressModel.js";
import cartModel from "../../../DB/models/cartModel.js";
import orderModel from "../../../DB/models/orderMode.js";
import product_itemModel from "../../../DB/models/product_itemModel.js";
import { couponValidation } from "../../utils/couponValidation.js";
import createInvoice from "../../utils/pdfkit.js";
import sendEmail from "../../services/sendEmail.js";
import { sendInvoice } from "../../utils/sendInvoice.js";

export const addOrder = async (req, res, next) => {
  const {
    couponCode,
    address,
    phoneNumbers,
    productID,
    productQuantity,
    paymentMethod,
  } = req.body;

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

  //if no address was send, use default address of user:
  let userAddress = null;
  if (!address) {
    const userAddresses = await user_addressModel
      .findOne({ user_id: req.user.id })
      .populate("addresses");
    for (const address of userAddresses.addresses) {
      if (address.is_default) {
        userAddress = {
          address_line1: address.address_line1,
          city: address.city,
          region: address.region,
          country: address.country,
        };
      }
    }
  }

  if (!userAddress && !address) {
    return next(
      new Error(
        "No address default address was found. Please send an address!",
        { cause: 404 }
      )
    );
  }

  const order = await orderModel.create({
    userID: req.user.id,
    products,
    coupon: req.coupon,
    subTotal: subtotal,
    finalPaidAmount: finalPaidAmount,
    phoneNumbers,
    address: userAddress ?? address,
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

  //================================= Invoice =========================================

  await sendInvoice(order, req.user);

  //===================================================================================

  return res
    .status(200)
    .json({ message: "Order was successfully created", order });
};

//================================================================
//================================================================

export const fromCartToOrder = async (req, res, next) => {
  const { couponCode, address, phoneNumbers, cartID, paymentMethod } = req.body;

  const checkCart = await cartModel.findById(cartID);
  if (!checkCart) {
    return next(new Error("No cart was found !", { cause: 404 }));
  }

  if (!checkCart.products.length) {
    return next(new Error("Cart is empty !", { cause: 404 }));
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
  let subTotal = 0;

  for (const product of checkCart.products) {
    const checkProductExistence = await product_itemModel.findById(
      product.productID
    );

    if (!checkProductExistence) {
      return next(
        new Error(
          `Product with id : (${checkProductExistence._id}) doesn't exist`,
          { cause: 404 }
        )
      );
    }

    products.push({
      productID: product.productID,
      quantity: product.quantity,
      unitPaymentPrice: checkProductExistence.paymentPrice,
      finalPaymentPrice: checkProductExistence.paymentPrice * product.quantity,
      name: checkProductExistence.item_name,
    });

    subTotal += checkProductExistence.paymentPrice * product.quantity;
  }

  let finalPaidAmount = subTotal;

  if (req.coupon?.isPercentage) {
    finalPaidAmount =
      finalPaidAmount -
      (finalPaidAmount * (req.coupon?.couponAmount || 0)) / 100;
  } else if (!req.coupon?.isPercentage) {
    finalPaidAmount = finalPaidAmount - (req.coupon?.couponAmount || 0);
  }

  //if no address was send, use default address of user:
  let userAddress = null;
  if (!address) {
    const userAddresses = await user_addressModel
      .findOne({ user_id: req.user.id })
      .populate("addresses");
    for (const address of userAddresses.addresses) {
      if (address.is_default) {
        userAddress = {
          address_line1: address.address_line1,
          city: address.city,
          region: address.region,
          country: address.country,
        };
      }
    }
  }

  if (!userAddress && !address) {
    return next(
      new Error(
        "No address default address was found. Please send an address!",
        { cause: 404 }
      )
    );
  }

  const order = await orderModel.create({
    userID: req.user.id,
    products,
    coupon: req.coupon,
    subTotal: subTotal,
    finalPaidAmount: finalPaidAmount,
    phoneNumbers,
    address: userAddress ?? address,
    paymentMethod,
    isFromCart: true,
    orderStatus: paymentMethod === "cash" ? "completed" : "pending",
  });
  if (!order) {
    //return old usedTimes value
    if (couponCode) {
      if (user.user_id === req.user.id) {
        user.usedTimes--;
        await req.coupon.save();
      }
    }

    return next(new Error("Something went wrong !", { cause: 404 }));
  }

  checkCart.products = [];
  await checkCart.save();

  //======================== Invoice ============================

  await sendInvoice(order, req.user);

  //=============================================================

  return res
    .status(200)
    .json({ message: "Order was successfully created", order });
};

//================================================================
//================================================================
