import jwt from "jsonwebtoken";
import { UserModel } from "../Model/User.Model.mjs";
import { ExpressError } from "../utils/ExpressError.mjs";

//Authorization Middelware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  if (token) {
    jwt.verify(token, process.env.JWT_KEY, (err, decodedToken) => {
      if (err || decodedToken.verified == false) {
        return res.status(403).json({ Status: 403, msg: "Not Authorized" });
      } else {
        next();
      }
    });
  } else {
    return res.redirect("/login");
  }
};

//Check if the user logged in or not to display the data
function checkUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    throw new ExpressError("Authorization header is missing", 400);

  const token = authHeader.split(" ")[1];
  if (!token) throw new ExpressError("Jwt bearer token is required", 400);
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.decodedUser = decodedToken;
    next();
  } catch (err) {
    throw new ExpressError("Invalid token", 401);
  }
}

export { requireAuth, checkUser };
