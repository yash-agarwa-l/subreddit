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

app.use("/api/users",userRouter)
app.use("/api/posts",postRouter)
app.use("/api/upload",uploadRouter)

export {app}