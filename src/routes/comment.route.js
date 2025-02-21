import { Router } from "express";
import { getAllComments,addComment,editComment,deleteComment } from "../controllers/comments.controllers.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentRouter=Router()

commentRouter.route("/:id").get(verifyJWT,getAllComments).post(verifyJWT,addComment).put(verifyJWT,editComment).delete(verifyJWT,deleteComment)


export default commentRouter;  

