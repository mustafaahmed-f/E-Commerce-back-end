import nodemailer from "nodemailer";

const sendEmail = async ({
  from = "mostafafikry971@gmail.com",
  to,
  subject = "Confirm email",
  html,
  attachments,
  user = process.env.EMAIL,
  pass = process.env.EMAIL_PASSWORD,
} = {}) => {
  const transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from: `"M Store" <${from}>`,
    to,
    subject,
    html,
    attachments,
  });

  if (info.accepted.length) {
    return true;
  }
  return false;
};

export default sendEmail;
