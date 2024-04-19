import express from "express";
import { checkUser, requireAuth } from "../Middleware/Auth.Middleware.mjs";
import { UserController } from "../Controllers/User.Controller.mjs";
const UserRoutes = express.Router();

UserRoutes.get("/profile", requireAuth, UserController.profile);

UserRoutes.get("/verify/:id/:uuid", UserController.verify);

export { UserRoutes };
