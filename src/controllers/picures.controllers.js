import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    }
});



export const putObject = async (req, res) => {
    // const user = req.user;
    const user = "jaaa";
    const fileName = `image-${user}-${Date.now()}`;

    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `uploads/userUploads/${fileName}`,
        ContentType: req.body.contentType,  
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });

        return res.status(200).json(new ApiResponse(200, "Pre-signed URL generated successfully", { url }));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, "Error generating pre-signed URL", error));
    }
};