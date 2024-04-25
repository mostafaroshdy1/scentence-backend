import { body, validationResult } from "express-validator";

const AddProductValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ min: 3 })
    .withMessage("Category must be at least 3 characters")
    .custom((value) => {
      const category = value.toLowerCase();
      if (!["men", "women", "kids"].includes(category)) {
        throw new Error("Category must be either men, women, or kids");
      }
      return true;
    }),
  body("image").custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error("Image is required");
    }

    for (const file of req.files) {
      if (
        !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
          file.mimetype
        )
      ) {
        throw new Error("Image must be a PNG, JPG, or JPEG file");
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image size exceeds the limit");
      }
    }

    return true;
  }),
  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isNumeric()
    .withMessage("Stock must be a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export { AddProductValidation };
