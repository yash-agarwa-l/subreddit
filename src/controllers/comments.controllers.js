
import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Comment } from "../models/comment.model.js";

export const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { postId } = req.params;

    if (!text) {
        throw new ApiError(400, "Comment text is required");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.create({
        post: postId,
        author: req.user._id,
        text
    });

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json(new ApiResponse(201, "Comment added", { comment }));
});


export const deleteComment = asyncHandler(async (req, res) => {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (!comment.author.equals(req.user._id)) {
        throw new ApiError(403, "Unauthorized to delete this comment");
    }

    await Post.findByIdAndUpdate(postId, {
        $pull: { comments: comment._id }
    });

    await comment.deleteOne();

    return res.status(200).json(new ApiResponse(200, "Comment deleted"));
});


export const editComment = asyncHandler(async (req, res) => {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!text) {
        throw new ApiError(400, "Comment text is required");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (!comment.author.equals(req.user._id)) {
        throw new ApiError(403, "Unauthorized to edit this comment");
    }

    comment.text = text;
    await comment.save();

    return res.status(200).json(new ApiResponse(200, "Comment edited", { comment }));
});

export const getAllComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate({
        path: "comments",
        populate: {
            path: "author",
            select: "username fullName"
        }
    });

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    return res.status(200).json(new ApiResponse(200, "Comments fetched", { comments: post.comments }));
});
