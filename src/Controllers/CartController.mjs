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
  const { productId } = req.body;
  const qty = parseInt(req.body.qty);
  const stock = (await Product.findById(productId)).stock;
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
    stock: stock,
  };

  let cart = await getFromRedis(email);
  try {
    if (!cart) {
      if (productToCart.qty > productToCart.stock)
        throw new ExpressError("Not enough stock", 400);
      await storeToRedis(email, [productToCart]);
      cart = [productToCart];
    } else {
      const item = cart.find((el) => el.productId == productToCart.productId);
      if (item) {
        item.qty += qty;
        item.stock = stock;
        if (item.qty > item.stock)
          throw new ExpressError("Not enough stock", 400);
      } else {
        cart.push(productToCart);
      }
      await storeToRedis(email, cart);
    }
  } catch (error) {
    throw new ExpressError(error.message, error.statusCode);
  }

  return res.send(cart);
}

async function get(req, res) {
  const { email } = req.decodedUser;
  const cart = await getFromRedis(email);
  return res.send(cart);
}

async function update(req, res) {
  const { email } = req.decodedUser;
  const cart = req.body;
  if (!cart) throw new ExpressError("unAuthorized", 401); // the email sent was not the user's email
  cart.forEach((element) => {
    if (element.qty > element.stock)
      throw new ExpressError("Not enough stock", 400);
  });
  const newCart = cart.filter((item) => item.qty > 0);

  try {
    await storeToRedis(email, newCart);
  } catch (error) {
    throw new ExpressError("redis storing error", 500);
  }
  return res.send(newCart);
}

async function destroy(req, res) {
  const { email } = req.decodedUser;
  try {
    await deleteFromRedis(email);
  } catch {
    throw new ExpressError("redis deletion error", 500);
  }
  return res.send("Cart deleted successfully");
}

async function getFromRedis(email) {
  const cart = JSON.parse(await client.get(email));
  return cart;
}
async function storeToRedis(email, cart) {
  await client.set(email, JSON.stringify(cart));
}

async function deleteFromRedis(email) {
  await client.del(email);
}
