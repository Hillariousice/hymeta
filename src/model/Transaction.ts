import mongoose,{Schema} from "mongoose";



export interface ITransaction{
    _id:string,
    refId:string,
    paymentGateway:string,
    user:Schema.Types.ObjectId
}

const transactionSchema = new Schema({
    refId:{type:String},
    paymentGateway:{type:String},
    user:{type:Schema.Types.ObjectId,ref:'users'}
},{
    timestamps:true
}
)


const Transaction =mongoose.model<ITransaction>('transactions',transactionSchema)


export default Transaction