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

const router=Router()

router.route("/").get(getAllPosts).post(verifyJWT,createPost)
router.route("/:id").get(getPostById).put(verifyJWT,updatePost).delete(verifyJWT,deletePost)
router.post("/:id/upvote",verifyJWT,upvotePost)
router.post("/:id/downvote",verifyJWT,downvotePost)


export default router