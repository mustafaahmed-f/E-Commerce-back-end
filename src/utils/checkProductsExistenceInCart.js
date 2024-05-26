import productModel from "../../DB/models/productModel.js";

export async function checkProductsExistenceInCart(cart) {
  let productsChanged = false;
  await Promise.allSettled(
    cart.products.map(async (product) => {
      const checkProduct = await productModel.findById(product.productID);

      if (!checkProduct) {
        cart.products.filter((el) => el.productID != product.productID);
        productsChanged = true;
      }
    })
  );
  return productsChanged;
}
