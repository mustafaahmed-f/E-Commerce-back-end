export function checkProductStock({
  product,
  colorAndSize,
  productQuantity,
  next,
}) {
  if (product.overAllStock) {
    if (product.stock < productQuantity) {
      return next(new Error("Quantity is out of range !", { cause: 404 }));
    }
    product.stock -= productQuantity;
    product.soldItems += productQuantity;
  } else {
    let targetArray = product.colorsAndSizes.filter(
      (el) => el.color === colorAndSize.color && el.size === colorAndSize.size
    );
    if (!targetArray.length) {
      return next(new Error("Color and size not found !", { cause: 404 }));
    }

    if (targetArray[0].stock < productQuantity) {
      return next(new Error("Quantity is out of range !", { cause: 404 }));
    }

    targetArray[0].stock -= productQuantity;
    targetArray[0].soldItems += productQuantity;
  }
}
