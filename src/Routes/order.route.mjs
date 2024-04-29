import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  cancelOrder,
  viewOrdersOfUser,
  makeDiscount,
  reOrder,
  countOrders,
} from "../Controllers/order.controller.mjs";

import {
  AddOrderValidation,
  UpdateOrderValidation,
} from "../Validation/orders.mjs";


router.get("/count", countOrders);

router.post("/", AddOrderValidation, createOrder);
router.get("/allOrders", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id", UpdateOrderValidation, updateOrderById);
router.delete("/:id", deleteOrderById);
router.put("/cancel/:id", cancelOrder);
router.get("/", viewOrdersOfUser);
router.post("/reOrder/:id", reOrder);
router.post("/discount", makeDiscount);

export default router;
