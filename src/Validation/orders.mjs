import { body, validationResult } from "express-validator";

const AddOrderValidation = [
  body("city").notEmpty().withMessage("City is required").trim().escape(),
  body("Area").notEmpty().withMessage("Area is required").trim().escape(),
  body("street").notEmpty().withMessage("Street is required").trim().escape(),
  body("building")
    .notEmpty()
    .withMessage("Building is required")
    .isNumeric()
    .withMessage("Building must be a number")
    .escape(),
  body("floor")
    .notEmpty()
    .withMessage("Floor is required")
    .isNumeric()
    .withMessage("Floor must be a number")
    .escape(),
  body("apartment")
    .notEmpty()
    .withMessage("Apartment is required")
    .isNumeric()
    .withMessage("Apartment must be a number")
    .escape(),
  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["cash", "credit"])
    .withMessage("Payment method must be either 'cash' or 'credit'"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const UpdateOrderValidation = [
  body("currentStatus")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["accepted", "pending", "rejected", "on way", "delivered"])
    .withMessage(
      "Status must be accepted,rejected,on way, delivered, or pending"
    ),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export { AddOrderValidation, UpdateOrderValidation };
