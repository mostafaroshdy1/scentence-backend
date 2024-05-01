import { ExpressError } from "../utils/ExpressError.mjs";
import Product from "../Model/Product.mjs";
export { add, get, update, destroy, getFromRedis };
import redis from "redis";

const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
try {
  await client.connect();
} catch (error) {
  throw new ExpressError(error, 500);
}

async function add(req, res) {
  const { email } = req.decodedUser;
  const { productId } = req.body;
  if (!productId) throw new ExpressError("Invalid request", 400);
  const product = await Product.findById(productId);
  if (!product) {
    throw new ExpressError("Invalid Product ID", 404);
  }
  const productToWishList = {
    productId: product._id,
    name: product.title,
    price: product.price,
    img: product.image,
    stock: product.stock,
  };

  let wishList = await getFromRedis(email);
  try {
    if (!wishList) {
      await storeToRedis(email, [productToWishList]);
      wishList = [productToWishList];
    } else {
      const item = wishList.find(
        (el) => el.productId == productToWishList.productId
      );
      if (!item) {
        wishList.push(productToWishList);
        await storeToRedis(email, wishList);
      }
    }
  } catch (error) {
    throw new ExpressError(error.message, error.statusCode);
  }
  if (!req.body.reorder) {
    return res.json(wishList);
  }
}
async function get(req, res) {
  const { email } = req.decodedUser;
  const wishList = await getFromRedis(email);
  return res.json(wishList);
}
async function update(req, res) {
  const { email } = req.decodedUser;
  const wishList = req.body;
  if (!wishList) throw new ExpressError("unAuthorized", 401);
  try {
    await storeToRedis(email, wishList);
  } catch (error) {
    throw new ExpressError("redis storing error", 500);
  }
  return res.json(wishList);
}
async function destroy(req, res) {
  const { email } = req.decodedUser;
  try {
    await deleteFromRedis(email);
  } catch {
    throw new ExpressError("redis deletion error", 500);
  }
  return res.json("WishList deleted successfully");
}

async function getFromRedis(email) {
  const key = `wishlist:${email}`;
  const wishList = JSON.parse(await client.get(key));
  return wishList;
}

async function storeToRedis(email, wishList) {
  const key = `wishlist:${email}`;
  await client.set(key, JSON.stringify(wishList));
}

async function deleteFromRedis(email) {
  const key = `wishlist:${email}`;
  await client.del(key);
}
