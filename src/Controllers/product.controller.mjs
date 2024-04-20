import Product from "../Model/Product.mjs";
import { catchAsync } from "../utils/catchAsync.mjs";
import { multerFn, validationType } from "../utils/multer.mjs";
import cloudinary from "cloudinary";

const upload = multerFn("images", validationType.image);

const createProduct = catchAsync(async (req, res) => {
  const { title } = req.body;
  const foundedProduct = await Product.findOne({ title });
  if (foundedProduct) {
    return res.status(400).json({ message: "Product already exists" });
  }

  if (req.fileUploadError) {
    return res
      .status(400)
      .json({ message: "invalid file, accepted files->(png,jpg,jpeg)" });
  }

  const images = [];
  for (const file of req.files) {
    const result = await cloudinary.uploader.upload(file.path);
    images.push(result.secure_url);
  }

  const newProduct = new Product({ ...req.body, image: images });

  const savedProduct = await newProduct.save();
  return res
    .status(201)
    .json({ message: "Product added successfully", savedProduct });
});

const getAllProducts = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const sortBy = parseInt(req.query.sortBy) || 0;
  const category = req.params.category || "";

  const filters = {};

  if (category) {
    filters["category"] = category;
  }
  const count = await Product.countDocuments(filters);
  const totalPages = Math.ceil(count / limit);
  const skip = (page - 1) * limit;

  let aggregationPipeline = [];

  if (sortBy === 0) {
    aggregationPipeline.push({ $sort: { title: 1 } });
  } else if (sortBy === 1) {
    aggregationPipeline.push({ $sort: { title: -1 } });
  } else if (sortBy === 2) {
    aggregationPipeline.push({ $sort: { price: 1 } });
  } else if (sortBy === 3) {
    aggregationPipeline.push({ $sort: { price: -1 } });
  } else if (sortBy === 5) {
    aggregationPipeline.push({ $sort: { date: 1 } });
  } else {
    aggregationPipeline.push({ $sort: { date: -1 } });
  }

  aggregationPipeline.push(
    { $match: filters },
    { $skip: skip },
    { $limit: limit }
  );

  const result = await Product.aggregate(aggregationPipeline);

  return res.status(200).json({
    currentPage: page,
    totalPages,
    totalProducts: count,
    products: result,
  });
});

const getProductById = catchAsync(async (req, res) => {
  const product_id = req.params.id;
  const foundedProduct = await Product.findOne({ _id: product_id });
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
  if (req.files && req.files.length > 0) {
    const images = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      images.push(result.secure_url);
    }
    updatedProduct = await Product.findByIdAndUpdate(
      product_id,
      { ...req.body, image: images },
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

const searchProduct = catchAsync(async (req, res) => {
  const { search } = req.query;
  const result = await Product.find({
    title: { $regex: search, $options: "i" },
  });
  if (result.length === 0) {
    return res.status(404).json({ message: "Product Not Found" });
  }
  return res.status(200).json(result);
});

// const categoryFilter = catchAsync(async (req, res) => {
//   const category = req.params.category;
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 9;
//   const skip = (page - 1) * limit;

//   const count = await Product.countDocuments({ category });
//   const totalPages = Math.ceil(count / limit);

//   const result = await Product.find({ category }).skip(skip).limit(limit);

//   return res.status(200).json({
//     currentPage: page,
//     totalPages,
//     totalProducts: count,
//     products: result,
//   });
// });

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  searchProduct,
  // categoryFilter,
};
