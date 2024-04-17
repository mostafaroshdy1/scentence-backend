import express from "express";
import { User_Con } from "../Controllers/User.Controller.mjs";
import {
  validateSignup,
  validateLogin,
} from "../Validation/Auth.Validation.mjs";
const UserRoutes = express.Router();

UserRoutes.get("/signup", User_Con.signup_get);

UserRoutes.get("/login", User_Con.login_get);

UserRoutes.post("/signup", validateSignup, User_Con.signup_post);

UserRoutes.post("/login", validateLogin, User_Con.login_post);

UserRoutes.get("/logout", User_Con.logout_get);

export { UserRoutes };
