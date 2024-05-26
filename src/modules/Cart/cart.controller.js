import userModel from "../../../DB/models/userModel.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("12345678!_=abcdefghmZxyiolk:*", 15);
import slugify from "slugify";
import couponModel from "../../../DB/models/couponModel.js";
import productModel from "../../../DB/models/productModel.js";
import cartModel from "../../../DB/models/cartModel.js";
import product_itemModel from "../../../DB/models/product_itemModel.js";
import { refreshProductPrices } from "../../utils/refreshProductPrices.js";
import { checkProductStock } from "../../utils/checkProductStock.js";
import { checkProductsExistenceInCart } from "../../utils/checkProductsExistenceInCart.js";

export const getUserCart = async (req, res, next) => {
  const cart = await cartModel
    .findOne({
      userID: req.user.id,
    })
    .populate({
      path: "products.productID",
      select: "item_name paymentPrice",
    });

  if (!cart) {
    return next(new Error("User doesn't have a cart !", { cause: 404 }));
  }

  const { subTotal, updated } = await refreshProductPrices(cart);

  const productsChanged = await checkProductsExistenceInCart(cart);

  //TODO: check if a product doesn't exist anymore in the DB:

  if (updated || productsChanged) {
    cart.subTotal = subTotal;
    await cart.save();
  }

  return res.status(200).json({ message: "Done", cart });
};

//================================================================
//================================================================

export const addToCart = async (req, res, next) => {
  const { productQuantity, colorAndSize, specifications } = req.body;
  const { productID } = req.query;
  const cart = await cartModel.findOne({
    userID: req.user.id,
  });

  // Check if product item is available:
  const productItem = await productModel.findById(productID);
  if (!productItem) {
    return next(new Error("Product item doesn't exist ", { cause: 404 }));
  }

  if (!productItem.overAllStock && !colorAndSize) {
    return next(new Error("You should specifiy color/size", { cause: 400 }));
  }

  //// Check if the user sent colorAndSize. if true then check if the size and color exist :
  if (colorAndSize) {
    const { size, color } = colorAndSize;
    const sizeExist = productItem.colorsAndSizes.find((el) => el.size === size);
    const colorExist = productItem.colorsAndSizes.find(
      (el) => el.color === color
    );
    if (!sizeExist || !colorExist) {
      return next(new Error("Invalid color or size !", { cause: 400 }));
    }
  }

  ////If user doesn't have a cart , create a new one:
  if (!cart) {
    //check product stock:

    checkProductStock({
      product: productItem,
      colorAndSize,
      productQuantity,
      next,
    });

    const newCart = await cartModel.create({
      userID: req.user.id,
      products: [
        {
          productID,
          name: productItem.item_name,
          unitPaymentPrice: productItem.paymentPrice,
          quantity: productQuantity,
          specifications: specifications ?? null,
          colorAndSize: colorAndSize ?? null,
        },
      ],
      subTotal: productItem.paymentPrice * productQuantity,
    });

    if (!newCart) {
      return next(new Error("Failed to create a new cart ! ", { cause: 400 }));
    }

    await productItem.save();

    return res.status(200).json({
      message: "Cart created successfully and first product has been added !",
      newCart,
    });
  }

  ////If user has a cart , check if cart has the product or not :
  let subTotal = 0;
  let updated = false;

  await Promise.allSettled(
    cart.products.map(async (product, i) => {
      // const currentProduct = await productModel.fintById(product.productID);

      if (
        String(product.productID) === String(productID) &&
        ((colorAndSize &&
          product.colorAndSize.color === colorAndSize.color &&
          product.colorAndSize.size === colorAndSize.size) ||
          !colorAndSize)
      ) {
        console.log("Found in cart !!");
        let newStock;
        let newSoldItems;

        if (productItem.overAllStock) {
          newStock = productItem.stock + product.quantity - productQuantity;
          if (newStock < 0) {
            return next(
              new Error("Quantity is out of range for product item ", {
                cause: 400,
              })
            );
          }
          newSoldItems =
            productItem.soldItems - product.quantity + productQuantity;
          productItem.stock = newStock;
          productItem.soldItems = newSoldItems;
        } else {
          newStock =
            productItem.colorsAndSizes.filter(
              (el) =>
                el.color === colorAndSize.color && el.size === colorAndSize.size
            )[0].stock +
            product.quantity -
            productQuantity;
          if (newStock < 0) {
            return next(
              new Error("Quantity is out of range for product item ", {
                cause: 400,
              })
            );
          }

          newSoldItems =
            productItem.colorsAndSizes.filter(
              (el) =>
                el.color === colorAndSize.color && el.size === colorAndSize.size
            )[0].soldItems -
            product.quantity +
            productQuantity;

          productItem.colorsAndSizes.filter(
            (el) =>
              el.color === colorAndSize.color && el.size === colorAndSize.size
          )[0].stock = newStock;

          productItem.colorsAndSizes.filter(
            (el) =>
              el.color === colorAndSize.color && el.size === colorAndSize.size
          )[0].soldItems = newSoldItems;
        }
        // let newStock = productItem.stock + product.quantity - quantity;

        await productItem.save();
        product.quantity = productQuantity;
        product.unitPaymentPrice = productItem.paymentPrice;
        updated = true;

        //reduce stock of product;
      }
    })
  ).catch((err) => next(new Error(err.message, { cause: 400 })));

  ////If cart hasn't the product , add it :
  if (!updated) {
    ////check product stock:
    checkProductStock({
      product: productItem,
      colorAndSize,
      productQuantity,
      next,
    });

    cart.products.push({
      productID,
      name: productItem.name,
      unitPaymentPrice: productItem.paymentPrice,
      quantity: productQuantity,
      specifications: specifications ?? null,
      colorAndSize: colorAndSize ?? null,
    });
  }
  //Calculated subtotal

  let numOfCartProduct = 0;
  await Promise.allSettled(
    cart.products.map(async (product) => {
      ++numOfCartProduct;
      const currentProduct = await productModel.findById(product.productID);

      if (!currentProduct) {
        return next(
          new Error(
            `Product number ${numOfCartProduct}  in cart wasn't found in data base. Please remove it from your cart !`,
            { cause: 404 }
          )
        );
      }
      subTotal += product.quantity * currentProduct.paymentPrice;
    })
  );

  cart.subTotal = subTotal;
  await productItem.save();
  await cart.save();

  return res.status(200).json({
    message: "Product has been added successfully to cart !",
    cart,
  });
};

//==========================================================
//==========================================================

export const updateCart = async (req, res, next) => {
  const { productQuantity, colorAndSize } = req.body;
  const { productID } = req.query;

  const { cart, productItem } = await checkCartAndProduct(
    req.user.id,
    productID
  );

  //// Check if the user sent colorAndSize. if true then check if the size and color exist :
  if (colorAndSize) {
    const { size, color } = colorAndSize;
    const sizeExist = productItem.colorsAndSizes.find((el) => el.size === size);
    const colorExist = productItem.colorsAndSizes.find(
      (el) => el.color === color
    );
    if (!sizeExist || !colorExist) {
      return next(new Error("Invalid color or size !", { cause: 400 }));
    }
  }

  let newSubTotal = 0;
  await Promise.all(
    cart.products.map(async (product) => {
      const currentProduct = await productModel.findById(product.productID);

      if (String(product.productID) === String(productID)) {
        if (productItem.overAllStock) {
          productItem.stock =
            productItem.stock + product.quantity - productQuantity;
          productItem.soldItems =
            productItem.soldItems - product.quantity + productQuantity;

          product.quantity = productQuantity;
          product.unitPaymentPrice = currentProduct.paymentPrice;
        } else if (!productItem.overAllStock) {
          console.log("Here");
          let tragetColorAndSize = currentProduct.colorsAndSizes.filter(
            (el) =>
              el.color === colorAndSize.color && el.size === colorAndSize.size
          );

          let remainingArray = currentProduct.colorsAndSizes.filter(
            (el) =>
              el.color !== colorAndSize.color && el.size !== colorAndSize.size
          );

          console.log("Target color and size", tragetColorAndSize);
          console.log("Remaining array", remainingArray);

          tragetColorAndSize[0].stock =
            tragetColorAndSize[0].stock + product.quantity - productQuantity;
          tragetColorAndSize[0].soldItems =
            tragetColorAndSize[0].soldItems -
            product.quantity +
            productQuantity;

          productItem.colorsAndSizes = [
            ...remainingArray,
            ...tragetColorAndSize,
          ];

          if (
            product.colorAndSize.color === colorAndSize.color &&
            product.colorAndSize.size === colorAndSize.size
          ) {
            product.quantity = productQuantity;
            product.unitPaymentPrice = currentProduct.paymentPrice;
          }
        }
      }

      newSubTotal += product.quantity * currentProduct.paymentPrice;
    })
  );

  await productItem.save();

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
  const { colorAndSize } = req.body;
  const { productID } = req.query;

  const { cart, productItem } = await checkCartAndProduct(
    req.user.id,
    productID,
    next
  );

  if (!productItem.overAllStock && !colorAndSize) {
    return next(new Error("Please provide color and size !", { cause: 400 }));
  }

  //// Check if the user sent colorAndSize. if true then check if the size and color exist :
  if (colorAndSize) {
    const { size, color } = colorAndSize;
    const sizeExist = productItem.colorsAndSizes.find((el) => el.size === size);
    const colorExist = productItem.colorsAndSizes.find(
      (el) => el.color === color
    );
    if (!sizeExist || !colorExist) {
      return next(new Error("Invalid color or size !", { cause: 400 }));
    }
  }

  let productQuantity = 0;

  await Promise.allSettled(
    cart.products.map(async (product) => {
      if (product.productID == productID) {
        if (productItem.overAllStock) {
          productItem.stock = productItem.stock + product.quantity;
          productItem.soldItems = productItem.soldItems - product.quantity;
          productQuantity = product.quantity;
          cart.products = cart.products.filter(
            (el) => el.productID != productID
          );
        } else if (!productItem.overAllStock) {
          let tragetColorAndSize = productItem.colorsAndSizes.find(
            (el) =>
              el.color === colorAndSize?.color && el.size === colorAndSize?.size
          );

          cart.products = cart.products.filter(
            (el) =>
              el.colorAndSize.color !== colorAndSize?.color &&
              el.colorAndSize.size !== colorAndSize?.size
          );

          if (
            product.colorAndSize?.color === colorAndSize?.color &&
            product.colorAndSize?.size === colorAndSize?.size
          ) {
            productQuantity = product.quantity;
            tragetColorAndSize.stock =
              tragetColorAndSize.stock + product.quantity;
            tragetColorAndSize.soldItems =
              tragetColorAndSize.soldItems - product.quantity;
          }
        }
      }
    })
  );

  cart.subTotal = cart.subTotal - productItem.paymentPrice * productQuantity;

  await productItem.save();
  const updatedCart = await cart.save();
  if (!updatedCart) {
    return next(
      new Error("Failed to remove product from cart !", { cause: 400 })
    );
  }

  return res.status(200).json({
    message: "Product has been removed successfully successfully !",
    updatedCart,
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
//===============Check cart & product=======================
//==========================================================

export const checkCartAndProduct = async (userID, productID, next) => {
  const cart = await cartModel.findOne({
    userID,
  });
  if (!cart) {
    return next(new Error("User doesn't have a cart !", { cause: 404 }));
  }

  //// Check if product item is available:
  const productItem = await productModel.findById(productID);
  if (!productItem) {
    await cartModel.findByIdAndUpdate(cart._id, {
      $pull: {
        products: {
          productID,
        },
      },
    });
    return next(
      new Error(
        "Product item doesn't exist and has been removed from your cart",
        { cause: 404 }
      )
    );
  }

  ////check if product item exists in cart:
  const productExists = await new Promise((resolve) => {
    setTimeout(() => {
      resolve(cart.products.find((item) => item.productID == productID));
    }, 0);
  });

  if (!productExists) {
    return next(
      new Error("Product item doesn't exist in cart !", { cause: 404 })
    );
  }

  return {
    cart,
    productItem,
  };
};
