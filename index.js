import express from "express";
const app = express();
import { config } from "dotenv";
import path from "path";
import bootstrap from "./src/initiateApp.js";
import { deleteNonConfirmedUsers } from "./src/utils/deleteNonConfirmedAcc.js";
import { startCronJob } from "./src/utils/deleteExpiredCoupons.js";
import {
  fakeBrandsDataGenerator,
  fakeCategoriesDataGenerator,
  fakeProductsDataGenerator,
  fakeSubCategoriesDataGenerator,
  fakeUsersDataGenerator,
  fakeProductItemsDataGenerator,
} from "./src/utils/fakeData.js";

config({ path: path.resolve("./config/config.env") });

deleteNonConfirmedUsers(); //Monthly check for unconfirmed users.
startCronJob(); // Weekly check for expired coupons

bootstrap(app, express);

//=====================================================
//==============Fake data Generator====================
//=====================================================

// fakeCategoriesDataGenerator();
// fakeSubCategoriesDataGenerator();
// fakeBrandsDataGenerator();
// fakeProductsDataGenerator();
// fakeProductItemsDataGenerator();
// fakeUsersDataGenerator();
