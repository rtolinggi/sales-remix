import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { constant } from "~/config/constant";

const createTtansporter = (email: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: constant.EMAIL_HOST,
    auth: {
      user: constant.EMAIL_USER,
      pass: constant.EMAIL_PASSWORD,
    },
  });

  const mailOptions: SendMailOptions = {
    from: constant.EMAIL_USER,
    to: email,
    subject: subject,
    html: html,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(info.accepted, info.rejected, info.pending);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
};

export default createTtansporter;
