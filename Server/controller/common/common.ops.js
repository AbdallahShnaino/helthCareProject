const {adminExistwithID} = require('../../model/admin/admin.model')
const {doctorExistwithID} = require('../../model/doctor/doctor.model')
const {patientExistwithID} = require('../../model/patient/patient.model')


let getById = function (IdentityDocument) {

    doctorExistwithID(IdentityDocument).then(response => {
        if(response != false){

        }else{
         patientExistwithID(IdentityDocument).then((response)=>{
             if(response != false){
                }else{
                 adminExistwithID(IdentityDocument).then((response)=>{
                     if(response != false){
                        }else{
                         errors.message.push("Identity Document not found!")
                         return res.status(400).render('login/loginView' , errors)
                   
                        }
     
                 })


            
                }

         })
        }
    })




}