import { Post } from "../models/post.model.js";
import {Community} from "../models/community.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";




const upvotePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        throw new ApiError(404,"post not found") 
    }

    if (!post.upvotedBy.includes(req.user._id)) {
        post.upvotedBy.push(req.user._id);
        post.downvotedBy = post.downvotedBy.filter(id => !id.equals(req.user._id));
    }

    await post.save();
    return res.status(200).json(new ApiResponse(200, 'Post upvoted', post));
});

const downvotePost=asyncHandler(async(req,res)=>{
    const post=await Post.findById(req.params.id)
    if (!post) {
        throw new ApiError(404,"post not found") 
    }

    if(!post.downvotedBy.includes(req.user._id)){
        post.downvotedBy.push(req.user._id);
        post.upvotedBy=post.upvotedBy.filter(id=>!id.equals(req.user._id))
    }

    await post.save();
    return res.status(200).json(new ApiResponse(200, 'Post downvoted', post));


})

const deleteupvote= asyncHandler(async(req,res)=>{
    const post= await Post.findById(req.params.id);
    if (!post) {
        throw new ApiError(404,"post not found") 
    }

    if(!post.downvotedBy.includes(req.user._id)){
        post.downvotedBy.push(req.user._id);
        post.upvotedBy=post.upvotedBy.filter(id=>!id.equals(req.user._id))
    }

    await post.save();
    return res.status(200).json(new ApiResponse(200, 'Post downvoted', post));

})


const deleteDownvotePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // Check if the user is actually in the downvotedBy list
    const userIndex = post.downvotedBy.findIndex(id => id.equals(req.user._id));
    if (userIndex === -1) {
        return res.status(400).json(new ApiResponse(400, 'User has not downvoted this post', post));
    }

    // Remove user from the downvotedBy list
    post.downvotedBy.splice(userIndex, 1);

    try {
        await post.save();
        return res.status(200).json(new ApiResponse(200, 'Downvote removed', post));
    } catch (error) {
        throw new ApiError(500, "Failed to update post");
    }
});


const deleteUpvotePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // Check if the user is actually in the downvotedBy list
    const userIndex = post.upvotedBy.findIndex(id => id.equals(req.user._id));
    if (userIndex === -1) {
        return res.status(400).json(new ApiResponse(400, 'User has not downvoted this post', post));
    }

    // Remove user from the downvotedBy list
    post.downvotedBy.splice(userIndex, 1);

    try {
        await post.save();
        return res.status(200).json(new ApiResponse(200, 'Downvote removed', post));
    } catch (error) {
        throw new ApiError(500, "Failed to update post");
    }
});
