import express from "express";
const app = express();
import { config } from "dotenv";
import path from "path";
import bootstrap from "./src/initiateApp.js";
import { deleteNonConfirmedUsers } from "./src/utils/deleteNonConfirmedAcc.js";

import {
  fakeBrandsDataGenerator,
  fakeCategoriesDataGenerator,
  fakeProductsDataGenerator,
  fakeProuctDataGenerator,
  fakeSubCategoriesDataGenerator,
  fakeUsersDataGenerator,
} from "./src/utils/fakeData.js";
import productModel from "./DB/models/productModel.js";
config({ path: path.resolve("./config/config.env") });

app.use(express.urlencoded());

deleteNonConfirmedUsers();

bootstrap(app, express);

//=====================================================
//==============Fake data Generator====================
//=====================================================

// fakeCategoriesDataGenerator();
// fakeSubCategoriesDataGenerator();
// fakeProuctDataGenerator();
// fakeBrandsDataGenerator();
// fakeProductsDataGenerator();
// fakeUsersDataGenerator();

// await productModel.deleteMany({ brandID: "6522c3dc61ac11c0cc18d685" });
