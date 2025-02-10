import mongoose from "mongoose";
import dotenv from "dotenv";
import {User} from "../src/models/user.model.js"; // Import model

dotenv.config(); // Load environment variables

async function seedDatabase() {
 const connection=await mongoose.connect(`${process.env.MONGODB_URL}/subreddit`)    
    await User.create({
        username: "test",
        email: "test@example.com",
        fullName:"test test",
        password:"test123"
    });

    console.log("✅ Database seeded!");
    mongoose.connection.close();
}

seedDatabase();