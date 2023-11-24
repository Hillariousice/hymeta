import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcrypt'


export interface INext_of_kin{
    _id:string,
    fullName:string,
    email:string,
    phone:string,
    publicId:string,
    address: string,
    gender:string,
    lng:number,
    lat:number,
    coverImage:string,
    user:Schema.Types.ObjectId
}

const next_of_kinSchema = new Schema({
   fullName:{type:String},
   publicId:{type:String},
   email:{
    type:String,
     require:[true,'Please input your email'],
     unique:true
},
    phone:{type:String},
    address:{type:String},
    gender:{type:String},
    lng:{type:Number},
    lat:{type:Number},
    coverImage:{type:String},
    user:{type:Schema.Types.ObjectId,ref:'users'}

},{
    timestamps:true
}
)

const Next_of_kin =mongoose.model<INext_of_kin>('next_of_kin',next_of_kinSchema)

export default Next_of_kin