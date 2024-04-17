import jwt from "jsonwebtoken";

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "iti os 44", {
    expiresIn: maxAge,
  });
};

export { createToken };
