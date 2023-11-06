import user_addressModel from "../../../DB/models/address/user_addressModel.js";
import cartModel from "../../../DB/models/cartModel.js";
import orderModel from "../../../DB/models/orderModel.js";
import product_itemModel from "../../../DB/models/product_itemModel.js";
import { couponValidation } from "../../utils/couponValidation.js";
import { sendInvoice } from "../../utils/sendInvoice.js";
import { paymentFunction } from "../../utils/payment.js";
import Stripe from "stripe";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import couponModel from "../../../DB/models/couponModel.js";
import { signToken, verifyToken } from "../../utils/tokenMethod.js";
import userModel from "../../../DB/models/userModel.js";

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

    if (!req.coupon?.isPercentage) {
      if (
        req.coupon.couponAmount >
        productCheck.paymentPrice * productQuantity
      ) {
        return next(
          new Error("Coupon amount is greater than payment price ", {
            cause: 400,
          })
        );
      }
    }

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
  console.log(paymentMethod);
  const order = await orderModel.create({
    userID: req.user.id,
    products,
    coupon: req.coupon,
    subTotal: subtotal,
    finalPaidAmount: finalPaidAmount,
    phoneNumbers,
    address: userAddress ?? address,
    paymentMethod,
    couponID: req.coupon?._id ?? null,
    orderStatus: paymentMethod == "cash" ? "completed" : "pending",
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

  //================================ Payment ==========================================

  //webhook signing secret : whsec_8b51a138b7dee0e0e4fd38c55b96d4ad5c6115ebb17f8d46d858d3b304a44f47

  let token = signToken({
    payload: { orderID: order._id },
    signature: "order-completeee-signature",
  });

  console.log(token);

  let paymentData;

  if (order.paymentMethod === "card") {
    let stripeCoupon;
    //check if there is a coupon applied :
    if (couponCode) {
      const stripeConnection = new Stripe(process.env.STRIPE_KEY);
      if (req.coupon?.isPercentage) {
        stripeCoupon = await stripeConnection.coupons.create({
          percent_off: req.coupon?.couponAmount,
        });
      } else if (!req.coupon?.isPercentage) {
        stripeCoupon = await stripeConnection.coupons.create({
          amount_off: req.coupon?.couponAmount * 100,
          currency: "EGP",
        });
      }
    }

    paymentData = await paymentFunction({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      success_url: `http://localhost:5000/eCommerce/order/completeOrder/${token}`,
      cancel_url: `http://localhost:5000/eCommerce/order/cancelPayment/${token}`,
      line_items: [
        {
          price_data: {
            currency: "EGP",
            product_data: {
              name: productCheck.item_name,
            },
            unit_amount: productCheck.paymentPrice * 100,
          },
          quantity: productQuantity,
        },
      ],
      discounts: stripeCoupon ? [{ coupon: stripeCoupon.id }] : [],
    });
  }

  //================================= Invoice =========================================

  // await sendInvoice(order, req.user);

  //===================================================================================

  return res
    .status(200)
    .json({ message: "Order was successfully created", order, paymentData });
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
    couponID: req.coupon?.id ?? null,
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

  //================================ Payment ==========================================

  let token = signToken({
    payload: { orderID: order._id },
    signature: "order-completeee-signature",
  });

  let paymentData;

  if (order.paymentMethod === "card") {
    let stripeCoupon;
    //check if there is a coupon applied :
    if (couponCode) {
      const stripeConnection = new Stripe(process.env.STRIPE_KEY);
      if (req.coupon?.isPercentage) {
        stripeCoupon = await stripeConnection.coupons.create({
          percent_off: req.coupon?.couponAmount,
        });
      } else if (!req.coupon?.isPercentage) {
        stripeCoupon = await stripeConnection.coupons.create({
          amount_off: req.coupon?.couponAmount * 100,
          currency: "EGP",
        });
      }
    }

    paymentData = await paymentFunction({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      success_url: `http://localhost:5000/eCommerce/order/completeOrder/${token}`,
      cancel_url: `http://localhost:5000/eCommerce/order/cancelPayment/${token}`,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "EGP",
            product_data: {
              name: product.name,
            },
            unit_amount: product.unitPaymentPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: stripeCoupon ? [{ coupon: stripeCoupon.id }] : [],
    });
  }

  //======================== Invoice ============================

  await sendInvoice(order, req.user);

  //=============================================================

  return res
    .status(200)
    .json({ message: "Order was successfully created", order, paymentData });
};

//================================================================
//================================================================

export const requestNewPaymentSession = async (req, res, next) => {
  //check order if it is pending or not:
  //using payment data parameter:
  //check if user already used a coupon or not!
  const { orderID } = req.query;
  const order = await orderModel.findOne({ _id: orderID, userID: req.user.id });
  if (!order) {
    return next(
      new Error("Order not found or order is not owned by user !", {
        cause: 404,
      })
    );
  }
  if (order.orderStatus !== "pending") {
    return next(new Error("Order is completed !", { cause: 404 }));
  }
  if (order.couponID) {
    let coupon = await couponModel.findById(order.couponID);
    if (!coupon) {
      order.finalPaidAmount = order.subTotal;
      order.couponID = "";
      await order.save();
      return next(
        new Error(
          "Coupon not found. Order final payment price has been changed. Request new payment session !",
          { cause: 404 }
        )
      );
    }
    req.coupon = coupon;
  }

  //======================== Payment ===============================
  let token = signToken({
    payload: { orderID: order._id },
    signature: "order-completeee-signature",
  });

  let paymentData;
  let stripeCoupon;
  //check if there is a coupon applied :
  if (req.coupon) {
    const stripeConnection = new Stripe(process.env.STRIPE_KEY);
    if (req.coupon?.isPercentage) {
      stripeCoupon = await stripeConnection.coupons.create({
        percent_off: req.coupon?.couponAmount,
      });
    } else if (!req.coupon?.isPercentage) {
      stripeCoupon = await stripeConnection.coupons.create({
        amount_off: req.coupon?.couponAmount * 100,
        currency: "EGP",
      });
    }
  }

  paymentData = await paymentFunction({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: req.user.email,
    success_url: `http://localhost:5000/eCommerce/order/completeOrder/${token}`,
    cancel_url: `http://localhost:5000/eCommerce/order/cancelPayment/${token}`,
    line_items: order.products.map((product) => {
      return {
        price_data: {
          currency: "EGP",
          product_data: {
            name: product.name,
          },
          unit_amount: product.unitPaymentPrice * 100,
        },
        quantity: product.quantity,
      };
    }),
    discounts: stripeCoupon ? [{ coupon: stripeCoupon.id }] : [],
  });
  return res
    .status(200)
    .json({ message: "New payment session created !", order, paymentData });
};

//================================================================
//================================================================

export const completeOrder = async (req, res, next) => {
  const { token } = req.params;
  const decoded = verifyToken({
    token,
    signature: "order-completeee-signature",
  });
  if (!decoded?.orderID) {
    return next(new Error("Invalid token !", { cause: 400 }));
  }
  const order = await orderModel.findOneAndUpdate(
    { _id: decoded.orderID, orderStatus: "pending" },
    { orderStatus: "completed" },
    { new: true }
  );
  if (!order) {
    return next(new Error("Order not found or completed !", { cause: 404 }));
  }
  return res.status(200).json({ message: "Order completed successfully" });
};

//================================================================
//================================================================

export const getUserOrders = async (req, res, next) => {
  //Using api features , user can get pending orders or all orders:
  const apiFeatureInstance = new ApiFeatures(
    orderModel.find({ userID: req.user.id }),
    req.query
  )
    .sort()
    .paignation()
    .select()
    .filter();
  const orders = await apiFeatureInstance.mongooseQuery;
  if (!orders.length) {
    return next(new Error("Orders not found", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", orders });
};

//================================================================
//================================================================

export const cancelPayment = async (req, res, next) => {
  const { token } = req.params;
  const decoded = verifyToken({
    token,
    signature: "order-completeee-signature",
  });
  if (!decoded?.orderID) {
    return next(new Error("Invalid token !", { cause: 400 }));
  }
  const order = await orderModel.findOneAndUpdate(
    { _id: decoded.orderID, orderStatus: "pending" },
    { orderStatus: "cancelled" },
    { new: true }
  );
  if (!order) {
    return next(new Error("Order not found or cancelled !", { cause: 404 }));
  }

  //return selected products to stock;
  for (const product of order.products) {
    const productItem = await product_itemModel.findById(product.productID);
    if (!productItem) {
      return next(new Error("Product not found !", { cause: 404 }));
    }
    productItem.stock += product.quantity;
    await productItem.save();
  }

  //if Coupon , reduce used times of user :
  if (order.couponID) {
    const coupon = await couponModel.findById(order.couponID);
    if (!coupon) {
      return next(new Error("Coupon not found !", { cause: 404 }));
    }
    const checkUser = await userModel.findById(order.userID);
    if (!checkUser) {
      return next(new Error("User not found !", { cause: 404 }));
    }
    for (const user of coupon.assignedUsers) {
      if (checkUser._id.toString() === user.user_id.toString()) {
        user.usedTimes -= 1;
      }
    }
    await coupon.save();
  }

  return res.status(200).json({ message: "Order cancelled" });
};
