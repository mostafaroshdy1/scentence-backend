import { ExpressError } from "../utils/ExpressError.mjs";
import Product from "../Model/Product.mjs";
export { add, get, update, destroy, getFromRedis };
import redis from "redis";
const client = redis.createClient();
try {
  await client.connect();
} catch (error) {
  throw new ExpressError(error, 500);
}

async function add(req, res) {
  const { email } = req.decodedUser;
  const { productId, qty } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ExpressError("Invalid Product ID", 404);
  }
  const productToCart = {
    productId: product._id,
    name: product.title,
    price: product.price,
    qty: qty,
    img: product.image,
  };

  if (!req.session.carts) {
    req.session.carts = {};
  }
  if (!req.session.carts[email]) {
    req.session.carts[email] = [productToCart];
    req.session.save();
  } else {
    req.session.carts[email].push(productToCart);
    req.session.save();
  }
  if (!req.body.reorder) {
    return res.json("Prodect added successfully");
  }
}

async function get(req, res) {
  const { email } = req.decodedUser;
  if (!req.session.carts[email]) {
    return res.status(200).send("Cart is Empty");
  }
  return res.status(200).json(req.session.carts[email]);
}

async function update(req, res) {
  const { email } = req.decodedUser;
  const cart = req.body[email];
  if (!cart) throw new ExpressError("unAuthorized", 401); // the email sent was not the user's email
  try {
    await storeToRedis(email, cart);
  } catch (error) {
    throw new ExpressError("redis storing error", 500);
  }
  return res.send(cart);
}

async function destroy(req, res, savedOrder) {
  const { email } = req.decodedUser;
  delete req.session.carts[email];
  if (savedOrder) {
    return res.send({
      message: "Cart deleted Successfully",
      order: savedOrder,
    });
  }
  return res.send("Cart deleted Successfully");
}