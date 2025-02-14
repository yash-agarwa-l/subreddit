import { Post } from "../models/post.model.js";
import {Community} from "../models/community.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const createPost=asyncHandler(async(req,res)=>{
    const {title,description,communityId}=req.body
    const userid=req.user._id
    if(!title || !description || !communityId){
        throw new ApiError(400,"all field required")
    }
   
    const community = await Community.findById(communityId);
    if (!community) {
       throw new ApiError(404,"community not found")
    }

    const post=await Post.create({
        title,
        description,
        author:userid,
        community:communityId
    })
     //image uploading left

    return res.status(201).json(new ApiResponse(201,"Post created",post))
})

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


export {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    upvotePost,
    downvotePost
}