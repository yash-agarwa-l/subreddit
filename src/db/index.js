import mongoose from "mongoose";

const connectDB=async ()=>{
    try {
        await mongoose.connect()
    } catch (err) {
        process.exit(1)
    }
}

export default connectDB;