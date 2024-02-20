import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username : {
            type:String,
            required :true,
            unique : true,
            lowercase :true,
            trim:true,
            index:true
        },

        email : {
            type:String,
            required :true,
            unique : true,
            lowercase :true,
            trim:true,
            
        },

        fullName : {
            type:String,
            required :true,
            trim:true,
            index:true
        },

        avatar : {
           type:String,
           required: true,
            
           
        },

        coverImage:{
            type:String,
        },

        WatchHistory:[
            {
            type: Schema.Types.ObjectId,
            ref:"video",
            }
        ],

        password:{
            type:String,
            required : [true, "Password is required"]
        },
        
        refreshToken :{
            type : String,
        
        }
    },
    {
        timestamps: true
    }
)
        
userSchema.pre("save", async function (next){
    if(this.isModified("password")){
    this.password =  await bcrypt.hash(this.password,5)
    }
    else{
        next();

    }

})

userSchema.methods.isPasswordCorrect = async function(password){
   return  await bcrypt.compare(password, this.password)
}


// {},{secret token key} , {expiry}
userSchema.methods.generateAccessToken = function(){
     return jwt.sign( {
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
}

//jwt is bearer token i.e whoever has this token we send info to the user who has this toke

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,
       
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    })

}
export const User = mongoose.model("User",userSchema)