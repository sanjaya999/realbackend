import mongoose from "mongoose";
import {DB_NAME, sandb} from "./constants"
import  express  from "express";

const app = express()

;( async ()=>{

    try{
         await mongoose.connect(`${process.env.MONGOGB_URL}/${DB_NAME}`)
            app.on("error", ()=>{
                console.log("error",error);
                throw error
            })
            app.listen(process.env.PORT,()=>{
                console.log(`listening`)
            })
    }
    catch(error){
        console.log("error",error)
        throw error
    }

})




