import { Post } from "../models/post.model.js";
import {Community} from "../models/community.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { s3Client } from "./picures.controllers.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
        author: isAnonymous ? null : userId, 
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
        .populate('author', 'username')
        .populate('community', 'name');

    return res.status(200).json(new ApiResponse(200, 'Posts fetched successfully', posts));
});

const getPostById = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate('author', 'username')
        .populate('community', 'name');

    if (!post) {
       throw new ApiError(404,"post not found")
    }

    return res.status(200).json(new ApiResponse(200, 'Post fetched successfully', post));
});

const updatePost = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
        throw new ApiError(404,"post not found")
        
    }

    if (post.author.toString() !== req.user.id) {
        throw new ApiError(403,"unauthorized request")

    }

    post.title = title || post.title;
    post.description = description || post.description;
    await post.save();

    return res.status(200).json(new ApiResponse(200, 'Post updated successfully', post));
});

const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        throw new ApiError(404,"post not found")
    }

    if (post.author.toString() !== req.user.id) {
        throw new ApiError(403,"unauthorized request")
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
}