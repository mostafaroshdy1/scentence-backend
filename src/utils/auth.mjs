import jwt from "jsonwebtoken";

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id,email) => {
  return jwt.sign({ id,email }, "iti os 44", {
    expiresIn: maxAge,
  });
};
const getUserIdFromToken = (token) => {
  const decodedToken = jwt.verify(token, "iti os 44");
  return decodedToken.id;
};
const getEmailFromToken = (token) => {
  const decodedToken = jwt.verify(token, "iti os 44");
  return decodedToken.email;
}

export { createToken, getUserIdFromToken, getEmailFromToken};
