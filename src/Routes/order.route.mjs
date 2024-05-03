import express from "express";
import { isAdmin } from "../Middleware/admin.mjs";
import { isOwner } from "../Middleware/user.mjs";
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

router.get("/count", isAdmin, countOrders);

// Admin routes
router.get("/allOrders", isAdmin, getAllOrders);
router.put("/:id", isAdmin, UpdateOrderValidation, updateOrderById);
router.delete("/:id", isAdmin, deleteOrderById);

// User routes
router.get("/:id", getOrderById);
router.get("/", viewOrdersOfUser);

router.put("/cancel/:id", cancelOrder);

router.post("/", AddOrderValidation, createOrder);
router.post("/reOrder/:id", reOrder);
router.post("/discount", makeDiscount);

export default router;
