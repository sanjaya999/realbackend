 import { asyncHandler } from "../utils/asyncHandler.js";





const registerUsere = asyncHandler( async(req , res)=>{
    res.status(200).json({
        message:"ok"
    })
})


export { registerUsere,} 