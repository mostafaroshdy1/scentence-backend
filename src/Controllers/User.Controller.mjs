import { UserModel } from "../Model/User.Model.mjs";
import { validationResult } from "express-validator";

import { createToken } from "../utils/auth.mjs";

const signup_get = (req, res) => {
  //res.render("signup");
};

const login_get = (req, res) => {
  //res.render("login");
};

const logout_get = (req, res) => {
  //res.render("logout");
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
  });

  const token = createToken(user._id, user.email);
  res.cookie("jwt", token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
  return res
    .status(200)
    .json({ msg: "User Registerd Successfully", user_ID: user._id, token: token});
};

const login_post = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await UserModel.login(req.body.email, req.body.password);
    const token = createToken(user._id, user.email);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ msg: "Login Success", user_ID: user._id , token: token});
  } catch (error) {
    return res.status(400).json({ Error: error.message });
  }
};

const User_Con = { signup_get, login_get, signup_post, login_post, logout_get };

export { User_Con };
