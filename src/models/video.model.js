 import mongoose, {Schema} from "mongoose";
 import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


 const videoSchemna = new Schema(
    {
        videoFile :{
            type:String,
            required : true
        },

        
            title: {
                type:String,
                required:true
            },

            
        duration :{
            type:Number,
            require: true
        },
        views:{
            type:Number,
            default:true
        },

        ispublished:{
            type : Boolean,
            default : true

        },
        owner :{
            type : Schema.Types.ObjectId,
            ref : "user"
        }
        

    }, 
    {
        tiimestamps:true
    }
 )

 videoSchemna.plugin(mongooseAggregatePaginate)

 export const Video = mongoose.model("Video, videoSchema")

