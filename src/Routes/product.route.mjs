import express from 'express';
const router = express.Router();
import {
  multerFn,
  multerHandelErrors,
  validationType,
} from '../utils/multer.mjs';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getCategoryProductCount,
  countProducts,
} from '../Controllers/product.controller.mjs';
import { AddProductValidation } from '../Validation/products.mjs';

const upload = multerFn(validationType.image);

router.get('/count', countProducts);

router.get('/categoryCount', getCategoryProductCount);

router.post(
  '/',
  upload,
  multerHandelErrors,
  AddProductValidation,
  createProduct
);

router.get('/', getAllProducts);

router.get('/:id', getProductById);

router.put(
  '/:id',
  upload,
  multerHandelErrors,
  AddProductValidation,
  updateProductById
);

router.delete('/:id', deleteProductById);

router.get('/category/:category', getAllProducts);

export default router;
