import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { VerificationModel } from "../Model/Verification.Model.mjs";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "ziadmohamed770@outlook.com",
    pass: "Ziad3390052698",
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
  const uniqueString = uuidv4() + _id;
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify your email",
    html: `<p>Verify your email</p><br><a href="${
      currentURL + "vser/verify/" + _id + "/" + uniqueString
    }">here</a>`,
  };

  const salt = await bcrypt.genSalt(10);

  const hashedUniqueString = await bcrypt.hash(uniqueString, salt);

  const Verification = await VerificationModel.create({
    userID: _id,
    uniqueString: hashedUniqueString,
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
