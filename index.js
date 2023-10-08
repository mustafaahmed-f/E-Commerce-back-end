import express from "express";
const app = express();
import { config } from "dotenv";
import path from "path";
import connection from "./DB/connect.js";
import bootstrap from "./src/initiateApp.js";
import { deleteNonConfirmedUsers } from "./src/utils/deleteNonConfirmedAcc.js";
import userModel from "./DB/models/userModel.js";
import {
  fakeBrandsDataGenerator,
  fakeCategoriesDataGenerator,
  fakeProuctDataGenerator,
  fakeSubCategoriesDataGenerator,
} from "./src/utils/fakeData.js";
config({ path: path.resolve("./config/config.env") });

app.use(express.urlencoded());

deleteNonConfirmedUsers();

bootstrap(app, express);

// fakeCategoriesDataGenerator();
// fakeSubCategoriesDataGenerator();
// fakeProuctDataGenerator();
// fakeBrandsDataGenerator();
