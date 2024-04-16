import { body, validationResult } from 'express-validator';

const AddproductValidation = [
    body('title').notEmpty().withMessage('Title is required').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('price').notEmpty().withMessage('Price is required').isNumeric().withMessage('Price must be a number'),
    body('description').notEmpty().withMessage('Description is required').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('category').notEmpty().withMessage('Category is required').isLength({ min: 4 }).withMessage('Category must be at least 4 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export { AddproductValidation };
