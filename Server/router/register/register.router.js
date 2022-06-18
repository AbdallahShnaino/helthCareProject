const express = require('express')
const registerRouter = express.Router()
const {validation , registrationValidation} = require('../../controller/register/register.controller')
const {insertPatient,PatientExist} = require('../../model/patient/patient.model')
const {doctorExist, insertDoctor} = require('../../model/doctor/doctor.model')
const fs = require('fs');
const path = require('path');

let checkLogIn = function ( req , res , next) {
    let isLoggedin = req.user
    if( !isLoggedin ){

        res.status(401).render('noAccess')
    }

    next()
} 


registerRouter.get('/',(req , res)=>{
    res.status(200).render('register/registerView')
})

registerRouter.post('/',(req , res)=>{
    let errors = {message:[]}
    let user = {emailAddress:req.body.emailAddress,
        firstName:req.body.firstName,
        familyName:req.body.familyName,
        postion:req.body.postion,

}
    registrationValidation(errors , user)
    if (errors.message.length > 0) {
        return res.status(400).render("register/registerView",errors)
    }
    if (user.postion == "Doctor") {
        insertDoctor(user).then(()=>{
            res.status(200).render('register/done')
        })

    }
    if (user.postion == "Patient") {
        insertPatient(user).then(( )=>{
            res.status(200).render('register/done')
        })
    }

})

registerRouter.get('/complete-information',checkLogIn,(req , res)=>{

  //  console.log("/complete-information "+patient.emailAddress)
    res.status(200).render('register/complete')
})
registerRouter.post('/complete-information',(req , res)=>{
    let postion = req.body.postion
    let medicalDepartment = req.body.medicalDepartment
    let errors = {message:[],wornings:[]}
    validation(errors,postion,medicalDepartment)
    if (errors.message.length > 0){
        return res.status(400).render("register/complete",errors)
    }
 
  
    if (postion == "Patient"){
        let patient = {
            emailAddress: req.user.emailAddress,
            firstName: req.user.firstName,
            familyName:req.user.familyName,
            photo: req.user.photo,
            doctores: [],
            medicalPhotos: [],
            medicalVedios: [],
            isActive:false,
        }
        let isKnownPatient = undefined
        let isKnownDoctor = undefined

        PatientExist(patient).then( a=> {
            isKnownPatient = a
            doctorExist(patient).then( b=> {
                isKnownDoctor = b
                if (isKnownDoctor == false && isKnownPatient == false ) {
                    insertPatient(patient).then(res => {
                        res.status(200).redirect('/home')

                    })
               
                }else{
                    errors.wornings.push("We have known you before , Just Log in")
                    if (errors.wornings.length > 0){
                        return res.status(400).render("register/complete",errors)
                    }
                }
            })
        })
        

            
            console.log("patient **** new user")
            console.log("insert patient to database")

        }
    if ( postion == "Doctor"){
        let doctor = {
            emailAddress: req.user.emailAddress,
            firstName: req.user.firstName,
            familyName:req.user.familyName,
            photo: req.user.photo,
            patients: [],
            isActive:false,
        }
        console.log("doctor **** new user")

        let isKnownPatient = undefined
        let isKnownDoctor = undefined

        PatientExist(doctor).then( a=> {
            isKnownPatient = a
            doctorExist(doctor).then( b=> {
                isKnownDoctor = b
                if (isKnownDoctor == false && isKnownPatient == false ) {
                    insertDoctor(doctor).then(res =>
                    {

                        res.status(200).redirect('/home')
                    })
                 
                }else{
                    errors.wornings.push("We have known you before , Just Log in")
                    if (errors.wornings.length > 0){
                        return res.status(400).render("register/complete",errors)
                    }
                }
            })
        })
        
    }
    

    
    
    //  res.status(200).json({data: req.body })
})



async function createFolder (n = "patient",emailAddress) {
   const folderName = path.join(__dirname , "../../doc/",n,"/",emailAddress)
   const img = folderName + "/img"
   const reports = folderName + "/reports"
   const vedios =  folderName + "/vedios"
   try {
     if (!fs.existsSync(folderName)) {
       fs.mkdirSync(folderName);
     }

     if (!fs.existsSync(img)) {
        fs.mkdirSync(img);
      }
      if (!fs.existsSync(reports)) {
        fs.mkdirSync(reports);
      }
      if (!fs.existsSync(vedios)) {
        fs.mkdirSync(vedios);
      }
   } catch (err) {
     console.error(err);
   }
 }
 
/*


const express = require('express')
const path = require('path')
const registerRouter = express.Router()
const bodyParser = require('body-parser')
const parser = bodyParser.urlencoded({ extended: true })

const {addNewPatient , addNewDoctor ,registrationValidation } = require("../../controller/register/register.controller")
const {uploadPersonalImage} = require('../../controller/register/register.controller')


registerRouter.get('/' , ( req  ,res )=>{
    res.status(200).render('register')
})
/// ,uploadPersonalImage().single("personalImage") 
registerRouter.post('/test' , (req , res)=>{
    console.log(req.body)

   //  addNewPatient({email:"aa@aa"})
   return res.status(200).json({success:"done"})
})
registerRouter.post('/'  ,parser,( req  ,res )=>{
    let errors = {message:[]}
    console.log(req.body)
 //   const imgPath = req.file.filename
 //   const fPath = path.join(__dirname , "/../../images/patientImages/presonalImages/"+imgPath)


        const emailAddress = req.body.email
        const firstName = req.body.firstName
        const fatherName = req.body.fatherName
        const familyName = req.body.familyName
        const nationalNumber = req.body.nationalNumber
        const dateOfBirth = new Date(req.body.date+'T03:24:00')
        const phoneNumber = req.body.phoneNumber
        const postion = req.body.postion
        const medicalDepartment = req.body.medicalDepartment
        const testDateTime = req.body.testDateTime

        

        const user = {
            emailAddress: emailAddress,
            firstName: firstName,
            fatherName: fatherName,
            familyName: familyName,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
            postion:postion,
            nationalNumber: nationalNumber,
            medicalDepartment:medicalDepartment,
            isActive:false,
            timeOfRegistration:testDateTime,
        }
        console.log("logging  emailAddress "+emailAddress)
        console.log("logging  firstName "+firstName)
        console.log("logging  fatherName "+fatherName)
        console.log("logging   familyName "+familyName)
        console.log("logging   nationalNumber "+nationalNumber)
        console.log("logging   dateOfBirth "+dateOfBirth)
        console.log("logging   phoneNumber "+phoneNumber)
        console.log("logging   postion "+postion)
        console.log("logging   medicalDepartment "+medicalDepartment)


        registrationValidation( errors , user)

        if (errors.message.length > 0){
            return res.status(400).render("register",errors)
        }

        if ( postion === "Patient") {
            console.log("Patient user type ")
            try{
                addNewPatient(errors , user).then(()=>{
                    if ( errors.message.length > 0){          
                        return res.status(400).render("register",errors)
                    }else{
                        return res.status(200).render("home",user)
                    }

                  })

            }catch(e){
                errors.message.push(e.message)
                return res.status(400).render("register",errors)
            }
        }

        if ( postion === "Doctor") {
            console.log("Doctor user type ")
            try{
                addNewDoctor(errors , user).then((result)=>{
                    if (result == true){
                        console.log("error the email foumd try with mew one")
                            return res.status(400).render("register",errors)
                        
                    }
                    
                    if (result == false){
                        console.log("the email not foumd you are new user")
                        return res.status(200).render("home",user)
                          
                    }

                  })

            }catch(e){
                errors.message.push(e.message)
                return res.status(400).render("register",errors)
            }
        }


    
  


        
      //  if ( errors.message.length > 0 ) {
     //       return  res.status(400).render('register' ,errors)
     //   }
       
             return  res.status(200)
  

  

        



 /* 
    const errors = {message:[]} 
    const imgPath = req.file.filename
    const p = path.join(__dirname , "/../../images/patientImages/presonalImages/"+imgPath)
    console.log(p)
    res.status(200).send()
 */
  //  res.status(200).json({success:req.body})
//} , (error , req , res , next)=>{
    //  const errors = {message:[]} 
    // errors.message.push(error.message)
    //   res.status(400).json(errors)
  // })
   /* 
   
       emailAddress:req.body.emailAddress,
           firstName:req.body.firstName,
           fatherName:req.body.fatherName,
           familyName:req.body.familyName,
           nationalNumber:req.body.nationalNumber,
           dateOfBirth:req.body.dateOfBirth,
           personalImage:req.body.personalImage,
           id:req.body.id,
           phoneNumber:req.body.phoneNumber,
           postion:req.body.postion,      
   */
   
   module.exports = registerRouter
