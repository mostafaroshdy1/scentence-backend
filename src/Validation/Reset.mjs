import { body } from "express-validator";
import { ExpressError } from "../utils/ExpressError.mjs";
import { UserModel } from "../Model/User.Model.mjs";

const validateEmail = [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email"),
];

const validatePassword = [
    body("password")
    .notEmpty()
    .withMessage("Password Required")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long")
];

export {validateEmail,validatePassword};