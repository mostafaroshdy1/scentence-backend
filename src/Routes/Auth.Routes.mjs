import express from "express";
import { Auth_Con } from "../Controllers/Auth.Controller.mjs";
import {
  validateSignup,
  validateLogin,
} from "../Validation/Auth.Validation.mjs";
const AuthRoutes = express.Router();

AuthRoutes.get("/signup", Auth_Con.signup_get);

AuthRoutes.get("/login", Auth_Con.login_get);

AuthRoutes.post("/signup", validateSignup, Auth_Con.signup_post);

AuthRoutes.post("/login", validateLogin, Auth_Con.login_post);

AuthRoutes.get("/logout", Auth_Con.logout_get);

export { AuthRoutes };
