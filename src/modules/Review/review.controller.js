import reviewModel from "../../../DB/models/reviewModel.js";
import orderModel from "../../../DB/models/orderModel.js";
import product_itemModel from "../../../DB/models/product_itemModel.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";

export const addReview = async (req, res, next) => {
  //TODO : user can make only one review for a single product, But now
  //I will make multiple reviews on a single product by the same user to
  //make sure that total reviews of product is calculated correctly.
  const { rating, comment } = req.body;
  const { productID } = req.query;

  //   check user if user made review on the same product :
  const checkUniqieReviewOnSameProduct = await reviewModel.findOne({
    userID: req.user.id,
    productID,
  });
  if (checkUniqieReviewOnSameProduct) {
    return next(
      new Error("You have already reviewed this product !", { cause: 400 })
    );
  }

  const product = await product_itemModel.findById(productID);
  if (!product) {
    return next(new Error("No product was found !", { cause: 404 }));
  }

  //Check if user ordered product and order is not pending or cancelled:
  const isProductOrdered = await orderModel.find({
    userID: req.user.id,
    products: { $elemMatch: { productID } },
    orderStatus: { $nin: ["pending", "cancelled"] },
  });
  if (!isProductOrdered.length) {
    return next(
      new Error("You have not ordered this product !", { cause: 400 })
    );
  }

  const review = await reviewModel.create({
    userID: req.user.id,
    productID,
    rating,
    comment,
  });
  if (!review) {
    return next(new Error("Failed to add review !", { cause: 400 }));
  }

  //Calculate overall rating of product;
  //TODO : make it in a cronJob;
  let totalRate = 0;
  const reviews = await reviewModel.find({ productID });
  for (const review of reviews) {
    totalRate += review.rating;
  }
  product.rate = Number((totalRate / reviews.length).toFixed(2));
  await product.save();

  return res.status(200).json({
    message: "Review added successfully !",
    review,
  });
};

//=====================================================================
//=====================================================================

export const updateReview = async (req, res, next) => {
  const { _id, productID } = req.query;
  const { rating, comment } = req.body;
  const review = await reviewModel.findOne({
    _id,
    userID: req.user.id,
    productID,
  });
  if (!review) {
    return next(
      new Error("You can't update this review or invalid IDs !", { cause: 400 })
    );
  }
  const product = await product_itemModel.findById(productID);
  if (!product) {
    return next(new Error("No product was found !", { cause: 404 }));
  }
  if (rating) {
    let totalRate = 0;
    const reviews = await reviewModel.find({ productID });
    for (const review of reviews) {
      totalRate += review.rating;
    }
    product.rate = Number((totalRate / reviews.length).toFixed(2));
    await product.save();
    review.rating = rating;
    await review.save();
  }
  if (comment) {
    review.comment = comment;
    await review.save();
  }

  return res.status(200).json({
    message: "Review updated successfully !",
    review,
  });
};

//=====================================================================
//=====================================================================

export const deleteReview = async (req, res, next) => {
  const { _id } = req.query;
  const checkReview = await reviewModel.findById(_id);
  if (!checkReview) {
    return next(new Error("Review isn't found !", { cause: 400 }));
  }

  if (checkReview.userID.toString() !== req.user.id.toString()) {
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      return next(new Error("Not allowed to delete review !", { cause: 403 }));
    }
  }

  const deletedReview = await reviewModel.findByIdAndDelete(_id);
  if (!deletedReview) {
    return next(new Error("Failed to delete review !", { cause: 404 }));
  }
  return res.status(200).json({
    message: "Review deleted successfully !",
  });
};

//=====================================================================
