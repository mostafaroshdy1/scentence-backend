import express from "express";
import { checkUser, requireAuth } from "../Middleware/Auth.Middleware.mjs";
import { User_Con } from "../Controllers/User.Controller.mjs";
const UserRoutes = express.Router();

UserRoutes.get("/profile", requireAuth, User_Con.profile);

export { UserRoutes };
