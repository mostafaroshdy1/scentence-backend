import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

const validationType = {
    image: ['image/png', 'image/jpg', 'image/jpeg','image/webp'],
    files: ['application/pdf']
}

const multerHandelErrors = (error, req, res, next) => {
    if (error) {
        res.status(400).json({
            message: 'file too large',
            error
        })
    } else {
        next()
    }
}

function multerFn(type) {
    cloudinary.config({ 
        cloud_name: 'dad3cfqgl', 
        api_key: process.env.CLOUDINARY_API_KRY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

    const fileFilter = (req, file, cb) => {
        if (type.includes(file.mimetype)) {
            cb(null, true)
        } else {
            req.fileUploadError = true;
            cb(null, false)
        }
    }

    return multer({
        storage: multer.diskStorage({}), 
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024 
        }
    }).array('image', 5)
}

export { multerFn,multerHandelErrors, validationType };