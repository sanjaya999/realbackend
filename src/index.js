
// require('dotenv').config()

import dotenv from "dotenv"
import express from "express";
import connectDB from "./db/index.js";
import { app } from "./Apps.js";


dotenv.config({
    path:'./.env'
})



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port ${process.env.PORT}`)
    })
    
})
.catch((err)=>{
    console.log("mongodb conn fail",err);

})





























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






