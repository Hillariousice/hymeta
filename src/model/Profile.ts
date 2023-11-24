import mongoose,{Schema} from "mongoose";



export interface IProfile{
    _id:string,
   verified:boolean,
   otp:number,
   userId:string,
   user:Schema.Types.ObjectId

}

const profileSchema = new Schema({
    verified:{type:Boolean},
    otp:{type:Number},
    userId:{type:String},
    user:{type:Schema.Types.ObjectId,ref:'users'}
    },{
     timestamps:true
    }
    )



const Profile =mongoose.model<IProfile>('profile',profileSchema)


export default Profile