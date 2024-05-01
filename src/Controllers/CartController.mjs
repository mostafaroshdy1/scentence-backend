import { ExpressError } from "../utils/ExpressError.mjs";
import Product from "../Model/Product.mjs";
export { add, get, update, destroy, getFromRedis, deleteFromRedis };
import redis from "redis";

// redis conncetion
const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
client.on("error", (error) => {
  console.log(`Redis client error:`, error);
});
await client.connect();

async function add(req, res) {
  const { email } = req.decodedUser;
  const { productId } = req.body;
  const qty = parseInt(req.body.qty);
  if (!productId || !qty) throw new ExpressError("Invalid request", 400);
  const product = await Product.findById(productId);
  if (!product) {
    throw new ExpressError("Invalid Product ID", 404);
  }
  if (product.stock < 1) throw new ExpressError("Out of stock", 400);
  const stock = product.stock;
  const productToCart = {
    productId: product._id,
    name: product.title,
    price: product.price,
    qty: qty,
    img: product.image[0],
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
  if (!req.body.reorder) {
    return res.send(cart);
  } else {
    return cart;
  }
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
  // if (savedOrder) {
  //   return res.send({
  //     message: "Cart deleted Successfully",
  //     order: savedOrder,
  //   });
  // }
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
