import express from "express";
import { confirmPayment } from "../Controllers/order.controller.mjs";
import { catchAsync } from "../utils/catchAsync.mjs";

export { router };
const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  catchAsync(confirmPayment)
);
