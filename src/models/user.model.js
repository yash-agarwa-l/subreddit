import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        },
        upvotedPosts:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        },
        downvotedPosts:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        }

    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) { 
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){

    return jwt.sign(
        {

            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_SECRET,
        {
            expiresIn:process.env.ACCESS_EXPIRY|| "10d"
        }
        
    )
}

userSchema.methods.generateRefreshToken=function(){

    return jwt.sign(
        {

            _id: this._id,
        
        },
        process.env.REFRESH_SECRET,
        {
            expiresIn:process.env.REFRESH_EXPIRY|| "2d"
        }
    )
}
export const User=mongoose.model("user",userSchema)