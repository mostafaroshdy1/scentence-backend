import express from 'express';
const router = express.Router();

import {
    createOrder, 
    getAllOrders,
    getOrderById, 
    updateOrderById, 
    deleteOrderById,
    cancelOrder,
    viewOrdersOfUser} 
from '../Controllers/order.controller.mjs';

import {AddOrderValidation} from '../Validation/orders.mjs';

router.post('/',AddOrderValidation, createOrder);
router.get('/allOrders', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id', updateOrderById);
router.delete('/:id', deleteOrderById);
router.put('/cancel/:id', cancelOrder);
router.get('/', viewOrdersOfUser);

export default router;