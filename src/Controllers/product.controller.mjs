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
  const searchQuery = req.query.search || "";
  const category = req.params.category || "";

  let filters = {};
  let searchFilter = {};

  if (category) {
    filters["category"] = category;
  }

  if (searchQuery) {
    searchFilter = { title: { $regex: searchQuery, $options: "i" } };
  }

  const countPromise = Product.countDocuments({ ...filters, ...searchFilter });
  const skip = (page - 1) * limit;

  let findPromise = Product.find({ ...filters, ...searchFilter })
    .sort(sortBy === 1 ? { title: -1 } : { title: 1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const [count, products] = await Promise.all([countPromise, findPromise]);
  const totalPages = Math.ceil(count / limit);

  return res.status(200).json({
    currentPage: page,
    totalPages,
    totalProducts: count,
    products,
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

const getCategoryProductCount = catchAsync(async (req, res) => {
  const categories = ["men", "women", "kids"];

  const countPromises = categories.map(async (category) => {
    const count = await Product.countDocuments({ category });
    return { category, count };
  });

  const categoryCounts = await Promise.all(countPromises);

  return res.status(200).json({ categoryCounts });
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getCategoryProductCount,
};
