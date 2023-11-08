import connection from "../DB/connect.js";
import { globalErrorHandler } from "./utils/errorHandler.js";
import * as routers from "./modules/index.route.js";
import Stripe from "stripe";
import cors from "cors";
import morgan from "morgan";

const bootstrap = (app, express) => {
  //=========================== Webhook ============================================

  const stripe = new Stripe(process.env.STRIPE_KEY);
  app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    (req, res) => {
      let event = req.body;
      let endpointSecret =
        "whsec_8b51a138b7dee0e0e4fd38c55b96d4ad5c6115ebb17f8d46d858d3b304a44f47";

      if (endpointSecret) {
        const signature = req.headers["stripe-signature"];
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            endpointSecret
          );
        } catch (err) {
          console.log(
            `⚠️  Webhook signature verification failed.`,
            err.message
          );
          return res.sendStatus(400);
        }
      }

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          console.log(
            `PaymentIntent for ${paymentIntent.amount} was successful!`
          );
          console.log(event.data);

          break;

        default:
          console.log(`Unhandled event type ${event.type}.`);
      }

      res.send();
    }
  );

  //================================================================================

  app.use(express.json());
  app.use(morgan("dev"));
  const baseURL = `/eCommerce`;
  const port = 5000;
  app.use(cors());
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
  app.use(`${baseURL}/order`, routers.orderRouter);
  app.use(`${baseURL}/review`, routers.reviewRouter);
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
