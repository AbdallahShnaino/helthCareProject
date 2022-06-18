const express = require('express')
const adminRouter = express.Router()
const Patient = require('../../model/patient/patient.schema')
const Doctors = require('../../model/doctor/doctor.schema')
const Appointment = require('../../model/appointment/appointment.schema')
const {patientExistwith_ID} = require('../../model/patient/patient.model')
const {getDocs} = require("../../model/docs/docs.model")
const Doc = require('../../model/docs/docs.schema')
const e = require('express')
let sendEmail = require('../../controller/mail/mail.controller')
adminRouter.get('/patient/view' , pagenator(Patient) , async (req, res)=>{

    let patients = await Patient.find({})
    let data = {
      results:[]
    }
    for (let p of patients){
      if (p){
        let container = {
          identity:p.identity,
          emailAddress:p.emailAddress,
          firstName:p.firstName,
          familyName:p.familyName,
          doctors:[],
          isActive:p.isActive,
          docs:[],
        }
        try{
            for (let patient of p.doctores){
                try{
                    let result = await Doctors.findOne({identity:patient.doctorId})
                    if (result){
                        let name =result.firstName + " "+ result.familyName
                        container.doctors.push(name)
                    }
                }catch(e){}
            }
            let docs = await getDocs(container.identity)
            for (let doc of docs){
                container.docs.push({name:doc.name , url:doc.url})
            }
            console.log("******************** " , docs)
        }catch(e){}
        data.results.push(container)
        
        
    }
} 
console.log("-------------- " , data)
 


res.status(200).render('patient/view' , {
    patientsData:data,
    })

})
// /admin/update/patient/
adminRouter.get("/update/patient/"  , async (request , response)=>{
    let id = request.query.id
    let newEmailAddress = request.query.newEmailAddress
    let newIdentity = request.query.newIdentity
    let newFamilyName = request.query.newFamilyName
    let newFirtName = request.query.newFirtName
    let isActive =  request.query.isActive
    let deleteList = request.query.deleteList
    let addList = request.query.addList


    if (addList && addList.length > 0) {
        let data = []
        let d = await Patient.findOne({identity:id})
        let array =  d.doctores
        for (let i of array){
            data.push(i)
        }
        let bool = Array.isArray(addList)
        if (bool){
            for (let add of addList){
                let obj = {
                    doctorId:add,
                    adminAcceptance:true,
                    doctorAcceptance:false,
                }
                data.push(obj)
            }      
        }else{
            let obj = {
                doctorId:addList,
                adminAcceptance:true,
                doctorAcceptance:false,
            }
            data.push(obj)
        }
       await Patient.updateOne({identity:id} , {$set:{doctores:data}})
  //   await Doctors.updateOne({identity:id} , {$set:{patients:array, }})
}

    if (deleteList && deleteList.length > 0) {
        let a = "" 
        if (id) {
         a = id
         }else{
             a = newIdentity
         }
       let d = await Patient.findOne({identity:a})
       let array =  d.doctores
       for (let i of array){

        let bool = Array.isArray(deleteList);  // true
        console.log("equal ..  %%%%%%%%%%%%% " , array)

           if (bool){
               for (let patient of deleteList){
                    if (patient == i.doctorId){
                        array = array.filter(function(el) { return el.doctorId != patient; }); 

                    }
                    
               }
           }else{
            array = array.filter(function(el) { return el.doctorId != deleteList; }); 

            /* 
                if (i.doctorId == deleteList){
                    console.log("equal ..  &&&&&&&&&&&&&&&&& ")
                    array.splice(i)
                }     
            */
               
           }
       }
       console.log(" ............. " , array)

    await Patient.updateOne({identity:a} , {$set:{doctores:array, }})

       }



    if (isActive == "0"){ isActive = false}
    if (isActive == "1"){ isActive = true}
    if (newIdentity != ""){
        await Patient.updateOne({identity:id} , {$set:{identity:newIdentity, }})
    }
    if (newEmailAddress != ""){
        await Patient.updateOne({identity:id} , {$set:{emailAddress:newEmailAddress, }})
    }

    if (newFirtName != ""){
        await Patient.updateOne({identity:id} , {$set:{firstName:newFirtName, }})
    }
    if (newFamilyName != ""){
        await Patient.updateOne({identity:id} , {$set:{familyName:newFamilyName, }})
    }

    if (isActive == true || isActive == false){
        await Patient.updateOne({identity:id} , {$set:{isActive:isActive }})
    }
    let curser = await Patient.findOne({identity:id})
    let to = curser.emailAddress
        let subject = "Notification of changing account information"
        let text = "We inform you that the administrator has modified your data. For more information, we hope to review your accoun"
        sendEmail( to,subject,text ).then(()=>{
			console.log('the email was sent')
            return response.status(200).redirect('/admin/patient/update')
        })

}
    
    )
adminRouter.get('/patient/update' ,async (req, res)=>{
    console.log(req.query)
    if (req.query.updateId){
        let id = req.query.updateId
        let doctor = await Patient.findOne({emailAddress:id})
        let obj = {
            identity:doctor.identity,
            emailAddress:doctor.emailAddress,
            firstName:doctor.firstName,
            familyName:doctor.familyName,
            doctors:[],
            isActive:doctor.isActive
        }
        for (let d of doctor.doctores){
            let p = await Doctors.findOne({identity:d.doctorId})
            if (p){
                let name = p.firstName +" "+p.familyName
            let identity = p.identity
            let cons = {
                name:name,
                identity:identity,
            }
            obj.doctors.push(cons)
            }
        }
        let docs = await Doc.find({owner:obj.identity})
        let documents = []
        for (let doc of docs){
            let id = doc._id
            let name = doc.name
            let url = doc.url
            let obj = {
                id:id,
                name:name,
                url:url,
            }
            documents.push(obj)

        }
        console.log(" .... ",docs)
        let patients = await Doctors.find({})
        return res.status(200).render('patient/updateId' , {
            patient:obj,
            doctors:patients,
            documents:documents,
        })
        } else if (req.query.deleteId){
        let id = req.query.deleteId
        await Patient.deleteOne({emailAddress:id})
   //     await Doc.deleteMany({owner:id})
        let to = id
        console.log("to ====== " , to)
        let subject = "Notification of account cancellation"
        let text = "We inform you that your account has been deleted for certain reasons. We apologize"
        sendEmail( to,subject,text ).then(()=>{
            console.log('the email was sent')
            return res.status(200).redirect('/admin/patient/update')
        })
    }else  if ( req.query.deleteDoc){
        console.log(deleteDoc , " uuuuuuuuuuuuuuuuu ")
       await Doc.deleteOne({_id:deleteDoc})
       return res.status(200).redirect("/admin/patient/update")
    }else{
        let patients = await Patient.find({})
        let data = []
        for (let p of patients){
            if (p){
              let container = {
                identity:p.identity,
                emailAddress:p.emailAddress,
                firstName:p.firstName,
                familyName:p.familyName,
                doctores:[],
                isActive:p.isActive,
                docs:[],
              }
                  try{
                      for (let doctore of p.doctores){
                          try{
                              let result = await Doctors.findOne({identity:doctore.doctorId})
                              if (result){
                                  let name = result.firstName + " "+ result.familyName
                                  container.doctores.push(name)
                                  console.log(name , " ;;;;;;;;;;;;;")
                              }
                          }catch(e){}
                      }
                      let docs = await getDocs(container.identity)
                      for (let doc of docs){
                          container.docs.push({name:doc.name , url:doc.url})
                      }
                  }catch(e){}
                  data.push(container)
              
              
              
          }
      } 
    
       return res.status(200).render('patient/update' , {
            doctorData:data,
        })

    }

})


adminRouter.get('/doctor/view' ,async (req, res)=>{

    let doctors = await Doctors.find({})
    console.log("container " , doctors)
    let data = {
      results:[]
    }
    for (let p of doctors){
      if (p){
        let container = {
          identity:p.identity,
          emailAddress:p.emailAddress,
          firstName:p.firstName,
          familyName:p.familyName,
          patients:[],
          isActive:p.isActive,
          docs:[],
        }
        try{
            for (let patient of p.patients){
                try{
                    let result = await Patient.findOne({identity:patient.patientId})
                    if (result){
                        console.log("container " , container)
                        let name =result.firstName + " "+ result.familyName
                        console.log("////// " , name)
                        container.patients.push(name)
                    }
                }catch(e){}
            }
            let docs = await getDocs(container.identity)
            for (let doc of docs){
                container.docs.push({name:doc.name , url:doc.url})
            }
            console.log("container " , container)
            console.log("docs ..... + ",data.results)
        }catch(e){}
        data.results.push(container)
        
        
    }
} 
console.log("-------------- " , data)
 


    res.status(200).render('doctor/view' , {
        patientsData:data,
    })
})

adminRouter.get('/doctor/req/view' , async (req , res)=>{
    let acceptedId = req.query.acceptedId
    let rejectedId = req.query.rejectedId
    let generatedId = Math.floor(Math.random() * 10000000000)
    if (acceptedId){
        await Doctors.updateOne({ emailAddress: req.query.acceptedId } , {
            $set: {
                isActive: true,
                identity:generatedId,
            }
        })

        let to = acceptedId
        let subject = "Notice of approval to join the system"
        let text = "We inform you that the official has accepted the request to join. You can enter the system with the ID: "+generatedId
        sendEmail( to,subject,text ).then(()=>{
			console.log('the email was sent')
        })

      //  sendEmail("we accepted you")
    }else if (rejectedId){
        await  Doctors.deleteOne({ identity: rejectedId })
        console.log("deleted scc .. " , rejectedId)
        let to = rejectedId
        let subject = "Refused to join the system"
        let text = "Your request to join the system has been rejected for special reasons. Please understand and apologize"
        sendEmail( to,subject,text ).then(()=>{
			console.log('the email was sent')
        })
    }
    let doctors = await Doctors.find({})
    let data = {
      results:[]
    }
    for (let p of doctors){
      if (p){
        let container = {
          identity:p.identity,
          emailAddress:p.emailAddress,
          firstName:p.firstName,
          familyName:p.familyName,
          patients:[],
          isActive:p.isActive,
          docs:[],
        }
        if (!container.isActive){
            try{
                for (let patient of p.patients){
                    try{
                        let result = await Patient.findOne({identity:patient.patientId})
                        if (result){
                            let name = result.firstName + " "+ result.familyName
                            container.patients.push(name)
                            console.log(name , " ;;;;;;;;;;;;;")
                        }
                    }catch(e){}
                }
                let docs = await getDocs(container.identity)
                for (let doc of docs){
                    container.docs.push({name:doc.name , url:doc.url})
                }
            }catch(e){}
            data.results.push(container)
        }
        
        
    }
} 
 

res.status(200).render('doctor/req' , {
    patientsData:data,
    })
})



adminRouter.get('/update/doctor/' ,  async (request,response)=>{
    console.log("************************")
    let id = request.query.id
    let newEmailAddress = request.query.newEmailAddress
    let newIdentity = request.query.newIdentity
    let newFamilyName = request.query.newFamilyName
    let newFirtName = request.query.newFirtName
    let isActive =  request.query.isActive
    let deleteList = request.query.deleteList
    let addList = request.query.addList

    if (addList && addList.length > 0) {
        let data = []
        let d = await Doctors.findOne({identity:id})
        let array =  d.patients
        for (let i of array){
            data.push(i)
        }
        let bool = Array.isArray(addList)
        if (bool){
            for (let add of addList){
                let obj = {
                    patientId:add,
                    adminAcceptance:true,
                    doctorAcceptance:false,
                }
                data.push(obj)
            }      
        }else{
            let obj = {
                patientId:addList,
                adminAcceptance:true,
                doctorAcceptance:false,
            }
            data.push(obj)
        }
       await Doctors.updateOne({identity:id} , {$set:{patients:data}})
        console.log(" ............. " , array)

  //   await Doctors.updateOne({identity:id} , {$set:{patients:array, }})
}

    if (deleteList && deleteList.length > 0) {
       let d = await Doctors.findOne({identity:id})
       let array =  d.patients
       for (let i of array){
        let bool = Array.isArray(deleteList);  // true

           if (bool){
               for (let patient of deleteList){
                if (i.patientId == patient){
                    console.log("equal ..  &&&&&&&&&&&&&&&&& ")
                    array.splice(i)
                }
                    console.log(i.patientId , " &&&&&&&&&&&&&&&&& " , deleteList)           
               }
           }else{

                if (i.patientId == deleteList){
                    console.log("equal ..  &&&&&&&&&&&&&&&&& ")
                    array.splice(i)
                }
                    console.log(i.patientId , " &&&&&&&&&&&&&&&&& " , deleteList)           
               
           }
       }
       console.log(" ............. " , array)
    await Doctors.updateOne({identity:id} , {$set:{patients:array, }})

       }



    if (isActive == "0"){ isActive = false}
    if (isActive == "1"){ isActive = true}
    if (newIdentity != ""){
        await Doctors.updateOne({identity:id} , {$set:{identity:newIdentity, }})
    }
    if (newEmailAddress != ""){
        await Doctors.updateOne({identity:id} , {$set:{emailAddress:newEmailAddress, }})
    }

    if (newFirtName != ""){
        await Doctors.updateOne({identity:id} , {$set:{firstName:newFirtName, }})
    }
    if (newFamilyName != ""){
        await Doctors.updateOne({identity:id} , {$set:{familyName:newFamilyName, }})
    }

    if (isActive == true || isActive == false){
        await Doctors.updateOne({identity:id} , {$set:{isActive:isActive }})
    }

    let doctorData = await Doctors.findOne({identity:id})
    let to = doctorData.emailAddress
    let subject = "Amendment to account information"
    let text = "Your account information has been modified. For more information, please review your account"
    sendEmail( to,subject,text ).then(()=>{
        console.log('the email was sent')
        return response.status(200).redirect('/admin/doctor/update')
    })
} )
adminRouter.get('/doctor/update' ,async (req, res)=>{
    console.log(req.query)
    if (req.query.updateId){
        let id = req.query.updateId
        console.log(id)
        let doctor = await Doctors.findOne({identity:id})
        let obj = {
            identity:doctor.identity,
            emailAddress:doctor.emailAddress,
            firstName:doctor.firstName,
            familyName:doctor.familyName,
            patients:[],
            isActive:doctor.isActive
        }
        for (let d of doctor.patients){
            console.log(d.patientId)
            let p = await Patient.findOne({identity:d.patientId})
            if (p){
                let name = p.firstName +" "+p.familyName
            let identity = p.identity
            let cons = {
                name:name,
                identity:identity,
            }
            obj.patients.push(cons)
            }
        }
        let patients = await Patient.find({})
        console.log(patients)
        return res.status(200).render('doctor/updateId' , {
            doctor:obj,
            patients,patients,
        })
        }
    if (req.query.deleteId){
        let id = req.query.deleteId

        let r = await Doctors.find({identity:id})
        let to = r.emailAddress
        await Doctors.deleteOne({identity:id})
        let subject = "Notification of account cancellation"
        let text = "We inform you that your account has been deleted for certain reasons. We apologize"
        sendEmail( to,subject,text ).then(()=>{
			console.log('the email was sent')
            return res.status(200).redirect('/admin/doctor/update')
        })

    }
    let doctors = await Doctors.find({})
    let data = []
    for (let p of doctors){
        if (p){
          let container = {
            identity:p.identity,
            emailAddress:p.emailAddress,
            firstName:p.firstName,
            familyName:p.familyName,
            patients:[],
            isActive:p.isActive,
            docs:[],
          }
              try{
                  for (let patient of p.patients){
                      try{
                          let result = await Patient.findOne({identity:patient.patientId})
                          if (result){
                              let name = result.firstName + " "+ result.familyName
                              container.patients.push(name)
                              console.log(name , " ;;;;;;;;;;;;;")
                          }
                      }catch(e){}
                  }
                  let docs = await getDocs(container.identity)
                  for (let doc of docs){
                      container.docs.push({name:doc.name , url:doc.url})
                  }
              }catch(e){}
              data.push(container)
          
          
          
      }
  } 

  return  res.status(200).render('doctor/update' , {
        patientsData:data,
    })
})



adminRouter.get('/patient/req/view' , async (req , res)=>{
    let acceptedId = req.query.acceptedId
    let rejectedId = req.query.rejectedId
    if (acceptedId){
        let generatedId = Math.floor(Math.random() * 10000000000)
        await Patient.updateOne({ emailAddress: req.query.acceptedId } , {
            $set: {
                isActive: true,
                identity:generatedId,
            }
        })

        let to = acceptedId
        let subject = "Notice of approval to join the system"
        let text = "We inform you that the official has accepted the request to join. You can enter the system with the ID: "+generatedId
        sendEmail( to,subject,text ).then(()=>{
			console.log('the email was sent')
        })

      //  sendEmail("we accepted you")
    }else if (rejectedId){
        await  Patient.deleteOne({ emailAddress: rejectedId })
        console.log("deleted scc .. " , rejectedId)
        let to = rejectedId
        let subject = "Notification of account rejection"
        let text = "We inform you that your order has been rejected for certain reasons. We apologize"
        sendEmail( to,subject,text ).then(()=>{
			console.log('the email was sent')
        })
         //  sendEmail("we rejected you")

    }
    if (req.query.acceptedAppointmentId){
        let id = req.query.acceptedAppointmentId
            await Appointment.updateOne({_id:id} ,{$set:{adminAccept:true}})
              console.log("appointment accepted")
              let appoi = await Appointment.findOne({_id:id})
              let doctorId = appoi.doctor
              let patientId = appoi.patient
              let doctor = await Doctors.findOne({identity:doctorId})
              let patient = await Patient.findOne({identity:patientId})
              let to1 = doctor.emailAddress
              let to2 = patient.emailAddress
              if (appoi.doctorAccept == false){
    
                  let subject1 = "The official approved the appointment"
                  let text1 ="We inform you that the system administrator has agreed to the appointment to be held in "+appoi.date+", but the doctor has not yet agreed, and you can write to him via the following mail"+ to1 +" so that the appointment is finally approved ."

                  let subject2 = "A new appointment needs your approval"
                  let text2 ="The system administrator has approved in the requested date "+appoi.date+" , but it needs your approval. Kindly visit your account to continue"
                  sendEmail( to2,subject1,text1 ).then(()=>{
                      console.log('the email was sent')
                      sendEmail( to1,subject2,text2 ).then(()=>{
                        console.log('the email was sent')
                        return res.status(200).redirect('/admin/patient/req/view')
                      })
                    
                    })
              }else{
                  // to doctor
                let subject1 = "An appointment has been made"
                let text1 ="An appointment was made with the patient "+patient.firstName+" "+patient.familyName+" in "+appoi.date
                let text2 ="An appointment was made with the doctor "+doctor.firstName+" "+doctor.familyName+" in "+appoi.date

                sendEmail( to1,subject1,text1 ).then(()=>{
                    console.log('the email was sent')
                    sendEmail( to2,subject1,text2 ).then(()=>{
                      console.log('the email was sent')
                      return res.status(200).redirect('/admin/patient/req/view')
                    })
                  
                  })

              }


        }
    if (req.query.rejectedAppointmentId){
        let id = req.query.rejectedAppointmentId
        console.log("appointment deleted")
        
        
        let appoi = await Appointment.findOne({_id:id})
        await Appointment.deleteOne({_id:id})
console.log("aaa " , appoi)
        let doctorId = appoi.doctor
        let patientId = appoi.patient
        let doctor = await Doctors.findOne({identity:doctorId})
        let patient = await Patient.findOne({identity:patientId})
        let to1 = doctor.emailAddress
        let to2 = patient.emailAddress
        if (appoi.doctorAccept == false){
            let subject = "The appointment contract has been rejected"
            // tp oatient
            let text1 ="The appointment contract has been rejected. You can request another appointment at another time. We apologize and ask for your understanding"
            // to doctor
            let text2 ="The appointment contract was rejected for special reasons. If you have an objection, you can write to us"
            sendEmail( to2,subject,text1 ).then(()=>{
                console.log('the email was sent')
                sendEmail( to1,subject,text2 ).then(()=>{
                  console.log('the email was sent')
                  return res.status(200).redirect('/admin/patient/req/view')
                })
              
              })
        }



        return res.status(200).redirect('/admin/patient/req/view')
    }

    let patients = await Patient.find({})
    let data = {
      results:[]
    }
    for (let p of patients){
      if (p){
        let container = {
          identity:p.identity,
          emailAddress:p.emailAddress,
          firstName:p.firstName,
          familyName:p.familyName,
          doctors:[],
          isActive:p.isActive,
          docs:[],
        }
        if (!container.isActive){
            try{
                for (let patient of p.doctores){
                    try{
                        let result = await Doctors.findOne({identity:patient.doctorId})
                        if (result){
                            let name =result.firstName + " "+ result.familyName
                            container.doctors.push(name)
                        }
                    }catch(e){}
                }
                let docs = await getDocs(container.identity)
                for (let doc of docs){
                    container.docs.push({name:doc.name , url:doc.url})
                }
            }catch(e){}
            data.results.push(container)
        }
        
        
    }
} 
let appointments = await Appointment.find({})
let appointmentsCollection = []
for (let app of appointments){
    if (!app.adminAccept){
        let obj = {
            id:app._id,
            date:app.date,
            doctor:"",
            patient:"",
        }
        let doctor = await Doctors.findOne({identity:app.doctor})
        if (doctor){
            obj.doctor = doctor.firstName +" "+doctor.familyName
        }
        let patient = await Patient.findOne({identity:app.patient})
        if (patient){
            obj.patient = patient.firstName +" "+patient.familyName
        }
        appointmentsCollection.push(obj)

    }
}

let doctors = await Doctors.find({})
let followersData = []
for (let doctor of doctors){
    let doctorId = doctor.identity
    let doctorName = doctor.firstName + " " + doctor.familyName
    let doctorStatus = doctor.isActive

    let patients = doctor.patients
    for (let patient of patients){
    try{
        if (patient.adminAcceptance == false){
            let patientId = patient.patientId
            let curser = await Patient.findOne({identity:patientId})
            let patientName = curser.firstName + " "+ curser.familyName
            let patientStatus = curser.isActive
     
        let obj =  {
            doctorId:doctorId,
            patientId:patientId,
            doctorName:doctorName,
            patientName:patientName,
            doctorStatus:doctorStatus,
            patientStatus:patientStatus,
        }
        followersData.push(obj) 
        }
    }catch(e){}
   }

}

if (req.query.acceptedPatientId) {
    let patientId = req.query.acceptedPatientId
    let doctorId = req.query.doctorId
    let the_doctor = await Doctors.findOne({identity:doctorId})
    let temp = []
    for (let pa of the_doctor.patients){
        temp.push(pa)
    }
    let a = undefined
    for (let i of temp){
       if ( i.patientId == patientId){
           i.adminAcceptance = true
           a = i.doctorAccept
       }
    }
    await Doctors.updateOne({identity:doctorId} , {$set:{patients:temp}})

    console.log("temp --- > ",temp)

    console.log("-----> acceptedPatientId" , patientId , doctorId)
    let curser = await Patient.findOne({identity:patientId})
    let completetext = a?"":" Just wait for doctor acceptance"
    let to = the_doctor.emailAddress
    let subject = "Accept follow-up requests"
    let text = "We inform you that the official agreed to follow up on the patient "+curser.firstName + " "+curser.familyName+"'s condition"
    sendEmail( to,subject,text ).then(()=>{
        console.log('the email was sent')
        let to = curser.emailAddress
        let subject = "Accept follow-up requests"
        let text = "We inform you that the official agreed to follow up on your case by Doctor: "+the_doctor.firstName + " "+the_doctor.familyName + completetext
        sendEmail( to,subject,text ).then(()=>{
            console.log('the email was sent')
            return res.status(200).redirect('/admin/patient/req/view')
        })
    
    
    })


    



} else if (req.query.rejectedPatientId) {
    let patientId = req.query.rejectedPatientId
    let doctorId = req.query.doctorId
    let the_doctor = await Doctors.findOne({identity:doctorId})
    let temp = []
    for (let pa of the_doctor.patients){
        temp.push(pa)
    }
    for (let i of temp){
       if ( i.patientId == patientId){
            temp.splice(temp.indexOf(i),1)  
       }
    }
    await Doctors.updateOne({identity:doctorId} , {$set:{patients:temp}})

    console.log("temp --- > ",temp)

    console.log("-----> acceptedPatientId" , patientId , doctorId)
    return res.status(200).redirect('/admin/patient/req/view')


}

return res.status(200).render('patient/req' , {
    patientsData:data,
    appointments:appointmentsCollection,
    followersData:followersData
    })

})


function pagenator (model) {
    return async (req , res , next) => {
        let page = parseInt(req.query.page)
        let limit = parseInt(req.query.limit)
        if (!page) {
            page = 1
        }
        if (!limit) {
            limit = 5
        }
        const startIndex = (page -1 ) * limit
        const endIndex = page * limit
        const results = {}
        results.collectionRowCounts = await model.countDocuments().exec()
       console.log(typeof page )
        // let r = Math.ceil()
        results.pages = []
        let pages1 = Math.ceil( Number(results.collectionRowCounts) / 5)
        for (let i = 1; i<= pages1; i++) {
            results.pages.push(i)
        }
        console.log(results.pages)
        if (endIndex < await model.countDocuments().exec()){
            results.next = {
                page:page+1,
                limit:limit
            }
        }
        if (startIndex > 0){
            results.previous = {
                page:page-1,
                limit:limit
            }
        }
        try{
            results.results = await model.find().limit(limit).skip(startIndex).exec()
            res.patients = results
            next()
        }catch(e){
            res.status(500).json({message:e.message})
        }
    }
}

module.exports = adminRouter