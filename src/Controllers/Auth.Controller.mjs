import { UserModel } from "../Model/User.Model.mjs";
import { validationResult } from "express-validator";
import { sendVerificationEmail } from "../utils/sendmail.mjs";
import { VerificationModel } from "../Model/Verification.Model.mjs";

import jwt from "jsonwebtoken";

const baseUrl = process.env.baseUrl || "http://localhost:4200";

const createToken = (id, email, role, username, verified) => {
  return jwt.sign(
    { id, email, role, username, verified },
    process.env.JWT_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE_DURATION,
    }
  );
};

const signup_post = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, username, password, gender } = req.body;

  const user = await UserModel.create({
    email,
    username,
    password,
    gender,
    verified: false,
  });

  const subject = "Account Verification";
  const text = "Please Verify your account";
  const route = "/verify/";
  sendVerificationEmail(
    { _id: user._id, email: user.email },
    subject,
    text,
    route
  );

  const token = createToken(
    user._id,
    user.email,
    user.role,
    user.username,
    user.verified
  );
  return res.status(200).json({
    token: token,
    msg: `${username} Registerd Successfully , A Verification Email Sent to your inbox `,
  });
};

const login_post = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await UserModel.login(req.body.email, req.body.password);
    const token = createToken(
      user._id,
      user.email,
      user.role,
      user.username,
      user.verified
    );
    return res.status(200).json({ token: token, msg: "Login Success" });
  } catch (error) {
    return res.status(400).json({ Error: error.message });
  }
};

const verify = async (req, res) => {
  const { id, uuid } = req.params;
  try {
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      console.log("No User");
      return res.status(400).json({ Status: 400, Error: "Invalid Link" });
    }

    const uid = await VerificationModel.findOne({
      userID: user._id,
      uniqueString: uuid,
    });

    if (!uid) {
      console.log("No UUID");
      return res.status(400).json({ Status: 400, Error: "Invalid Link" });
    }

    const currentDate = new Date();

    if (uid.expireAt < currentDate) {
      return res.status(400).json({ status: 400, Error: "Link Expired" });
    }

    const verified = await UserModel.updateOne(
      {
        _id: user._id,
      },
      {
        verified: true,
      }
    );
    await VerificationModel.findByIdAndDelete(uid._id);

    if (verified) {
      // return res
      //   .status(200)
      //   .json({ Status: 200, Msg: "User Verified Successfully" });
      return res.redirect(baseUrl + "/verify?status=verified");
    } else {
      return res.redirect(baseUrl + "/verify?status=verified");
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ Status: 400, Error: "Error Occurred" });
  }
};

const Auth_Con = { signup_post, login_post, verify };

export { Auth_Con };
