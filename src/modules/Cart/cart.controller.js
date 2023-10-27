import userModel from "../../../DB/models/userModel.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("12345678!_=abcdefghmZxyiolk:*", 15);
import slugify from "slugify";
import couponModel from "../../../DB/models/couponModel.js";
import productModel from "../../../DB/models/productModel.js";
import cartModel from "../../../DB/models/cartModel.js";
import product_itemModel from "../../../DB/models/product_itemModel.js";

export const getUserCart = async (req, res, next) => {
  const cart = await cartModel
    .findOne({
      userID: req.user.id,
    })
    .populate({
      path: "products.productID",
      select: "item_name paymentPrice",
    });

  //TODO : check if price changed ;

  if (!cart) {
    return next(new Error("User doesn't have a cart !", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", cart });
};

//================================================================
//================================================================

export const addToCart = async (req, res, next) => {
  const { productID, quantity } = req.body;
  const cart = await cartModel.findOne({
    userID: req.user.id,
  });

  // Check if product item is available:
  const productItem = await product_itemModel.findById(productID);
  if (!productItem) {
    return next(new Error("Product item doesn't exist ", { cause: 404 }));
  }

  //If user doesn't have a cart , create a new one:
  if (!cart) {
    //check product stock:
    if (productItem.stock < quantity) {
      return next(
        new Error("Quantity is out of range for product item ", { cause: 400 })
      );
    }
    const newCart = await cartModel.create({
      userID: req.user.id,
      products: [
        {
          productID,
          unitPaymentPrice: productItem.paymentPrice,
          quantity,
        },
      ],
      subTotal: productItem.paymentPrice * quantity,
    });

    if (!newCart) {
      return next(new Error("Failed to create a new cart ! ", { cause: 400 }));
    }
    //update stock
    productItem.stock = productItem.stock - quantity;
    await productItem.save();

    return res.status(200).json({
      message: "Cart created successfully and first product has been added !",
      newCart,
    });
  }

  //If user has a cart , check if cart has the product or not :
  let subTotal = 0;
  let updated = false;
  for (const product of cart.products) {
    if (product.productID == productID) {
      let newStock = productItem.stock + product.quantity - quantity;
      if (newStock < 0) {
        return next(
          new Error("Quantity is out of range for product item ", {
            cause: 400,
          })
        );
      }
      productItem.stock = newStock;
      await productItem.save();
      product.quantity = quantity;
      product.unitPaymentPrice = productItem.paymentPrice;
      updated = true;
      console.log(updated);
      //reduce stock of product;
    }
  }
  if (!updated) {
    console.log(updated);
    if (productItem.stock < quantity) {
      return next(
        new Error("Quantity is out of range for product item ", { cause: 400 })
      );
    }
    cart.products.push({
      productID,
      unitPaymentPrice: productItem.paymentPrice,
      quantity,
    });
    productItem.stock = productItem.stock - quantity;
    await productItem.save();
  }
  //Calculated subtotal
  for (const product of cart.products) {
    const currentProduct = await product_itemModel.findById(product.productID);
    if (!currentProduct) {
      return next(
        new Error(
          `Product item with id : (${currentProduct._id}) that exists in cart isn't found in data base.
           Please remove it from your cart !`,
          { cause: 404 }
        )
      );
    }
    subTotal += product.quantity * currentProduct.paymentPrice;
  }

  cart.subTotal = subTotal;
  await cart.save();

  return res.status(200).json({
    message: "Product item has been added successfully to cart !",
    cart,
  });
};

//==========================================================
//==========================================================

export const updateCart = async (req, res, next) => {
  const { productID, quantity } = req.body;

  const { cart, productItem } = await checkCartAndProduct(
    req.user.id,
    productID
  );

  let newSubTotal = 0;
  for (const product of cart.products) {
    const currentProduct = await product_itemModel.findById(product.productID);
    if (product.productID == productID) {
      productItem.stock = productItem.stock + product.quantity - quantity;
      await productItem.save();
      product.quantity = quantity;
      product.unitPaymentPrice = productItem.paymentPrice;
    }

    newSubTotal += product.quantity * currentProduct.paymentPrice;
  }
  cart.subTotal = newSubTotal;
  const updatedCart = await cart.save();

  if (!updatedCart) {
    return next(new Error("Failed to update cart !", { cause: 400 }));
  }

  return res.status(200).json({
    message: "Cart updated successfully !",
    updatedCart,
  });
};

//==========================================================
//==========================================================

export const deleteFromCart = async (req, res, next) => {
  const { productID } = req.body;

  const { cart, productItem } = await checkCartAndProduct(
    req.user.id,
    productID
  );

  cart.products = cart.products.filter(async (product) => {
    if (product.productID == productID) {
      productItem.stock = productItem.stock + product.quantity;
      await productItem.save();
    }
    return product.productID != productID;
  });

  await cart.save();
  return res.status(200).json({
    message: "Product has been removed successfully successfully !",
    cart,
  });
};

//==========================================================
//==========================================================

export const removeCart = async (req, res, next) => {
  //Find cart by userID and remove it
  //update products' stocks
  const cart = await cartModel.findOne({
    userID: req.user.id,
  });
  if (!cart) {
    return next(new Error("User doesn't have a cart !", { cause: 404 }));
  }

  for (const product of cart.products) {
    const currentProduct = await product_itemModel.findById(product.productID);
    currentProduct.stock = currentProduct.stock + product.quantity;
    await currentProduct.save();
  }

  const removeCart = await cartModel.findOneAndDelete({
    userID: req.user.id,
  });
  if (!removeCart) {
    return next(new Error("Failed to remove cart !", { cause: 400 }));
  }
  return res.status(200).json({
    message: "Cart removed successfully !",
  });
};

//==========================================================
//==========================================================

export const emptyCart = async (req, res, next) => {
  const cart = await cartModel.findOne({
    userID: req.user.id,
  });
  if (!cart) {
    return next(new Error("User doesn't have a cart !", { cause: 404 }));
  }

  for (const product of cart.products) {
    const currentProduct = await product_itemModel.findById(product.productID);
    currentProduct.stock = currentProduct.stock + product.quantity;
    await currentProduct.save();
  }
  cart.products = [];
  await cart.save();

  return res.status(200).json({
    message: "Cart emptied successfully !",
    cart,
  });
};

//==========================================================
//==============Refresh product proces in cart =============
//==========================================================

export const refreshPrices = async () => {};

//==========================================================
//===============Check cart & product=======================
//==========================================================

export const checkCartAndProduct = async (userID, productID) => {
  const cart = await cartModel.findOne({
    userID,
  });
  if (!cart) {
    return next(new Error("User doesn't have a cart !", { cause: 404 }));
  }

  // Check if product item is available:
  const productItem = await product_itemModel.findById(productID);
  if (!productItem) {
    return next(new Error("Product item doesn't exist ", { cause: 404 }));
  }

  //check if product item exists in cart:
  if (!cart.products.find((item) => item.productID == productID)) {
    return next(
      new Error("Product item doesn't exist in cart !", { cause: 404 })
    );
  }

  return {
    cart,
    productItem,
  };
};
