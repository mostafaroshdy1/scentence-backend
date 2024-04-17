import { faker } from "@faker-js/faker";
import { ExpressError } from "../utils/ExpressError.mjs";

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
  const { email } = req.body; // will be changed once jwt is done
  const product = {
    productId: faker.string.uuid(),
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
    qty: Math.floor(Math.random() * 10),
    img: faker.image.avatar(),
  };
  if (!req.session.carts) {
    req.session.carts = {};
  }

  if (!req.session.carts[email]) {
    req.session.carts[email] = [product];
  } else {
    req.session.carts[email].push(product);
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
