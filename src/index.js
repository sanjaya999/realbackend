
// require('dotenv').config()

import dotenv from "dotenv"
import mongoose from "mongoose";
import {DB_NAME} from "./constants.js"
import  express  from "express";
import connectDB from "./db/index.js";


dotenv.config({
    path:'./env'
})

connectDB();





























// const app = express()

// ;( async ()=>{

//     try{
//          await mongoose.connect(`${process.env.MONGOGB_URL}/${DB_NAME}`)
//             app.on("error", ()=>{
//                 console.log("error",error);
//                 throw error
//             })
//             app.listen(process.env.PORT,()=>{
//                 console.log(`listening`)
//             })
//     }
//     catch(error){
//         console.log("error",error)
//         throw error
//     }

// })






