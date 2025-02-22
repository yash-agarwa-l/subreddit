import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {OAuth2Client} from "google-auth-library";

const options={
    httpOnly:true,
    secure:true
}

const getAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (!process.env.ACCESS_SECRET || !process.env.REFRESH_SECRET) {
            throw new ApiError(500, "JWT secrets not found in environment variables");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in getAccessAndRefreshToken:", error);
        throw new ApiError(500, "Error generating tokens");
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const signInUser=asyncHandler(async(req,res)=>{
    const { idToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload(); 


    const user = {
      email: payload.email,
      fullName: payload.name,
    };

})




const registerUser=asyncHandler(async(req,res)=>{

    const {fullName,username,email,password}=req.body
    if(!username){
        throw new ApiError(400,"All fields are required")
    }
    if(!fullName){
        throw new ApiError(400,"All fields are required")
    }
    if(!email){
        throw new ApiError(400,"All fields are required")
    }
    if(!password){
        throw new ApiError(400,"All fields are required")
    }

   const existedUser= await User.findOne({
        username
    })
    if(existedUser){
        throw new ApiError(400,"user already exists")
    }

    const user=await User.create({
        fullName,
        email,
        password,
        username
    })
    const createdUser= await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"something went wrong");
    }

    return res.status(200).json(new ApiResponse(200,"user registered",{createdUser}))

})

const loginUser=asyncHandler(async(req,res)=>{

    const {username,email,password}=req.body
    
    if(!username && !email){
        throw new ApiError(400,"username or email required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"user not found")
    }
    const isCorrect=await user.isPasswordCorrect(password)
    if(!isCorrect){
        throw new ApiError(401,"invalid")
    }

    const {accessToken,refreshToken}=await getAccessAndRefreshToken(user._id)
    
    
    const loggedinUser=await User.findById(user._id).select("-password -refreshToken")

    res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,"user logged in",{
        user:loggedinUser,accessToken,refreshToken
    }))

   
})

const logoutUser=asyncHandler(async (req,res)=> {
    await User.findByIdAndUpdate(
        req.user._id,

        {

            $unset:{
            refreshToken:1
            }
        },
        {
            new:true
        }
   )

   res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,"user looged out",{}))

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies?.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
   try {
     const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_SECRET)
 
     const user=await User.findById(decodedToken?._id)
     if (!user) {
         throw new ApiError(401, "Invalid refresh token")
     }
 
     if(incomingRefreshToken!==user?.refreshToken){
         throw new ApiError(401,"token expired or used")
     }
 
     const {accessToken,newRefreshToken}=getAccessAndRefreshToken(user?._id)
 
     return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(
         new ApiResponse(
             200,"Access token refreshed",{accessToken, refreshToken: newRefreshToken}
         )
     )
   } catch (error) {

    throw new ApiError(401, error?.message || "Invalid refresh token") 
   }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}