import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

 const MONGO_URL=process.env.MONGO_URL

export const connectDB = async()=>{
    try{
         const conn = await mongoose.connect(process.env.MONGO_URL!)
    }catch(err){
        console.log(err)
    }
}

export const APP_SECRET = process.env.APP_SECRET!

//SENDING OTP TO PHONE
export const accountSid = process.env.ACCOUNTSID;
export const authToken = process.env.AUTHTOKEN
export const fromAdminPhone = process.env.FROMADMINPHONE

//SENDING OTP TO EMAIL
export const GMAIL_USER = process.env.Gmail
export const GMAIL_PASS = process.env.GmailPass
export const FromAdminMail = process.env.FromAdminMail as string
export const userSubject = process.env.userSubject as string
export const Base_Url = process.env.BASE_URL as string;
export const URL = process.env.URL as string;
export const port = process.env.PORT || 4000;
export const payStack = process.env.PAYSTACK_SECRET_KEY as string;
