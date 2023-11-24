import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcrypt'


export interface IWallet{
    _id:string,
    userId:string,
    balance:number,
    currency:string,
    accountNumber:number,
    accountName:string,
    bankName:string,
    pin:string,
    salt:string ,
    user:Schema.Types.ObjectId


}

const walletSchema = new Schema({
    userId:{type:String},
    balance:{type:Number},
    currency:{type:String},
    accountNumber:{type:Number},
    accountName:{type:String},
    bankName:{type:String},
    pin:{type:String},
    salt:{type:String},
    user:{type:Schema.Types.ObjectId,ref:'users'}
},{
    timestamps:true
}
)


const Wallet =mongoose.model<IWallet>('wallets',walletSchema)


export default Wallet