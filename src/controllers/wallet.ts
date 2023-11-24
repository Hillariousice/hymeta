import express,{Request,Response} from 'express'
import {  GenerateOTP, GenerateSignature, emailHtml,  loginSchema, mailSent, nextOfKinSchema, option, registerSchema, updateSchema, verifySignature, walletSchema } from '../utils/utils'
import User from '../model/User'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from "jsonwebtoken";
import Wallet from '../model/Wallet';
import { payStack } from '../config/db';
import axios from 'axios';

export const createWallet = async(req:Request,res:Response)=>{
    try{
       const token = req.params.signature;
       const{accountNumber,pin} = req.body
         const decode = await verifySignature(token) as unknown as JwtPayload;
         const validateResult = walletSchema.validate(req.body,option)
           if(validateResult.error){
               return res.status(400).json({
                   Error:validateResult.error.details[0].message
               })
           }
         // check if user is a registered user
         const user = await User.findOne({ email: decode.email })
         if(user){
           const wallet = await Wallet.create({
               accountNumber,
               pin:bcrypt.hashSync(pin, 12)})
               if(wallet){
                   const token = await GenerateSignature({
                       id:user._id,
                       email:user.email,
                       verified:user.verified
                   })
                   return res.status(201).json({
                       message: "Wallet created successfully",
                       token:token,
                       accountNumber:wallet.accountNumber,
                       pin:wallet.pin,
                       email:user.email,
                       verified:user.verified,
                       });
                     
               }
         }
         
        return res.status(400).json({
           message:'Wallet already exist',
           Error:'Wallet already exist'
          })
    }catch(err){
       console.log(err)
       return res.status(500).json({
           Error: "Internal server Error",
           route: "/users/wallet/:signature",
         });
    }
   }

 export  const checkBalance = async(req:Request,res:Response)=>{
   try{
    const token = req.params.signature;
    const decode = await verifySignature(token) as unknown as JwtPayload;
    const user = await User.findOne({ email: decode.email })
    if( user){
      const wallet = await Wallet.findOne({accountNumber:user.wallet})
      if(wallet){
        return res.status(200).json({
          message:'Wallet balance',
          balance:wallet.balance,
          accountNumber:wallet.accountNumber

        })
      }
    }
   return res.status(400).json({
      message:'Wallet can not be funded',
      Error:'Wallet can not be funded'
     })
   }catch(err){
    console.log(err)
    return res.status(500).json({
        Error: "Internal server Error",
        route: "/users/wallet/balance/:signature",
      });
   }
 }

 export const getUserWallet = async(req:Request,res:Response)=>{
try{
const id = req.params._id
const wallet = await Wallet.findOne({accountNumber:id})
if(wallet){
  return res.status(200).json({
    message:'Wallet gotten successfully',
    wallet:wallet
  })
}
return res.status(400).json({
  message:'No wallet found',
  Error:'No wallet found'
 })
}catch(err){
  console.log(err)
  return res.status(500).json({
      Error: "Internal server Error",
      route: "/users/wallet/:signature",
    });
 }}

export const initCredit = async(req:Request,res:Response)=>{
  try{
    const {amount} = req.body
    const email = req.params.signature  
    const payload ={email,amount:amount*100}
    const headers = {
  Authorization: `Bearer ${payStack}`,
  'Content-Type': 'application/json',

}
const url='https://api.paystack.co/transaction/initialize'
const pSresponse = await axios.post(url,payload,{headers})
if(pSresponse){
  return res.json({
      url :pSresponse.data.authorization_url
  })
}
  }catch(err){
    console.log(err)
    return res.status(500).json({
        Error: "Internal server Error",
        route: "/users/wallet/init-credit",
      });
  }
}

 export const transfer = async(req:Request,res:Response)=>{
  try{
    const id = req.params._id

  }catch(err){
    console.log(err)
    return res.status(500).json({
        Error: "Internal server Error",
        route: "/users/wallet/transfer/:signature",
      });
  }
 }

export const fundWallet = async(req:Request,res:Response)=>{
  try{
    const { amount } = req.body;
    const userId = req?.user._id;
    if(!amount || amount <= 0){
      return res.status(400).json({ error: 'Invalid amount' });
    }
const user = await User.findById(userId)
    if (user) {
      
      const wallet = await Wallet.findOne({accountNumber:user.wallet})
      if(wallet){

          wallet.balance += amount
          await wallet.save()
          res.status(200).json({
            message:'Wallet funded successfully',
            balance:wallet.balance,
            accountNumber:wallet.accountNumber
          })

      }
     
    }
    return res.status(400).json({
      message:'Wallet can not be funded',
      Error:'Wallet can not be funded'
     })
  }catch(err){
    console.log(err)
    return res.status(500).json({
        Error: "Internal server Error",
        route: "/users/wallet/fund/:signature",
      });
  }
}
