import { Router } from "express";
import {loginUser, logoutUser, registerUser , refreshAccessToken, changeCurrentUserPassword, getCurrentUser, updateAccountDetail, updateUserAvater, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
verifyJWT


const router = Router();


router.route("/register").post(
    upload.fields([

     {
        name:"avatar",
        maxCount:1
    },
     {
        name:"coverImage",
        maxCount:1
     }

    ]),
    
    registerUser);

    router.route("/login").post(loginUser)

    //secured routes
    router.route("/logout").post( verifyJWT , logoutUser)
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change-password").post(verifyJWT,changeCurrentUserPassword)
    router.route("/current-user").get(verifyJWT,getCurrentUser)
    router.route("/update-detail").patch(updateAccountDetail)
    router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvater)
    router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
    router.route("/history").ger(verifyJWT,getWatchHistory);
    

export default router