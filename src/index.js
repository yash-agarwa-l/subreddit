import connectDB from "./db";
import { app } from "./app";

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log("server running !!!")
    })
})
.catch((err)=>{
    console.log("connection failed", err)
})