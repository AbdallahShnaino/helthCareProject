
const express = require('express')
const {doctorExistwithID} = require('../../model/doctor/doctor.model')
const {patientExistwithID} = require('../../model/patient/patient.model')
const {adminExistwithID} = require('../../model/admin/admin.model')
const Doctor = require('../../model/doctor/doctor.schema')
const Patient = require('../../model/patient/patient.schema')
const Admin = require('../../model/admin/admin.schema')
const loginRouter = express.Router()
loginRouter.get('/' , (req , res)=>{
    res.status(200).render('login/loginView')
})

loginRouter.post('/' , async (req , res)=>{
    const IdentityDocument = req.body.IdentityDocument
    let errors = {message:[]}
    if (!IdentityDocument){

        errors.message.push("Identity Document must not be empty")
        return res.status(400).render('login/loginView' , errors)
    }
    if(IdentityDocument.length == 10){
        console.log("********* *********** *********")
        let doctor = await Doctor.findOne({identity:IdentityDocument})
        let patient = await Patient.findOne({identity:IdentityDocument})
        let admin = await Admin.findOne({identity:IdentityDocument})
        if (doctor){
            return res.redirect('/home?id='+doctor.identity)
        }
        else if (patient){
            return res.redirect('/home?id='+patient.identity)
        }
        else if (admin){
            console.log("admin infoo -> "+admin.identity)
            return res.redirect('/home?id='+admin.identity)
        }
        else {
            return res.status(400).render('login/loginView' , errors)
        }


    }else{
    
        errors.message.push("Identity Document must be 10 characters")
        return res.status(400).render('login/loginView' , errors)
    }

})

module.exports = loginRouter