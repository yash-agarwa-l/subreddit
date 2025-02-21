import asyncHandler from "../middlewares/asyncHandler.js"; 
import ApiError from "../utils/ApiError.js"; 
import ApiResponse from "../utils/ApiResponse.js"; 
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Ensure images directory exists
const uploadDir = path.join(process.cwd(), "../images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files to "../images"
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    },
});

// Multer file filter (Only PNG & JPEG)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/png", "image/jpeg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Invalid filetype"), false);
    }
};

// Multer upload config (Limit size to 10MB)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload Image Controller
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "File missing or invalid filetype");
    }

    const imageUrl = `${process.env.DOMAIN_NAME}/images/${req.file.filename}`;
    return res.status(201).json(new ApiResponse(201, "Image uploaded successfully", { imageUrl }));
});

// Export Route Handler
export { upload, uploadImage };
