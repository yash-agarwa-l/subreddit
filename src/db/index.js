import mongoose from "mongoose";

const connectDB=async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/subreddit`)
    } catch (err) {
        process.exit(1)
    }
}

export default connectDB;