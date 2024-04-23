import express from 'express';
import { catchAsync } from '../utils/catchAsync.mjs';
import { get, update, destroy } from '../Controllers/profile.controller.mjs';

export { router };
const router = express.Router();

router.route('/').get(get).put(catchAsync(update)).delete(catchAsync(destroy));
