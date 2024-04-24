import { body, validationResult } from 'express-validator';

const AddProductValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 4 })
    .withMessage('Category must be at least 4 characters'),
  body('image').custom((value, { req }) => {
    if (
      !req.file ||
      !['image/png', 'image/jpeg', 'image/jpg'].includes(req.file.mimetype)
    ) {
      throw new Error('Image must be a PNG, JPG, or JPEG file');
    }
    if (req.file.size > 10 * 1024 * 1024) {
      throw new Error('Image size exceeds the limit');
    }
    return true;
  }),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isNumeric()
    .withMessage('Quantity must be a number'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isNumeric()
    .withMessage('Stock must be a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export { AddProductValidation };
