 import { asyncHandler } from "../utils/asyncHandler.js";





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


    //1.get user detail

       const {fullName , email , username , password}= req.body
       console.log("email:" , email);

})
 

export { registerUser,}