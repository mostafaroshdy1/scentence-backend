import express from "express";
const router = express.Router();
import {
  multerFn,
  multerHandelErrors,
  validationType,
} from "../utils/multer.mjs";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getCategoryProductCount,
  countProducts,
  addRating,
  getRating,
} from "../Controllers/product.controller.mjs";
import { AddProductValidation } from "../Validation/products.mjs";

const upload = multerFn(validationType.image);

router.get("/:id", getProductById);

router.get("/count", countProducts);

router.get("/categoryCount", getCategoryProductCount);

router.post(
  "/",
  upload,
  multerHandelErrors,
  AddProductValidation,
  createProduct
);

router.get("/", getAllProducts);


router.put(
  "/:id",
  upload,
  multerHandelErrors,
  AddProductValidation,
  updateProductById
);

router.delete("/:id", deleteProductById);

router.get("/category/:category", getAllProducts);
router.post("/rating", addRating);
router.get("/rating/:productId", getRating);

export default router;
