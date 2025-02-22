import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
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
        course:{
            type: String,
        },
        branch:{
            type:String,
        },
        year:{
            type: Number,
            enum:[1,2,3,4]
        },
        bio:{
            type:String,
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
        },
        communities:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Community"
            }
        ],
        googleId:{
            type:"String",
            unique:true,
            required:true
        }

    },
    {
        timestamps: true
    }
)

// userSchema.pre("save", async function (next) { 
//     if (!this.isModified("password")) {
//         return next();
//     }

//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// userSchema.methods.isPasswordCorrect=async function(password){
//     return await bcrypt.compare(password,this.password)
// }

userSchema.methods.generateAccessToken=function(){

    return jwt.sign(
        {

            _id: this._id,
            gId:this.googleId,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_SECRET,
        {
            expiresIn:process.env.ACCESS_EXPIRY|| "1d"
        }
        
    )
}

userSchema.methods.generateRefreshToken=function(){

    return jwt.sign(
        {

            _id: this._id,
            gid:this.googleId
        
        },
        process.env.REFRESH_SECRET,
        {
            expiresIn:process.env.REFRESH_EXPIRY|| "7d"
        }
    )
}
export const User=mongoose.model("user",userSchema)