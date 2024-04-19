import jwt from "jsonwebtoken";
import { UserModel } from "../Model/User.Model.mjs";

//Authorization Middelware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  if (token) {
    jwt.verify(token, "iti os 44", (err, decodedToken) => {
      if (err && decodedToken.verified == false) {
        console.log(err.message);
        return res.status(403).json({ Status: 403, msg: "Not Authorized" });
      } else {
        console.log("Auth", decodedToken);
        next();
      }
    });
  } else {
    return res.redirect("/login");
  }
};

//Check if the user logged in or not to display the data

const checkUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  if (token) {
    jwt.verify(token, "iti os 44", async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        req.decodedUser = null;
        next();
      } else {
        console.log(decodedToken);
        let user = await UserModel.findById(decodedToken.id);
        req.decodedUser = user;
        console.log("Middleware", req.decodedUser);
        next();
      }
    });
  } else {
    req.decodedUser = null;
    next();
  }
};

export { requireAuth, checkUser };
