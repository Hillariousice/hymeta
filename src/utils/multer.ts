import multer from 'multer'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
const cloudinary = require('cloudinary').v2


cloudinary.config({
    cloud_name:"diuhshj6g",
    api_key:346231528185927,
    api_secret:"wtPQEjI93H9oekuJyuSlgMqLSkE"
})


const storage = new CloudinaryStorage({
    cloudinary,
    params: async(res,file)=>{
       return{
        folder:"HYMETA"
       }
    }
})


export const upload = multer({storage})