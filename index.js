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
  fakeSubCategoriesDataGenerator,
  fakeUsersDataGenerator,
} from "./src/utils/fakeData.js";
import productModel from "./DB/models/productModel.js";
import subCategoryModel from "./DB/models/subCategoryModel.js";
config({ path: path.resolve("./config/config.env") });

app.use(express.urlencoded());

deleteNonConfirmedUsers(); //Monthly check for unconfirmed users.

bootstrap(app, express);

//=====================================================
//==============Fake data Generator====================
//=====================================================

// fakeCategoriesDataGenerator();
// fakeSubCategoriesDataGenerator();
// fakeBrandsDataGenerator();
// fakeProductsDataGenerator();
// fakeUsersDataGenerator();

// await subCategoryModel.deleteMany({ categoryID: "6522a166729b40027df17245" });
