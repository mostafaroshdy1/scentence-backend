import { ExpressError } from "../utils/ExpressError.mjs";

export { isOwner };

async function isOwner(req, res, next) {
  if (req.decodedUser.id !== req.params.id) {
    throw new ExpressError("Unauthorized", 401);
  }
  next();
}
