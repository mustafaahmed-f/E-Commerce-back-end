import Stripe from "stripe";

export const paymentFunction = async ({
  payment_method_types = ["card"],
  mode = "payment",
  discounts,
  customer_email,
  success_url,
  cancel_url,
  line_items,
  metadata,
  expires_at = Math.floor(new Date() / 1000 + 60 * 60),
}) => {
  const stripeConnection = new Stripe(process.env.STRIPE_KEY);
  const payment = await stripeConnection.checkout.sessions.create({
    payment_method_types,
    mode,
    discounts,
    customer_email,
    success_url,
    cancel_url,
    metadata,
    line_items,
    expires_at,
  });

  return payment;
};
