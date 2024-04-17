import {body, validationResult} from 'express-validator';

const AddOrderValidation = [
    body('city')
        .notEmpty()
        .withMessage('City is required'),
    body('Area')
        .notEmpty()
        .withMessage('Area is required'),
    body('street')
        .notEmpty()
        .withMessage('Street is required'),
    body('building')
        .notEmpty()
        .withMessage('Building is required')
        .isNumeric()
        .withMessage('Building must be a number'),
    body('floor')
        .notEmpty()
        .withMessage('Floor is required')
        .isNumeric()
        .withMessage('Floor must be a number'),
    body('apartment')
        .notEmpty()
        .withMessage('Apartment is required')
        .isNumeric()
        .withMessage('Apartment must be a number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next();
    },   
];

const UpdateOrderValidation = [
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['cancelled', 'accepted', 'pending','rejected','delivered'])
        .withMessage('Status must be cancelled, delivered, or pending'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next();
    },
];

export {AddOrderValidation, UpdateOrderValidation};