export const refreshProductPrices = async (cart) => {
  let subTotal = 0;
  let updated = false;
  for (const product of cart.products) {
    if (product.unitPaymentPrice != product.productID.paymentPrice) {
      product.unitPaymentPrice = product.productID.paymentPrice;
      updated = true;
    }
    subTotal += product.quantity * product.unitPaymentPrice;
  }
  return {
    subTotal,
    updated,
  };
};
