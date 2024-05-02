import express from "express";
import { Auth_Con } from "../Controllers/Auth.Controller.mjs";
import {
  validateSignup,
  validateLogin,
} from "../Validation/Auth.Validation.mjs";
const AuthRoutes = express.Router();

AuthRoutes.post("/signup", validateSignup, Auth_Con.signup_post);

AuthRoutes.post("/login", validateLogin, Auth_Con.login_post);

AuthRoutes.get("/verify/:id/:uuid", Auth_Con.verify);

export { AuthRoutes };
