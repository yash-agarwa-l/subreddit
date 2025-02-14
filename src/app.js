import express from "express";
import cookieParser from "cookie-parser"
const app=express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";

app.use("/api/users",userRouter)
app.use("/api/posts",postRouter)

export {app}