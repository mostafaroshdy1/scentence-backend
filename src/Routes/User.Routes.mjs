import express from "express";
import { checkUser, requireAuth } from "../Middleware/Auth.Middleware.mjs";
import { UserController } from "../Controllers/User.Controller.mjs";
import { validateEmail,validatePassword } from "../Validation/Reset.mjs";
const UserRoutes = express.Router();

UserRoutes.get("/profile", requireAuth, UserController.profile);

UserRoutes.get("/verify/:id/:uuid", UserController.verify);

UserRoutes.post("/ResetPassword",validateEmail ,UserController.resetLink);

UserRoutes.put("/ResetPassword/:id/",validatePassword ,UserController.resetLogic);


export { UserRoutes };
