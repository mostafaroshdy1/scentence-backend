import { ExpressError } from "../utils/ExpressError.mjs";

export { isAdmin };

async function isAdmin(req, res, next) {
  if (req.decodedUser.role !== "admin") {
    throw new ExpressError("Unauthorized", 401);
  }
  next();
}
