import express from "express";
import cookieParser from "cookie-parser"
const app=express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import uploadRouter from "./routes/upload.route.js";
import commentRouter from "./routes/comment.route.js";
import communityRouter from "./routes/community.route.js";

app.use("/api/users",userRouter)
app.use("/api/posts",postRouter)
app.use("/api/upload",uploadRouter)
app.use("/api/posts/comment",commentRouter)
app.use("/api/posts/community",communityRouter)

export {app}