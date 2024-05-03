import async from "async";
import { CronJob } from "cron";
import couponModel from "../../DB/models/couponModel.js";

export const startCronJob = () => {
  // Create a new cron job that runs every week on Sundays at 12:00 AM (midnight)
  const cronJob = new CronJob(
    "0 0 * * 0",
    async () => {
      try {
        // Find all coupons that have finished
        const coupons = await couponModel.find({
          toDate: { $lte: new Date() },
        });

        // Loop over the coupons asynchronously
        await async.eachSeries(coupons, async (coupon) => {
          // Delete the finished coupon
          await couponModel.findByIdAndDelete(coupon._id);
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
