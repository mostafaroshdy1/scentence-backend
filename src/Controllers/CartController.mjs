import { faker } from "@faker-js/faker";
import { ExpressError } from "../utils/ExpressError.mjs";
import { getEmailFromToken } from "../utils/auth.mjs";
import Product from "../Model/Product.mjs";
export { add, get, update, destroy, index };

// cart structure:
// const carts = {
//   email: [
//     {
//       productId: 5,
//       name: "Iphone",
//       price: 210000,
//       qty: 2,
//       img: "url",
//     },
//   ],
// };

async function add(req, res) {
  const token = req.cookies.jwt;
  const email = getEmailFromToken(token);
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
  } else {
    req.session.carts[email].push(productToCart);
  }
  return res.json("Prodect added successfully");
}

async function get(req, res) {
  const { email } = req.body;
  return res.send(req.session.carts[email]);
}

async function update(req, res) {
  const email = Object.keys(req.body)[0];
  req.session.carts[email] = req.body[email];
  // need to implement check before updating
  return res.send("Cart Updated Successfully");
}

async function destroy(req, res) {
  const { email } = req.body;
  delete req.session.carts[email];
  return res.send("Cart deleted successfully");
}

async function index(req, res) {
  res.send(req.session.carts);
}
