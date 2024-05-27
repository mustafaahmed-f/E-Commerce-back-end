import express from "express";
const app = express();
import { config } from "dotenv";
import path from "path";
import bootstrap from "./src/initiateApp.js";
import { deleteNonConfirmedUsers } from "./src/utils/deleteNonConfirmedAcc.js";
import { deleteExpiredCouponsCron } from "./src/utils/deleteExpiredCoupons.js";
import { checkFinishedDiscountsCron } from "./src/utils/checkFinishedDiscounts.js";
import {
  fakeBrandsDataGenerator,
  fakeCategoriesDataGenerator,
  fakeProductsDataGenerator,
  fakeSubCategoriesDataGenerator,
  fakeUsersDataGenerator,
} from "./src/utils/fakeData.js";

config({ path: path.resolve("./config/config.env") });

deleteNonConfirmedUsers(); //Monthly check for unconfirmed users.
deleteExpiredCouponsCron(); // Weekly check for expired coupons
checkFinishedDiscountsCron(); //Daily check for finished discounts

bootstrap(app, express);

//=====================================================
//==============Fake data Generator====================
//=====================================================

// fakeCategoriesDataGenerator();
// fakeSubCategoriesDataGenerator();
// fakeBrandsDataGenerator();
// fakeProductsDataGenerator();
// fakeUsersDataGenerator();
