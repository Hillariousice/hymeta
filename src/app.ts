import express from 'express'
import path from 'path'
import logger from 'morgan'
import  dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import {connectDB} from './config/db'
import usersRouter from './routes'




const app = express()
dotenv.config()
connectDB()


//middleware
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(express.static(path.join(process.cwd(),'./public')))


//Routes
 app.use('/users',usersRouter)



app.listen(process.env.PORT,()=>{console.log(`app running on ${process.env.PORT}`)})

export default app