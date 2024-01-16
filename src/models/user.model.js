import mongoose, {Schema} from "mongoose";
import { Jwt } from "jsonwebtoken";
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

        fullname : {
            type:String,
            required :true,
            trim:true,
            index:true
        },

        avatar : {
           type:String,
           
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
    this.password = bcrypt.hash(this.password,5)
    }
    else{
        next();

    }

})
export const User = mongoose.model("User",userSchema)