import schedule from "node-schedule";
import userModel from "../../DB/models/userModel.js";

export const deleteNonConfirmedUsers = () => {
  schedule.scheduleJob("* * * */1 *", async function () {
    const dateNow = new Date().getTime();
    const users = await userModel.find();

    for (const user of users) {
      const createdDate = new Date(user.createdAt).getTime();
      const diffDay = (dateNow - createdDate) / (1000 * 60 * 60 * 24);
      // console.log(diffDay);
      if (user.isConfirmed == false && diffDay >= 30) {
        await userModel.findByIdAndDelete(user._id);
      }
    }
  });
};
