import { UserModel } from "../Model/User.Model.mjs";
import { validationResult } from "express-validator";
import { sendVerificationEmail } from "../utils/sendmail.mjs";
import { createToken } from "../utils/auth.mjs";

const signup_get = (req, res) => {
  //res.render("signup");
};

const login_get = (req, res) => {
  //res.render("login");
};

const signup_post = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, username, password, image, gender } = req.body;

  const user = await UserModel.create({
    email,
    username,
    password,
    image,
    gender,
    verified: false,
  });

  const subject = "Account Verification";
  const text = "Please Verify your account";
  const route = "/User/verify/";
  sendVerificationEmail({ _id: user._id, email: user.email }, subject,text,route);

  const token = createToken(user._id);
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
    const token = createToken(user._id);
    return res.status(200).json({ token: token, msg: "Login Success" });
  } catch (error) {
    return res.status(400).json({ Error: error.message });
  }
};

const Auth_Con = { signup_get, login_get, signup_post, login_post };

export { Auth_Con };
