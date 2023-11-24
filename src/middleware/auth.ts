import {Request, Response,NextFunction} from 'express'
import jwt,{JwtPayload} from 'jsonwebtoken'
import {APP_SECRET} from "../config/db";
import User from '../model/User';


export const auth = async(req:JwtPayload,res:Response,next:NextFunction)=>{
try{
    const authorization = req.headers.authorization

    if(!authorization){
        return res.status(401).json({
            Error:"Kindly login"
        })
    }
   // Bearer erryyyygccffxfx
   const token = authorization.slice(7, authorization.length);
   let verified = jwt.verify(token,APP_SECRET) 
   if(!verified){
       return res.status(401).json({
           Error:"unauthorized access"
        })
    }
    
    
    const {_id} = verified as {[key:string]:string}
    
    // find the user by id
    const user = (await User.findOne({
        _id: _id
    }))
    
    if(!user){
        return res.status(401).json({
            Error:"Invalid Credentials"
        })
    } 
    
    req.user = verified;
    next()
}catch(err){
    return res.status(401).json({
        Error:'Unauthorized'
       })
}
}

