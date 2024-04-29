import express from 'express';
import { catchAsync } from '../utils/catchAsync.mjs';
import { get, update, destroy } from '../Controllers/profile.controller.mjs';
import { multerFn, multerHandelErrors, validationType } from '../utils/multer.mjs';

export { router };
const router = express.Router();
const upload = multerFn(validationType.image);

router
	.route('/')
	.get(get)
	.put(upload, multerHandelErrors, catchAsync(update))
	.delete(catchAsync(destroy));
