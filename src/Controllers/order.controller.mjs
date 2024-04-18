import Order from "../Model/Order.mjs";
import { catchAsync } from "../utils/catchAsync.mjs";
import { getUserIdFromToken } from "../utils/auth.mjs";
import { getEmailFromToken } from "../utils/auth.mjs";
import mongoose from "mongoose";

const createOrder = catchAsync(async (req, res) => {
  const token = req.cookies.jwt;
  const cart = req.session.carts[getEmailFromToken(token)];

  let products = new Map();
  let total = 0;

  cart.forEach((element) => {
    const productId = element.productId;
    const productQty = element.qty;
    const productPrice = element.price;

    const productData = {
      product: productId,
      quantity: productQty,
    };

    products.set(productId, productData);
    total += productPrice * productQty;
  });
  const order = new Order({
    ...req.body,
    user: getUserIdFromToken(token),
    products: products,
    total: total,
  });
  const savedOrder = await order.save();
  res.status(201).json(savedOrder);
});

const getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find();
  res.status(200).json(orders);
});
const getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  res.status(200).json(order);
});
const updateOrderById = catchAsync(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  res.status(200).json(order);
});
const deleteOrderById = catchAsync(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  res.status(200).json({ message: "Order Deleted Successfully" });
});

const cancelOrder = catchAsync(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: "cancelled" },
    { new: true }
  );
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  res.status(200).json(order);
});

const viewOrdersOfUser = catchAsync(async (req, res) => {
  const token = req.cookies.jwt;
  const userId = new mongoose.Types.ObjectId(getUserIdFromToken(token));

  const orders = await Order.find({ user: userId });
  res.status(200).json(orders);
});

export {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  cancelOrder,
  viewOrdersOfUser,
};
