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

const sendVerificationEmail = async ({ _id, email }, res) => {
  const currentURL = "http://localhost:3000";
  const uniqueString = crypto.randomBytes(32).toString("hex");
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify your email",
    html: `<p>Verify your email</p><br><a href="${
      currentURL + "/User/verify/" + _id + "/" + uniqueString
    }">here</a>`,
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
