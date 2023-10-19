import connection from "../DB/connect.js";
import { globalErrorHandler } from "./utils/errorHandler.js";
import * as routers from "./modules/index.route.js";

const bootstrap = (app, express) => {
  app.use(express.json());

  const baseURL = `/eCommerce`;
  const port = 5000;

  app.get("/", (req, res) => {
    return res.send("Hello e-commerce!!");
  });
  app.use(`${baseURL}/auth`, routers.authRouter);
  app.use(`${baseURL}/category`, routers.categoryRouter);
  app.use(`${baseURL}/subCategory`, routers.subCategoryRouter);
  app.use(`${baseURL}/brands`, routers.brandsRouter);
  app.use(`${baseURL}/product`, routers.productRouter);
  app.use(`${baseURL}/user`, routers.userRouter);
  app.use(`${baseURL}/coupon`, routers.couponRouter);
  app.use(`${baseURL}/cart`, routers.cartRouter);
  app.use("*", (req, res) => {
    res.json({ message: "In-valid routing .. " });
  });

  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`Server is running on port .. ${port} `);
  });

  connection();
};

export default bootstrap;
