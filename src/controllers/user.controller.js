 import { asyncHandler } from "../utils/asyncHandler.js";
import  {ApiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import  Jwt  from "jsonwebtoken";
import mongoose from "mongoose";



const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
         const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
       await  user.save({validateBeforeSave : false})

console.log(accessToken,refreshToken);
       return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500,"sth went wrong while generating refresha and access token")
        
    }
}
 




    
//if res not need then write _con

const registerUser= asyncHandler( async(req , res)=>{
    //get user detail from frontend
    //validate the user
    //check if user already exist with email or username
    //check for imgaes and avatar
    //upload them to cloudinary
    //create user object and entry in db
    //remove password and refresh token field from response
    //check if user is created or not 
    //if yes return response orelse retrun null


    //1.get user detail , it comes in req.body

       const {fullName , email , username , password}= req.body
       console.log("email:" , email);

        //validate if empty field 
      if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
        ){
            throw ApiError(400 , "All fields are required")
        }

         const existedUser =  await User.findOne({
            $or:[{ username },{ email }]
        })

        if (existedUser){
            throw new ApiError(409 , "User already existed")

        }

       //req.body gives access by express and req.files is by multer middleware
         const avatarLocalPath = req.files?.avatar[0]?.path;
         const coverImageLocalPath = req.files?.coverImage[0]?.path;

         if(!avatarLocalPath){
            throw new ApiError(400 , "avatar file is required");

         }

          const avatar = await uploadOnCloudinary(avatarLocalPath)
          const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400 , "avatar is requried")
        }

        const user =   await User.create({
            fullName ,
            avatar : avatar.url,
            coverImage : coverImage?.url || "",
            email,
            password,
            username : username.toLowerCase()

        })
        //check if use exist in database or not 
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new ApiError(500 , "sth went wrong while regisering the user")
        }


        return res.status(201).json(
            new ApiResponse(200, createdUser , "User registered Successfully")
        )
})


const loginUser = asyncHandler(async(req,res)=>{
    //req body -> data
    //validate username or email
    //find user
    //password check
    //acess and refresh token generate
    //send cookies
    //uccessfully loggedin

    const {email,password}=req.body
    if(!email  &&!password){

        throw new ApiError (400 , "email and passwor is required")
    }


    
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404, "user does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError (401 , "Invalid user credentials")
    }

     const {accessToken , refreshToken} =  await generateAccessAndRefreshTokens(user._id)
     console.log(accessToken,refreshToken);
     const loggedInUser  = await User.findById(user._id).
      select("-password -refreshToken")
      const option = {
        httpOnly : true,
        secure : true,
      }

      return res.status(200)
      .cookie("accessToken",accessToken,option)
      .cookie("refreshToken" , refreshToken, option)
      .json(
        new ApiResponse(200, {
            user:loggedInUser,accessToken,refreshToken
        },
        "user logged in successfully"
        )
      )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const option = {
        httpOnly: true,
        secure: true
    }


      return res
      .status(200)
      .clearCookie("accessToken", option)
      .clearCookie("refreshToken", option)
      .json(new ApiResponse(200, {}, "User logged Out"))
  })
 

  const refreshAccessToken= asyncHandler(async(req,res)=>{

    //check if cookies token is  valid or not
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorize request");
   }

   try {// we refresh the tokens
    
    const decodedToken = Jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
    )
 
       const user = await User.findById(decodedToken?._id)
       if(!user){
         throw new ApiError(401," invalid refresh token L194");
        }
 
        if (incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401 , "refresh token is expired or used")
         
        }
        const option = {
         httpOnly:true,
         secure : true
        }
        
       const {accessToken , newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
 
 
        return res
        .status(200)
        .cookie("accessToken" , accessToken , option)
        .cookie("refreshToken", newrefreshToken,option)
        .json(
         new ApiResponse(
             200,
             {accessToken , refreshToken : newrefreshToken},
             "Access token refreshed"
 
         )
        )
   } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token 227")
    
   }
  })





  const changeCurrentUserPassword= asyncHandler (async(req,res)=>{
    const { oldPassword , newPassword}= req.body
    
      const user = await User.findById(req.user?._id)
       const isPasswordCorrect = await  user.isPasswordCorrect(oldPassword)
       
       if(!isPasswordCorrect){
        throw new ApiError(400, "invalid password")

       }
       user.password = newPassword
        await user.save({validateBeforeSave : false})
        return res
        .status(200)
        .json(new ApiResponse(200,{}, "Password Changed"))
  })


  const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(200, req.user , "current user fetched succesfully")
  })


  const updateAccountDetail = asyncHandler(async(req,res)=>{
    const {fullName, email}= req.body
    if(!fullName || !email){
        throw new ApiError (400 , "all field are required")
    }
   const user =  await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            fullName,
            email 
        }
    },
    {new:true}
    )
    .select("-password" )
    return res.status(200)
    .json(new ApiResponse(200),user,"account detail updated successfully");

  })


  const updateUserAvater = asyncHandler(async(req,res)=>{

     const avatarLocalPath = req.file?.path
     if (!avatarLocalPath){
        throw new ApiError(400, "avatar file missing")
        
     }
     const avatar = await uploadOnCloudinary(avatarLocalPath)

     if (!avatar.url){
        throw new ApiError(400 , "error while uploadding avatar")

     }

    const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                avatar : avatar.url
            }
        },
        {
            new: true
        }
     ).select("-password")

     return res.status(200)
     .json(
        new ApiResponse(200, user , "avatar updated")
     ) // now delete old avatar


  })

const getUserChannelProfile = asyncHandler(async(req,res)=>{
 const {username} = req.params  //this is url
 if(!username?.trim()){
    throw new ApiError(400, "username missing 318 ")
 }
   const channel =  await User.aggregate[
    {
        $match :{
            username : username?.toLowerCase()
        },
    }
   ,{
        $lookup :{
            from : "subscriptions",
            localField : "_id",
            foreignField: "channel",
            as : "subscriber"

        }
   },{
    $lookup: {
        from : "subscriptions",
        localField : "_id",
        foreignField: "subscriber",
        as : "subscribedTo"

    }
   },{
    $addFields  :{
        subscriberCount :{
            $size : "subscribers"
        },
        channelsSubscribedToCount :{
            $size : "$subscribedTo"
        },
        issubscribed :{
            $cond :{
            
            if:{$in: [req.user?._id,"$subscribers.subsscribe"]},
            then:true,
            else : flase
            }
        }
    }
   },{
    $project : {
        fullName:1,
        username:1,
        subscriberCount:1,
        channelsSubscribedToCount:1,
        issubscribed:1,
        avatar:1,
        coverImage:1,
        email:1,

 
    }
   }]
   if (!channel?.length) {
    throw new ApiError(404 , "channel does not exist")
    
   }
   return res
   .status(200)
   .json(
    new ApiResponse(200 , channel[0],"channel fetched successfully")
   )
})


const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([


    {
        $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },

{
    $lookup:{
        from : "videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline :[
            {
                $lookup :{
                    from : "users",
                    localField:"owner",
                    foreignField : "_id",
                    as : "owner",
                    pipeline :[{
                        $project :{
                            fullName :1,
                            username:1,
                            avatar :1,
                        }
                    }]
                }
            },{
                $addFields:{
                    owner : {
                        $field:"$owner"
                    }
                }
            }
        ]
        }
        
    }


    ])
})


export { 
    registerUser,
    loginUser,
    logoutUser,
     refreshAccessToken,
    getCurrentUser,
    changeCurrentUserPassword,
    updateAccountDetail,
    updateUserAvater,
    getUserChannelProfile,
    getWatchHistory
}
