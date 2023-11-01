import { nanoid } from "nanoid";
import createInvoice from "./pdfkit.js";
import sendEmail from "../services/sendEmail.js";
export const sendInvoice = async (order, user) => {
  const orderCode = `${user.userName}_${nanoid(3)}`;

  const invoice = {
    orderCode,
    date: order.createdAt,
    shipping: {
      name: user.userName,
      address: order.address.address_line1,
      city: order.address.city,
      state: order.address.region,
      country: order.address.country,
    },
    items: order.products,
    subTotal: order.subTotal,
    paidAmount: order.finalPaidAmount,
  };

  await createInvoice(invoice, `${orderCode}.pdf`);

  const isEmailSent = await sendEmail({
    from: "mostafafikry971@gmail.com",
    to: user.email,
    subject: "Order invoice",
    message: `<h1> please find your invoice below </h1>`,
    attachments: [
      {
        path: `./Files/${orderCode}.pdf`,
      },
    ],
  });

  if (!isEmailSent) {
    return next(new Error("Failed to send email", { cause: 500 }));
  }
};
