const express = require('express')
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const helmet = require('helmet')
const passport = require('passport')
const {Strategy} = require('passport-google-oauth20')
const cookieSession = require('cookie-session')




require('dotenv').config()
const hbs = require('hbs')
const app = express()
const mongdb = require('mongodb')
const POST = 8080
const database = "healthCare";
const connectionURL = 
process.env.mongoDBURL +
  database +
  "?retryWrites=true&w=majority";
  mongoose.connect(connectionURL)

const clientDirPath = path.join(__dirname , '../Client')
const PartialsDirPath = path.join(__dirname , '/view/partials')
const viewDirPath = path.join(__dirname , '/view')

// settings
app.use(helmet())

// google verification 

const config = {
    ClientId:process.env.ClientId,
    ClientSecret:process.env.ClientSecret,
    CookieKey1:process.env.CookieKey1,
    CookieKey2:process.env.CookieKey2,
}

const AUTH_OPTIONS = {
    callbackURL:"/auth/google/collback",
    clientID:config.ClientId,
    clientSecret:config.ClientSecret,
}
function verifyCallback (accessToken , refreshToken , profile , done ) {

    done(null , profile)
}
passport.use(new Strategy(
    AUTH_OPTIONS,
    verifyCallback
))
app.use(cookieSession({
    name:"session",
    maxAge:24*60*60*1000,
    keys:[config.CookieKey1,config.CookieKey2]
}))

passport.serializeUser((user , done)=>{
    let userData = {
        firstName:user.name.givenName,
        familyName:user.name.familyName,
        emailAddress:user.emails[0].value,
        photo:user.photos[0].value,
    }
    // add new user to db if he is not exist
    // if exist let him inter put match the data with the data in db in home page
    console.log("serializeUser "+userData)
    done(null , userData)
})
passport.deserializeUser((obj , done)=>{
    // applay find op
    console.log("deserializeUser firstName",obj.firstName)
    console.log("familyName",obj.familyName)
    console.log("email",obj.emailAddress)
    console.log("photo",obj.photo)
    console.log("obj  ",obj)
    done(null , obj)
})


app.use(express.static(clientDirPath))
app.set('view engine','hbs')
app.set('views',viewDirPath)

app.use(passport.initialize())
app.use(passport.session())
app.use( (req , res , next) => {
    const start = Date.now();
    next()
    let time = Date.now() - start;
    console.log(`url : ${req.baseUrl}${req.url} method : ${req.method} time : ${time}`)
} )




app.get("/auth/google" , passport.authenticate("google" ,  {
    scope:["email" , "profile"]
}))

app.get("/auth/google/collback" , passport.authenticate("google" , {
    failureRedirect:"/failure",
    successRedirect:"/register/complete-information",
    session:true,

}) , (req , res)=>{
    console.log("google coled us back")
})


app.get("/auth/logout" , (req , res)=>{
        req.session = null
        req.logOut()
        return res.status(200).redirect('/login')
})

app.get("/failure" , (req , res)=>{
    res.send("fail to login")
})


// import
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let loginRouter = require('./router/login/login.router')
let registerRoute = require('./router/register/register.router')
let homeRouter = require('./router/home/home.router')
let adminRouter = require('./router/admin/admin.router')
let doctorRouter = require('./router/doctor/doctor.router')
let patientRouter = require('./router/patient/patient.router')
app.use('/login' , loginRouter)
app.use('/register' , registerRoute)
app.use('/home' , homeRouter)
app.use('/admin' , adminRouter)
app.use('/doctor' , doctorRouter)
app.use('/patient' , patientRouter)
app.get('/',(req,res)=>{
    return res.status(200).redirect('/login')
})
let startServer = async function () {
    mongoose.connection.once('open',()=>{
        console.log("DB Connection OK")
    })
    mongoose.connection.on('error',()=>{
        console.log("Faild to connection with DB")
    })
    app.listen(POST , ()=>{
       console.log("server start listning ....")
   })
}
startServer()
