import { Router } from "express";
import {  
    googleSignInUser,
    logoutUser,
    refreshAccessToken
    }
    from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();


// router.route("/register").post(registerUser)
// router.route("/login").post(loginUser)


router.route("/auth/google").post(googleSignInUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-Token").post(refreshAccessToken)


export default router

