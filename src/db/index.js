import mongoose from "mongoose";

const connectDB=async ()=>{
    try {
        const connection=await mongoose.connect(`${process.env.MONGODB_URL}`)
        // console.log(connection)
        console.log("db connected")
    } catch (err) {
        process.exit(1)
    }
}

export default connectDB;