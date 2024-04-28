import express from "express";
import { catchAsync } from "../utils/catchAsync.mjs";
import * as wishList from "../Controllers/wishList.Controller.mjs";

export { router };
const router = express.Router();

router
  .route("/")
  .post(catchAsync(wishList.add))
  .get(catchAsync(wishList.get))
  .put(catchAsync(wishList.update))
  .delete(catchAsync(wishList.destroy));
