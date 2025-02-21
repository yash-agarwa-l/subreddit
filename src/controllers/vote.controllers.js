import { Post } from "../models/post.model.js";
import {Community} from "../models/community.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";


export const upvotePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const user = await User.findById(req.user._id);

    if (!user.upvotedPosts.includes(post._id)) {
        user.upvotedPosts.push(post._id);
        post.upvotedBy.push(req.user._id);

        user.downvotedPosts = user.downvotedPosts.filter(id => !id.equals(post._id));
        post.downvotedBy = post.downvotedBy.filter(id => !id.equals(req.user._id));
    } else {
        user.upvotedPosts = user.upvotedPosts.filter(id => !id.equals(post._id));
        post.upvotedBy = post.upvotedBy.filter(id => !id.equals(req.user._id));
    }

    await user.save();
    await post.save();

    return res.status(200).json(new ApiResponse(200, "Post upvoted", { post, user }));
});


export const downvotePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const user = await User.findById(req.user._id);

    if (!user.downvotedPosts.includes(post._id)) {
        user.downvotedPosts.push(post._id);
        post.downvotedBy.push(req.user._id);
        user.upvotedPosts = user.upvotedPosts.filter(id => !id.equals(post._id));
        post.upvotedBy = post.upvotedBy.filter(id => !id.equals(req.user._id));
    } else {
        user.downvotedPosts = user.downvotedPosts.filter(id => !id.equals(post._id));
        post.downvotedBy = post.downvotedBy.filter(id => !id.equals(req.user._id));
    }

    await user.save();
    await post.save();

    return res.status(200).json(new ApiResponse(200, "Post downvoted", { post, user }));
});


// not for use
const deleteUpvotePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const userIndex = post.upvotedBy.findIndex(id => id.equals(req.user._id));
    if (userIndex === -1) {
        return res.status(400).json(new ApiResponse(400, "User has not upvoted this post", post));
    }

    post.upvotedBy.splice(userIndex, 1);

    try {
        await post.save();
        return res.status(200).json(new ApiResponse(200, "Upvote removed", post));
    } catch (error) {
        throw new ApiError(500, "Failed to update post");
    }
});


const deleteDownvotePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const userIndex = post.downvotedBy.findIndex(id => id.equals(req.user._id));
    if (userIndex === -1) {
        return res.status(400).json(new ApiResponse(400, "User has not downvoted this post", post));
    }

    post.downvotedBy.splice(userIndex, 1);

    try {
        await post.save();
        return res.status(200).json(new ApiResponse(200, "Downvote removed", post));
    } catch (error) {
        throw new ApiError(500, "Failed to update post");
    }
});
