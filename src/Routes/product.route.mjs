import express from 'express';
const router = express.Router();
import { multerFn, multerHandelErrors, validationType } from '../utils/multer.mjs';
import { createProduct, getAllProducts } from '../Controllers/product.controller.mjs';
import { AddproductValidation } from '../Validation/products.mjs';

const upload = multerFn(validationType.image);

router.post('/', upload, multerHandelErrors, AddproductValidation, createProduct);

router.get('/', getAllProducts);

export default router;
