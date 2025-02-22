import { Post } from "../models/post.model.js";
import {Community} from "../models/community.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { s3Client } from "./picures.controllers.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from 'crypto';

 const createPost = asyncHandler(async (req, res) => {
    const { title, description, postType, communityId, imageKeys, isAnonymous } = req.body;
    const userId = req.user._id;

    if (!title || !postType) {
        throw new ApiError(400, "Title and post type are required");
    }

    let community = null;

    if (postType === "community") {
        if (!communityId) throw new ApiError(400, "Community ID is required for a community post");
        
        community = await Community.findById(communityId);
        if (!community) throw new ApiError(404, "Community not found");


    } else if (postType === "generic" && communityId) {
        throw new ApiError(400, "Community ID should not be provided for a generic post");
    }
    let imageUrls = [];
    if (imageKeys && Array.isArray(imageKeys)) {
        try {
            imageUrls = await Promise.all(
                imageKeys.map(async (key) => {
                    const getCommand = new GetObjectCommand({
                        Bucket: process.env.BUCKET_NAME,
                        Key: `uploads/userUploads/${key}`,
                    });
                    return getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
                })
            );
        } catch (error) {
            throw new ApiError(500, "Error generating signed URLs for images");
        }
    }

    const post = await Post.create({
        title,
        description,
        postType,
        community: postType === "community" ? communityId : null,
        author: userId, 
        imageUrl: imageUrls,
        isAnonymous: !!isAnonymous,
    });

    if (postType === "community" && community) {
        community.posts.push(post._id);
        await community.save();
    }

    return res.status(201).json(
        new ApiResponse(201, "Post created", {
            post,
            signedImages: imageUrls.map((url, index) => ({
                fileName: imageKeys[index],
                url,
            })),
        })
    );
});




const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find()
        .populate('community', 'name')
        .lean(); 

    posts.forEach(post => {
        if (post.isAnonymous) {
            delete post.author;
        }
    });

    return res.status(200).json(new ApiResponse(200, 'Posts fetched successfully', posts));
});

const getGenericPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({ postType: "generic" })
        .populate("author", "username")
        .lean(); 

    if (!posts.length) {
        throw new ApiError(404, "No generic posts found");
    }

    const sanitizedPosts = posts.map(post => {
        if (post.isAnonymous) {
            post.author = undefined; 
        }
        return post;
    });

    return res.status(200).json(new ApiResponse(200, "Generic posts fetched successfully", sanitizedPosts));
});


const getPostById = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate('community', 'name')
        .lean();

    if (!post) {
        throw new ApiError(404, "Post not found");
    }
    if (post.isAnonymous) {
        delete post.author;
    }

    return res.status(200).json(new ApiResponse(200, 'Post fetched successfully', post));
});

const updatePost = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.author.toString() !== req.user.id) {
        throw new ApiError(403, "Unauthorized request");
    }

    post.title = title || post.title;
    post.description = description || post.description;
    await post.save();

    return res.status(200).json(new ApiResponse(200, 'Post updated successfully', post));
});

const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.author.toString() !== req.user.id) {
        throw new ApiError(403, "Unauthorized request");
    }

    await post.deleteOne();

    return res.status(200).json(new ApiResponse(200, 'Post deleted successfully'));
});



export {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    getGenericPosts
}



const algorithm = 'aes-256-ctr'; 
const secretKey = process.env.SECRET_KEY; 
const iv = crypto.randomBytes(16); 

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'utf-8'), iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted }; 
};

const decrypt = (encryptedText, iv) => {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'utf-8'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf8');
    return decrypted;
};



const createPostEncrpted = asyncHandler(async (req, res) => {
    const { title, description, postType, communityId, imagekey, isAnonymous } = req.body;
    const userId = req.user._id;

    if (!title || !description || !postType) {
        throw new ApiError(400, "All fields are required");
    }

    let encryptedTitle, encryptedDescription, iv;

    if (isAnonymous) {
        const encryptedTitleObj = encrypt(title);
        const encryptedDescriptionObj = encrypt(description);
        
        encryptedTitle = encryptedTitleObj.encryptedData;
        encryptedDescription = encryptedDescriptionObj.encryptedData;
        iv = encryptedTitleObj.iv;  
    }

    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    let imageUrl = null;

    if (imagekey) {
        try {
            const getCommand = new GetObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: `uploads/userUploads/${imagekey}`,
            });

            imageUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

            await User.findByIdAndUpdate(userId, { $set: { profileImage: imageUrl } });
        } catch (error) {
            throw new ApiError(500, "Error generating signed URL for image");
        }
    }

    const post = await Post.create({
        title: isAnonymous ? encryptedTitle : title,
        description: isAnonymous ? encryptedDescription : description,
        author: userId,
        community: communityId,
        isAnonymous: isAnonymous,
        iv: iv,  
        imageUrl: imageUrl,
    });

    return res.status(201).json(
        new ApiResponse(201, "Post created", {
            post,
            signedImage: {
                fileName: imagekey,
                url: imageUrl,
            },
        })
    );
});


const getPostByIdEnc = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate('author', 'username')
        .populate('community', 'name');

    if (!post) {
        throw new ApiError(404, "Post not found");
    }
    if (post.isAnonymous) {
        post.title = decrypt(post.title, post.iv);
        post.description = decrypt(post.description, post.iv);
        delete post.author; 
    }

    

    return res.status(200).json(new ApiResponse(200, 'Post fetched successfully', post));
});
