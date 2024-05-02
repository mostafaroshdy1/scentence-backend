import nodemailer from "nodemailer";
import crypto from "crypto";
import { VerificationModel } from "../Model/Verification.Model.mjs";
// import dotenv from "dotenv";
// dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.AUTH_SERVICE,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

transporter.verify((err, Success) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Ready for messages");
    console.log(Success);
  }
});

const sendVerificationEmail = async (
  { _id, email },
  subject,
  text,
  baseRoute
) => {
  const currentURL = process.env.BackendUrl || "http://localhost:3000";
  const uniqueString = crypto.randomBytes(32).toString("hex");
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: subject,
    html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa; border-radius: 10px; box-shadow: 0px 0px 20px 0px rgba(0,0,0,0.1);">
    <h1 style="text-align: center; color: #007bff;">Welcome to Our Platform!</h1>
    <p style="font-size: 16px; color: #333; line-height: 1.6;">${text}</p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="${
        currentURL + baseRoute + _id + "/" + uniqueString
      }" style="display: inline-block; padding: 15px 40px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-size: 18px;">Verify Email</a>
    </div>
    <p style="font-size: 14px; color: #777; margin-top: 20px; text-align: center;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
    <p style="font-size: 14px; color: #007bff; text-align: center;">${
      currentURL + baseRoute + _id + "/" + uniqueString
    }</p>
  </div>`,
  };

  const Verification = await VerificationModel.create({
    userID: _id,
    uniqueString: uniqueString,
    createdAt: Date.now(),
    expireAt: new Date(Date.now() + 21600000),
  });

  if (Verification) {
    console.log("Verification Saved Successfully");
    transporter
      .sendMail(mailOptions)
      .then(() => {
        console.log("Success");
      })
      .catch((err) => {
        console.log("Failed to send Mail");
      });
  } else {
    console.log("Failed To save verification");
  }
};

export { sendVerificationEmail };
