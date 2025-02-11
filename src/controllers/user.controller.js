import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {User} from "../models/user.model.js";

const options={
    httpOnly:true,
    secure:true
}

const getAccessAndRefreshToken=async(userId)=>{

   try {
     const user=await User.findById(userId)
     const accessToken=user.generateAcccessToken()
     const refreshToken=user.generateRefreshToken()
 
     user.refreshToken=refreshToken
     await user.save({validateBeforeSave:false})
 
     return {accessToken,refreshToken}
   } catch (error) {
    throw new ApiError(500,"something went wrong")
   }
}

const registerUser=asyncHandler(async(req,res)=>{

    const {fullname,username,email,password}=req.body
    if(!username){
        throw new ApiError(400,"All fields are required")
    }
    if(!fullname){
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
        fullname,
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

    const {accessToken,refreshToken}=getAccessAndRefreshToken(user._id)
    const loggedinUser=await User.findById(user._id).select("-password -refreshToken")

    res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,"user logged in",{
        user:loggedinUser,accessToken,refreshToken
    }))

   
})

const logoutUser=asyncHandler(async (req,res)=> {
    
})

export {
    registerUser
}