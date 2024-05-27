import express from "express";
import { checkUser, requireAuth } from "../Middleware/Auth.Middleware.mjs";
import { UserController } from "../Controllers/User.Controller.mjs";
import { validateEmail, validatePassword } from "../Validation/Reset.mjs";
import { isAdmin } from "../Middleware/admin.mjs";
import { isOwner } from "../Middleware/user.mjs";
const UserRoutes = express.Router();

UserRoutes.get("/count", UserController.countUsers);

UserRoutes.get("/profile", requireAuth, UserController.profile);

// UserRoutes.get('/verify/:id/:uuid', UserController.verify);

// Admin

UserRoutes.get("/:id", requireAuth, isOwner, UserController.getUser);

UserRoutes.delete("/:id", requireAuth, isAdmin, UserController.deleteUser);

UserRoutes.get("/", requireAuth, isAdmin, UserController.getUsers);

UserRoutes.post("/ResetPassword", validateEmail, UserController.resetLink);

UserRoutes.put(
  "/ResetPassword/:id/",
  validatePassword,
  isOwner,
  UserController.resetLogic
);

UserRoutes.put("/email", validateEmail, UserController.emailUpdate);

export { UserRoutes };
