import express from 'express'
import {  getAllUsers, Login, Register, userDelete, userGet, userUpdate,VerifyUser,ResendOTP } from '../controllers/users'
import { auth,  } from '../middleware/auth'
import { upload } from '../utils/multer'
import { checkBalance, createWallet, fundWallet,getUserWallet,initCredit,transfer } from '../controllers/wallet'
const router = express.Router()


router.post('/signup',Register)
router.post('/login',Login)

router.get('/get-all-users', auth, getAllUsers)
router.get('/get-all-user/:_id',auth, userGet)

router.patch('/updateUser/:_id',auth,upload.single('coverImage'),userUpdate)
router.delete('/deleteUser/:_id',auth,userDelete)

router.post("/verify/:signature", VerifyUser);
router.get("/resend-otp/:signature", ResendOTP);

router.post('/wallet',auth,createWallet)
router.get('/wallet/balance',auth,checkBalance)
router.get('/wallet/:signature',auth,getUserWallet)
router.get('/wallet/init-credit',auth,initCredit)
router.post('/wallet/fund/:signature',auth,fundWallet)
router.post('/wallet/transfer/:signature',auth,transfer)



export default router