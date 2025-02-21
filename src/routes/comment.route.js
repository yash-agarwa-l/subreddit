import { Router } from "express";
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    upvotePost,
    downvotePost
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const commentRouter=Router()

commentRouter.route("/:id").get(verifyJWT,getAllComments).post(verifyJWT,addComment).put(verifyJWT,updateComment).delete(verifyJWT,deleteComment)



