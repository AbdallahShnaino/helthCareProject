const express = require('express')
const homeRouter = express.Router()
const {doctorExistwithID , doctorExistwithEmail} = require('../../model/doctor/doctor.model')
const {patientExistwithID ,patientExistwith_ID, patientExistwithEmail} = require('../../model/patient/patient.model')
const {adminExistwithID,adminExistwithEmail} = require('../../model/admin/admin.model')
const Patient = require('../../model/patient/patient.schema')
const Doctor = require('../../model/doctor/doctor.schema')
const Admin = require('../../model/admin/admin.schema')

let user = {}




let checkLogIn = function ( req , res , next) {
    let isLoggedin = req.user
    if (isLoggedin || req.session.id){
        next()
    }else{
        res.status(401).render('noAccess')
    }


} 


homeRouter.get("/"  ,async  (req, res )=>{



        let doctor = await Doctor.findOne({identity:req.query.id})
        let patient = await Patient.findOne({identity:req.query.id})
        let admin = await Admin.findOne({identity:req.query.id})
        console.log("admin obj -> "+admin)
         if (doctor){
            user = doctor
           return res.status(200).redirect('/doctor?id=' +user.identity)
        }
        if (patient){
            user = patient
            return res.status(200).redirect('/patient?id='+user.identity)
        }
        if (admin){
            user = admin
            return res.status(200).redirect('/home/admin?id='+user.identity)
        }

    
})



// admin start here
homeRouter.get( '/admin' , async (req , res)=>{
    let id = req.query.id 
    let admin = await Admin.findOne({identity:id})
    if (admin){
       return res.status(200).render('home/admin/',{
            photo:admin.photo,
            emailAddress:admin.emailAddress,
            firstName:admin.firstName,
            familyName:admin.familyName,
            createdAt:admin.createdAt,
            updatedAt:admin.updatedAt,
            
        }
        )

    }

})

homeRouter.get('/admin/viewPatientData' , (req , res)=> {
        res.redirect('/admin/patient/view')
})
homeRouter.get('/admin/updatePatientData' , (req , res)=> {
    res.redirect('/admin/patient/update')
})
homeRouter.get('/patient/req/view' , (req , res)=> {
    res.redirect('/admin/doctor/view')
})


homeRouter.get('/admin/viewDoctorData' , (req , res)=> {
    res.redirect('/admin/doctor/view')
})
homeRouter.get('/admin/updateDoctorData' , (req , res)=> {
    res.redirect('/admin/doctor/update')
})
homeRouter.get('/doctor/req/view' , (req , res)=> {
    res.redirect('/admin/doctor/view')
})


module.exports = homeRouter