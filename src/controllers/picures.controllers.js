import { PutObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



export const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    }
});



export const putObject = asyncHandler(async(req,res)=>{
    if (!req.user || !req.user.userid) {
        return res.status(401).json(new ApiResponse(401, "Unauthorized: User not authenticated", {}));
    }


    const user = req.user;
    const fileName = `image-${user.userid}-${Date.now()}`;

    const putCommand = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `uploads/userUploads/${fileName}`,
        ContentType: req.body.contentType,  
    });

    const url = await getSignedUrl(s3Client, putCommand, { expiresIn: 60 });


    return res.status(200).json(new ApiResponse(200, "Pre-signed URL generated successfully", { 
        fileName:fileName, 
        signedUrl: url 
    }));

});