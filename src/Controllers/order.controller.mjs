import Product from "../Model/Product.mjs";
import Order from "../Model/Order.mjs";
import { catchAsync } from "../utils/catchAsync.mjs";
import mongoose from "mongoose";
import Stripe from "stripe";
import { ExpressError } from "../utils/ExpressError.mjs";
import { getFromRedis } from "./CartController.mjs";
import { add, destroy, deleteFromRedis } from "./CartController.mjs";
const stripe = Stripe(process.env.STRIPE);

const createOrder = catchAsync(async (req, res) => {
  const { email } = req.decodedUser;
  let total = 0;
  let discountValue = 0;
  let shippingAmount = 30;
  const cart = await getFromRedis(req.decodedUser.email);
  if (!cart) {
    throw new ExpressError("No items in the cart", 400);
  }
  let products = new Map();
  cart.forEach((element) => {
    const productId = element.productId;
    const productQty = element.qty;
    const productPrice = element.price;
    total += productQty * productPrice;
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
  if (req.body.promoCode) {
    discountValue = calculateDiscount(req, res);
    total = total - total * discountValue;
    req.body.promoCode = undefined;
  }
  console.log("this is total", total);
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
    total: total + shippingAmount,
    discount: discountValue,
  });
  const lineItems = cart.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.name,
        images: [product.img],
      },
      unit_amount: product.price * 100 - product.price * 100 * discountValue,
    },
    quantity: product.qty,
  }));

  lineItems.push({
    price_data: {
      currency: "usd",
      product_data: {
        name: "Shipping",
      },
      unit_amount: shippingAmount * 100,
    },
    quantity: 1,
  });

  const baseUrl = process.env.baseUrl || "http://localhost:4200";
  let stripeSession;
  if (req.body.paymentMethod === "credit") {
    stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: baseUrl + `/orders/${order._id.toString()}`,
      cancel_url: baseUrl + `/orders`, // will be changed later
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // will expire after 2 hours
    });
    order.paymentId = stripeSession.id;
    order.paymentUrl = stripeSession.url;
  }
  const savedOrder = await order.save();

  let redirectUrl = stripeSession
    ? stripeSession.url
    : baseUrl + `/orders/${order._id.toString()}`;
  try {
    await deleteFromRedis(email);
  } catch {
    throw new ExpressError("redis deletion error", 500);
  }
  res.status(200).json({ message: "Order Created Successfully", redirectUrl });
});

const getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find().populate("user");
  res.status(200).json(orders);
});
const getOrderById = catchAsync(async (req, res) => {
  const orderId = new mongoose.Types.ObjectId(req.params.id);
  const order = await Order.findById(orderId).populate("user");
  if (order.user._id.toString() !== req.decodedUser.id) {
    throw new ExpressError("Unauthorized", 401);
  }
  const products = await Product.find({
    _id: { $in: Array.from(order.products.keys()) },
  });

  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  res.status(200).json({ message: "Order Found", order, products });
});

const updateOrderById = catchAsync(async (req, res) => {
  const currentStatus = req.body.currentStatus;
  const foundOrder = await Order.findById(req.params.id);

  if (!foundOrder) {
    return res.status(404).json({ message: "Order Not Found" });
  }

  foundOrder.currentStatus = currentStatus;
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
  if (order.user.toString() !== req.decodedUser.id) {
    throw new ExpressError("Unauthorized", 401);
  }
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  if (order.currentStatus === "pending") {
    order.currentStatus = "cancelled";
    await order.save();
    await reStock(order._id);
    return res.status(200).json(order);
  }
  return res.status(400).json({ message: "Order can't be cancelled" });
});

const viewOrdersOfUser = catchAsync(async (req, res) => {
  const userId = req.decodedUser.id;

  const orders = await Order.find({ user: userId }).populate("user");
  res.status(200).json(orders);
});
const reOrder = catchAsync(async (req, res) => {
  let cart = [];
  const orderId = req.params.id;
  const order = await Order.findById(orderId);
  if (order.user.toString() !== req.decodedUser.id) {
    throw new ExpressError("Unauthorized", 401);
  }
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }
  if (
    order.currentStatus === "pending" ||
    order.currentStatus === "on way" ||
    order.currentStatus === "accepted"
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

  return res.status(201).json({
    message: "Re-Order Done Successfully",
    products: products,
    cart: cart,
  });
});
const calculateDiscount = (req, res) => {
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
      discount = -1;
  }
  return discount;
};
const makeDiscount = catchAsync(async (req, res) => {
  const discount = calculateDiscount(req, res);
  if (discount < 0) {
    return res.status(400).json({ message: "Invalid Promo Code" });
  }
  return res.status(200).json({ discount: discount });
});

async function confirmPayment(req, res) {
  const sig = req.headers["stripe-signature"];
  const endpointSecret =
    process.env.STRIPE_SIG ||
    "whsec_d520af016a6a74eec500f07724791570a5c61b9a238bd8948dc0d950f5176fed";
  let event;
  // console.log(req.body);
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    // console.log(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  const session = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
      await Order.findOneAndUpdate(
        { paymentId: session.id },
        { currentStatus: "accepted" }
      );
      break;
    case "checkout.session.expired":
      const order = await Order.findOneAndUpdate(
        { paymentId: session.id },
        { currentStatus: "cancelled" }
      );
      await reStock(order._id);
      break;
    default:
  }
  res.send();
}

async function reStock(orderId) {
  const order = await Order.findById(orderId);
  const productIds = Array.from(order.products.keys());
  const updateOperations = productIds.map((productId) => {
    const quantityCancelled = order.products.get(productId).quantity;
    return {
      updateOne: {
        filter: { _id: productId },
        update: { $inc: { stock: quantityCancelled } },
      },
    };
  });
  await Product.bulkWrite(updateOperations);
}

async function countOrders(req, res) {
  const count = await Order.countDocuments();
  res.json({ count });
}

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
  confirmPayment,
  countOrders,
};
