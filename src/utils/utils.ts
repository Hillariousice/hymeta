import Joi from 'joi'
import jwt, { JwtPayload } from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { APP_SECRET, FromAdminMail, GMAIL_PASS, GMAIL_USER, accountSid, authToken, fromAdminPhone, userSubject } from '../config/db'
import { UserPayload } from '../dto/userdto'

export const registerSchema = Joi.object().keys({
    firstName:Joi.string().required(),
    lastName:Joi.string().required(),
    email:Joi.string().required(),
    phone:Joi.string().required(),
    password:Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    confirm_password:Joi.any().equal(Joi.ref('password')).required().label('Confirm Password').messages({"any.only":"{{label}} does not match"})
})

export const nextOfKinSchema = Joi.object().keys({
  fullName:Joi.string().required(),
  email:Joi.string().required(),
  phone:Joi.string().required(),
  address:Joi.string().required(),
  gender:Joi.string().required(),
  coverImage:Joi.string()

})

export const upnextOfKinSchema = Joi.object().keys({
  fullName:Joi.string(),
  email:Joi.string(),
  phone:Joi.string(),
  address:Joi.string(),
  gender:Joi.string(),
  coverImage:Joi.string()

})


export const loginSchema = Joi.object().keys({
  email:Joi.string().required(),
  password:Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
})

export const updateSchema = Joi.object().keys({
  firstName:Joi.string(),
  lastName:Joi.string(),
  address:Joi.string(),
  gender:Joi.string(),
  phone:Joi.string(),
  coverImage:Joi.string()
})

export const walletSchema = Joi.object().keys({
  accountNumber:Joi.number().required(),
  pin:Joi.string().required(),
})

export const GenerateSignature = async (payload:UserPayload) => {
  return jwt.sign(payload, APP_SECRET, { expiresIn: "1d" });
};
//GENERATE TOKEN FOR A USER
export const verifySignature = async (signature: string) => {
  return jwt.verify(signature, APP_SECRET) as JwtPayload;
};

export const option = {
    abortEarly: false,
    errors: {
      wrap: {
        label: "",
      },
    },
  };


 
  export const GenerateOTP = ()=>{
    const otp = Math.floor(1000 + Math.random() * 9000);
    const expiry = new Date();
    expiry.setTime(new Date().getTime() + 60 * 60 * 1000);
    return {otp,expiry};
  }
  export const onRequestOTP =async (otp:number, toPhoneNumber:string)=>{
    const client = require('twilio')(accountSid, authToken);
    const response =await client.messages 
    .create({
      body: `Your OTP is ${otp}`,
      to: toPhoneNumber,
      from: fromAdminPhone
    })
    return response
  }
  
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth:{
      user:GMAIL_USER,
      pass:GMAIL_PASS
    },
    tls:{
      rejectUnauthorized:false
    }
  })
  
  export const mailSent = async(
    from:string,
    to:string,
    subject:string,
    html:string
  ) => {
    try{
      const response = await transport.sendMail({
      from: FromAdminMail, subject:userSubject, to, html
      })
      return response
    }catch(err){
      console.log(err)
    }
  }
  
    export const emailHtml=(otp:number):string=> {
      let response =`
      <div style="max-width: 700px; margin:auto; border:10px solid #ddd; border-radius:25px; padding:50px 20px; font-size:110%; font-family:sans-serif;">
      <h2 style="text-align:center; text-transform:uppercase; color:teal;">
      WELCOME TO HYMETA
      </h2>
      <p>Hi there, your otp is ${otp}</p>
      </div>
      `
      return response
    }
  
  /**===================user mail services =========== **/
    export const mailSent2 = async (
      from: string,
      to: string,
      subject: string,
      html: string,
    )=>{
      try {
       const response = await transport.sendMail(
          { from: FromAdminMail,
              subject:
              userSubject,
              to,
              html})
              return response
      } catch (error) {
          console.log(error)
      }
  }
  export const emailHtml2 = (link:string):string=>{
      let response =  `
      <div style="max-width:700px;
      margin:auto;
      border:10px solid #ddd;
      padding:50px 20px;
      font-size: 110%;
      font-style: italics
      "> 
      <h2 style="text-align:center;
      text-transform:uppercase;
      color:teal;
      ">
      Swift Riders
      </h2>
      <p>Hi there, below is your password reset link and it expires in 10 mins</p>
       ${link}
       <h3>DO NOT DISCLOSE TO ANYONE<h3>
       </div>
      `
      return response
  }
  