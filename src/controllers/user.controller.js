 import { asyncHandler } from "../utils/asyncHandler.js";
import  {ApiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";



const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
         const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
       await  user.save({validateBeforeSave : false})

       return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500,"sth went wrong while generating refresha and access token")
        
    }
}


//if res not need then write _

const registerUser= asyncHandler( async(req , _)=>{
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
    if(!email || !password){

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
     const loggedInUser  = await User.findById(user._id).
      select("-password -refreshToken")
      const Option = {
        httpOnly : true,
        secure : true,
      }

      return res.status(200)
      .cookie("accessToken",accessToken,Option)
      .cookie("refreshToken" , refreshToken, Option)
      .json(
        new ApiResponse(200, {
            user:loggedInUser,accessToken,refreshToken
        },
        "user logged in successfully"
        )
      )

})

const logoutUser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken: undefined
        }
    })
    const Option = {
        httpOnly : true,
        secure : true,
      }
      return res
      .status(200)
      .clearCookie("accessToken", Option)
      .clearCookie("refreshToken", Option)
      .json(new ApiResponse(200, {}, "User logged Out"))
  })
 

export { registerUser,loginUser,logoutUser}