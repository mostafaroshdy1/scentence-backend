import Product from "../Model/Product.mjs";
import Order from "../Model/Order.mjs";
import { catchAsync } from "../utils/catchAsync.mjs";
import mongoose from "mongoose";
import Stripe from "stripe";
import { ExpressError } from "../utils/ExpressError.mjs";
import { getFromRedis } from "./CartController.mjs";
import { add, destroy } from "./CartController.mjs";
const stripe = Stripe(process.env.STRIPE);

const createOrder = catchAsync(async (req, res) => {
  const cart = await getFromRedis(req.decodedUser.email);
  if (!cart) {
    throw new ExpressError("No items in the cart", 400);
  }
  let products = new Map();
  cart.forEach((element) => {
    const productId = element.productId;
    const productQty = element.qty;
    const productPrice = element.price;
    const productData = {
      product: productId,
      quantity: productQty,
    };

    products.set(productId, productData);
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productsFromDb = await Product.find({
      _id: { $in: Array.from(products.keys()) },
    }).session(session);

    for (const product of productsFromDb) {
      const cartProduct = products.get(product.id);
      product.stock -= cartProduct.quantity;

      await product.save();
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ExpressError("Product stock is not enough", 409);
  }
  const maxOrder = await Order.find().sort({ orderId: -1 }).limit(1);
  const order = new Order({
    orderId: maxOrder.length === 0 ? 1 : maxOrder[0].orderId + 1,
    apartment: req.body.apartment,
    floor: req.body.floor,
    building: req.body.building,
    street: req.body.street,
    Area: req.body.Area,
    city: req.body.city,
    secondPhone: req.body.secondPhone,
    paymentMethod: req.body.paymentMethod,
    user: req.decodedUser.id,
    products: products,
    total: req.body.total,
  });
  const lineItems = cart.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.name,
        images: [product.img],
      },
      unit_amount: product.price * 100,
    },
    quantity: product.qty,
  }));

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "https://url.com", // will be changed later
    cancel_url: "https://url.com", // will be changed later
  });
  order.paymentId = stripeSession.id;

  const savedOrder = await order.save();
  destroy(req, res, savedOrder);
});

const getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find();
  res.status(200).json(orders);
});
const getOrderById = catchAsync(async (req, res) => {
  const orderId = new mongoose.Types.ObjectId(req.params.id);
  const order = await Order.findById(orderId);
  const products = await Product.find({
    _id: { $in: Array.from(order.products.keys()) },
  });

  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  res.status(200).json({ message: "Order Found", order, products });
});
const updateOrderById = catchAsync(async (req, res) => {
  const status = req.body.status;
  const foundOrder = await Order.findById(req.params.id);

  if (!foundOrder) {
    return res.status(404).json({ message: "Order Not Found" });
  }

  foundOrder.status = status;
  await foundOrder.save();

  return res.status(200).json(foundOrder);
});
const deleteOrderById = catchAsync(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  res.status(200).json({ message: "Order Deleted Successfully" });
});

const cancelOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  if (order.status === "pending") {
    order.status = "cancelled";
    await order.save();
    return res.status(200).json(order);
  }
  return res.status(400).json({ message: "Order can't be cancelled" });
});

const viewOrdersOfUser = catchAsync(async (req, res) => {
  const userId = req.decodedUser.id;

  const orders = await Order.find({ user: userId });
  res.status(200).json(orders);
});
const reOrder = catchAsync(async (req, res) => {
  let cart = [];
  const orderId = req.params.id;
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  if (
    order.status === "pending" ||
    order.status === "on way" ||
    order.status === "accepted"
  ) {
    return res.status(400).json({ message: "Order is not delivered yet" });
  }
  const products = await Product.find({
    _id: { $in: Array.from(order.products.keys()) },
  });

  for (const product of products) {
    req.body.productId = product._id;
    req.body.qty = order.products.get(product._id).quantity;
    req.body.reorder = true;
    cart = await add(req, res);
  }

  return res
    .status(201)
    .json({
      message: "Re-Order Done Successfully",
      products: products,
      cart: cart,
    });
});
const makeDiscount = catchAsync(async (req, res) => {
  const promoCode = req.body.promoCode;
  let discount = 0;
  switch (promoCode) {
    case "10OFF":
      discount = 0.1;
      break;
    case "30OFF":
      discount = 0.3;
      break;
    case "50OFF":
      discount = 0.5;
      break;
    case "70OFF":
      discount = 0.7;
      break;
    default:
      return res.status(400).json({ message: "Invalid Promo Code" });
  }
  return res.status(200).json({ discount: discount });
});

export {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  cancelOrder,
  viewOrdersOfUser,
  reOrder,
  makeDiscount,
};
