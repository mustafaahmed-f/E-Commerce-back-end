import cron from "node-cron";
import async from "async";
import { CronJob } from "cron";
import product_itemModel from "../../DB/models/product_itemModel.js";

export const checkFinishedDiscountsCron = () => {
  // Create a new cron job that runs every week on Sundays at 12:00 AM (midnight)
  const cronJob = new CronJob(
    "0 0 * * *",
    async () => {
      try {
        // Find all coupons that have finished
        const products = await product_itemModel.find({
          discountFinishDate: { $lte: new Date() },
        });

        // Loop over the coupons asynchronously
        await async.eachSeries(products, async (product) => {
          // Delete the finished coupon
          await product_itemModel.findByIdAndUpdate(product._id, {
            discountFinished: true,
            paymentPrice: product.price,
            discountType: null,
            discount: 0,
            discountFinishDate: null,
          });
        });
      } catch (error) {
        // Log the error
        console.error("Error in cron job:", error);
        return new Error("Error in cron job:", error);
      }
    },
    null,
    true,
    "America/New_York"
  );

  // Start the cron job
  cronJob.start();
};
