import express,{Request,Response} from 'express'
import { GenerateOTP, GenerateSignature, emailHtml,  loginSchema, mailSent, nextOfKinSchema, option, registerSchema, updateSchema, verifySignature, walletSchema } from '../utils/utils'
import User from '../model/User'
import jwt, { JwtPayload } from "jsonwebtoken";
import { FromAdminMail, userSubject } from '../config/db';
import bcrypt from "bcrypt";




export const Register = async(req:Request,res:Response)=>{
     try{
        const {firstName,lastName,email,password,confirm_password,phone} = req.body
        const validateResult = registerSchema.validate(req.body,option)
        if(validateResult.error){
            return res.status(400).json({
                Error:validateResult.error.details[0].message
            })
        }

           const user = await User.findOne({email})
        if (!user) {
            await User.create({
                firstName,
                lastName,
                email,
                password,
                confirm_password,
                phone,
                address:"",
                gender:"",
                location:{lng:0,lat:0},
                verified:false,
                role:"user",
                coverImage:""
            });
            const userExist = await User.findOne({email})
                return res.status(201).json({
                message: "User created successfully",
                userExist
                });
            
        }

      return res.status(400).json({
        message:'User already exist',
        Error:'User already exist'
       })

     }catch(err){
        console.log(err)
        res.status(500).json({
            message:'Internal Server Error',
            Error: "/users/signup"
        })
     }
}

export const Login = async(req:Request,res:Response)=>{
    try{
        const { email, password }= req.body
        const validateResult = loginSchema.validate(req.body,option)
        if(validateResult.error){
            return res.status(400).json({
                Error:validateResult.error.details[0].message
            })
        }
         //trim the incoming emial
        const newEmail = email.trim().toLowerCase();
        const user = await User.findOne({email:newEmail})
      console.log(user,"user")
      if (user) {
        const validation = await user.comparePassword(password);        
        console.log(validation,"validation")
        if (validation) {
          // Generate a new Signature
          let signature = await GenerateSignature({
            id: user._id ,
            email: user.email,
            verified:user.verified,
          });
          console.log(signature,"signature")
          return res.status(200).json({
            message: "Login successful",
            signature: signature,
            id: user._id,
            email: user.email,
            verified: user.verified,
             coverImage:user.coverImage,
          });

          
        }
        }
        return res.status(400).json({
          Error: "Wrong Username or password or not a verified user",
        });
    
    }catch(err){
        console.log(err)
        res.status(500).json({
            message:'Internal Server Error',
            Error: "/users/login"
        })
    }
}


export const getAllUsers = async(req:Request,res:Response)=>{
    try{
        const users = await User.find({})
        res.status(200).json({
            message:"Here Is All Users",
            users
        })
    }catch(err){
        res.status(500).json({
            message:'Internal Server Error',
            Error: "/users/get-all-users"
        })
    }
}

export const userGet = async(req:Request,res:Response)=>{
try{
    const id= req.params._id
     const user = await User.findOne({_id:id})
    if(user){
        res.status(200).json({
            message:'Here Is Your User',
            user
         })
    }
    return res.status(400).json({
        message: "User not found",
      });
}catch(err){
    res.status(500).json({
        message:'Internal Server Error',
        Error: "/users/get-all-users/:_id"
    })
}
}

export const userUpdate = async(req:JwtPayload,res:Response)=>{
    try{
        const id = req.params._id
        const{firstName,lastName,address,gender,phone,coverImage}= req.body
        const validateResult = updateSchema.validate(req.body,option)
        if(validateResult.error){
            return res.status(400).json({
                Error:validateResult.error.details[0].message
            })
        }
        const user = await User.findOne({_id:id})
        if(!user){
            return res.status(400).json({
                Error: "You are not authorized to update your profile",
              });
        }
        const updatedUser = await User.findOneAndUpdate({_id:id},{
            firstName,lastName,address,gender,phone,
            coverImage:req.file.path
        })
        if(updatedUser){
            const user = await User.findOne({_id:id})
            res.status(200).json({
                message:'User updated',
                user
            })
        }
        return res.status(400).json({
            message: "Error occurred",
          });
    }catch(err){
        return res.status(500).json({
            message:'Internal Server Error',
            Error: "/users/updateUser/:_id"
        })
    }
}


export const userDelete = async(req:Request,res:Response)=>{
try{
    const id = req.params._id
    const user = await User.findByIdAndDelete({_id:id})
    if(user){
        return res.status(200).json({
            message:'User deleted successfully'
           
        })
    }
}catch(err){
    return res.status(500).json({
        message:'Internal Server Error',
        Error: "/users/deleteUser/:_id"
    })
}
}

/**==================Verify Users==================== **/
export const VerifyUser = async (req: Request, res: Response) => {
    try {
      const token = req.params.signature;
      const decode = await verifySignature(token)as unknown as JwtPayload ;
      // check if user is a registered user
      const user = await User.findOne({ email: decode.email })
      if (user) {
        const { otp } = req.body;

        // check if otp is valid
        if(user.otp === parseInt(otp) && user.otpExpires){
            const updateUser = await User.findOneAndUpdate({email:decode.email},{
                verified:true
            })
            let signature = await GenerateSignature({
                id: updateUser.id,
                email: updateUser.email,
                verified: updateUser.verified,
              });
              if(updateUser){
                const user = await User.findOne({email:decode.email})
                return res.status(200).json({
                    message: "Your account have been verified successfully",
                    signature,
                    verified: user.verified,
                  });
              }
            
      }
      return res.status(400).json({
        Error: "invalid credentials or OTP already expired",
      });
    }} catch (err) {
      res.status(500).json({
        Error: "Internal server Error",
        route: "/users/verify",
      });
    }
  };
  
  /**============================Resend OTP=========================== **/
  export const ResendOTP = async (req: Request, res: Response) => {
    try {
      const token = req.params.signature;
      const decode = await verifySignature(token) as unknown as JwtPayload;
      // check if user is a registered user
      const user = await User.findOne({ email: decode.email })
      if (user) {
        //Generate otp
        const { otp, expiry } = GenerateOTP();
        //update user
        const updatedUser = await User.findOneAndUpdate({ email: decode.email }, {
            otp,
            otpExpires: expiry,
            });
        if (updatedUser) {
          //Send OTP to user
          // await onRequestOTP(otp, User.phone);
          //send Email
          console.log(otp,"otp")
          const html = emailHtml(otp);
          await mailSent(FromAdminMail,user.email, userSubject, html);
          return res.status(200).json({
            message:
              "OTP resent successfully, kindly check your email or phone number for OTP verification",
          });
        }
      }
      return res.status(400).json({
        Error: "Error sending OTP",
      });
    } catch (err) {
      return res.status(500).json({
        Error: "Internal server Error",
        route: "/users/resend-otp/:signature",
      });
    }
  };

export const createNextOfKin = async(req:Request,res:Response)=>{ 
    try{
        const token = req.params.signature;
        const decode = await verifySignature(token) as unknown as JwtPayload;
        const {fullName,email,address,phone,gender,coverImage } = req.body
        const validateResult = nextOfKinSchema.validate(req.body,option)
        if(validateResult.error){
            return res.status(400).json({
                Error:validateResult.error.details[0].message
            })
        }

        const user = await User.findOne({ email: decode.email })
        if (!user) {
            const newUser = await User.create({
               fullName,
               gender,
               coverImage,
                email,
                address,
                phone,
                location:{lng:0,lat:0},
                verified:false,
                role:"user",
                
            });
            if (newUser) {
                const token = await User.findOne({email}) 
                return res.status(201).json({
                message: "Next of kin created successfully",
                token:token,
                role:newUser.role,
                email:newUser.email,
                verified:newUser.verified,
                });
            }
        }

       res.status(400).json({
        message:'Next of kin  already exist',
        Error:'Next of kin  already exist'
       })

     }catch(err){
        console.log(err)
        res.status(500).json({
            message:'Internal Server Error',
            Error: "/users/nextofkin/:signature"
        })
     }


}

