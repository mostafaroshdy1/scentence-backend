import Product from "../Model/Product.mjs";
import Order from "../Model/Order.mjs";
import { catchAsync } from "../utils/catchAsync.mjs";
import mongoose from "mongoose";
import Stripe from "stripe";
import { ExpressError } from "../utils/ExpressError.mjs";
import { getFromRedis } from "./CartController.mjs";
const stripe = Stripe(process.env.STRIPE);

const createOrder = catchAsync(async (req, res) => {
  const cart = await getFromRedis(req.decodedUser.email);
  if (!cart) {
    throw new ExpressError("No items in the cart", 400);
  }
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
    total: total,
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
  return res.status(201).json(savedOrder);
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
  const userId = req.decodedUser.id;

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
