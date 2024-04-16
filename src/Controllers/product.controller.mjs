import Product from "../Model/Product.mjs";
import { catchAsync } from "../utils/catchAsync.mjs";
import { multerFn, validationType } from "../utils/multer.mjs";
import cloudinary from "cloudinary";

const upload = multerFn("images", validationType.image);

const createProduct = catchAsync(async (req, res) => {
  const { title } = req.body;
  const foundedProduct = await Product.findOne({ title });
  if (foundedProduct) {
    return res.status(400).json({
      message: "Product already exists",
    });
  }

  if (req.fileUploadError) {
    return res.json({
      message: "invalid file, accepted files->(png,jpg,jpeg)",
    });
  }
  const result = await cloudinary.uploader.upload(req.file.path);

  const newProduct = new Product({
    ...req.body,
    image: result.secure_url,
  });

  const savedProduct = await newProduct.save();
  return res.status(201).json({
    message: "Product added successfully",
    savedProduct,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const result = await Product.find();
  return res.status(200).json(result);
});

const getProductById = catchAsync(async (req, res) => {
  const product_id = req.params.id;
  const foundedProduct = await Product.findById(product_id);
  if (!foundedProduct) {
    return res.status(404).json({ message: "Product Not Found" });
  }
  return res.status(200).json(foundedProduct);
});

const updateProductById = catchAsync(async (req, res) => {
  const product_id = req.params.id;

  const foundedProduct = await Product.findById(product_id);
  if (!foundedProduct) {
    return res.status(404).json({ message: "Product Not Found" });
  }

  if (req.fileUploadError) {
    return res.json({
      message: "invalid file, accepted files->(png,jpg,jpeg)",
    });
  }

  let updatedProduct;
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path);
    updatedProduct = await Product.findByIdAndUpdate(
      product_id,
      { ...req.body, image: result.secure_url },
      { new: true }
    );
  } else {
    updatedProduct = await Product.findByIdAndUpdate(
      product_id,
      { ...req.body },
      { new: true }
    );
  }

  return res.status(200).json({
    message: "Product updated successfully",
    updatedProduct,
  });
});

const deleteProductById = catchAsync(async (req, res) => {
  const product_id = req.params.id;
  const deletedProduct = await Product.findByIdAndDelete(product_id);
  if (!deletedProduct) {
    return res.status(404).json({ message: "Product Not Found" });
  }
  return res.status(200).json({ message: "Product deleted successfully" });
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
