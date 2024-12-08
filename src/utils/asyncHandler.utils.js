/*const asyncHandler = (fun)=>async (req,res,next)=>{
    try{
        await fun(req,res,next);
    }catch(err){
        res.status(err.code||500).json({
            sucess:false,
            message:err.message||"An unidentified error occured"
        });
    }
}*/
const asyncHandler =(requesrHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requesrHandler(req,res,next)).catch((err)=>next(err))
    } 
}

export { asyncHandler };