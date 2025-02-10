import mongoose from "mongoose";

const connectDB=async ()=>{
    try {
        const connection=await mongoose.connect(`${process.env.MONGODB_URL}/subreddit`)
        // console.log(connection)
    } catch (err) {
        process.exit(1)
    }
}

export default connectDB;