import { body } from "express-validator";
import { ExpressError } from "../utils/ExpressError.mjs";
import { UserModel } from "../Model/User.Model.mjs";
const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .notEmpty()
    .withMessage("Email is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

const validateSignup = [
  body("email")
    .custom(async (value, { req }) => {
      const existingUser = await UserModel.findOne({ email: value });
      if (existingUser) {
        throw new ExpressError("Email is already registered", 400);
      }
      return true;
    })
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),
  body("username")
    .custom(async (value, { req }) => {
      const existingUser = await UserModel.findOne({ username: value });
      if (existingUser) {
        throw new ExpressError("Username is already registered", 400);
      }
      return true;
    })
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .notEmpty()
    .withMessage("Username is required")
    .isAlphanumeric()
    .withMessage("Username must contain only letters and numbers")
    .custom((value, { req }) => {
      if (/\s/.test(value)) {
        throw new ExpressError("Username must not contain spaces", 400);
      }
      return true;
    }),

  body("password")
    .isLength({ min: 6 })
    .notEmpty()
    .withMessage("Password must be at least 6 characters long"),

  body("gender")
    .isIn(["male", "female"])
    .withMessage("Gender must be Male or Female")
    .notEmpty()
    .withMessage("Gender is Required"),
];

export { validateSignup, validateLogin };
