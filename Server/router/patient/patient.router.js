const express = require('express')
const patientRouter = express.Router()
const {Strategy} = require('passport-google-oauth20')
const cookieSession = require('cookie-session')
let sendEmail = require('../../controller/mail/mail.controller')
const {getDoctors , getPatientDoctors,patientExistwithID , updatePatientPhoto , addDoctorToPatient , getPatients} = require('../../model/patient/patient.model')
let {getDoctorsToAPatient,getListOfDoctors,addPatientToDoctor,doctorExistwithID} = require("../../model/doctor/doctor.model")
const {getDoctorAppointment,isAvailabelAppointment,insertAppointment} = require('../../model/appointment/appointment.model')
const path = require('path')
const {format} = require('util');
const Multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const Doctors = require('../../model/doctor/doctor.schema')
const { insertDoc , getDocs} = require('../../model/docs/docs.model')
const Appointment = require('../../model/appointment/appointment.schema')
const Patient = require('../../model/patient/patient.schema')
const Doc = require('../../model/docs/docs.schema')
/*
require('../../controller/mail/mail.controller')
*/
const storage = new Storage(
    {
        keyFilename:path.join(__dirname ,"../","../", "health-care-system-348623-132906db8f4f.json"),
        projectId:"health-care-system-348623"
    }
);

const gc = new Storage(
    {
        keyFilename:path.join(__dirname , "health-care-system-348623-132906db8f4f.json"),
        projectId:"health-care-system-348623"
    }
    
    )
    
let userId = ""
patientRouter.get("/",(req , res)=>{
    userId = req.query.id
    patientExistwithID(userId).then(user => {
        res.status(200).render('patientPortal/',user)
    })
})


const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});
const bucket = storage.bucket(process.env.pucketName);

patientRouter.post('/', multer.single('file'), (req, res, next) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();
  blobStream.on('error', err => {
    next(err);
  });
  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    updatePatientPhoto(userId, publicUrl).then(()=>{
        res.status(200).redirect('patient?id='+userId)
    })
  });
  blobStream.end(req.file.buffer);
});  


patientRouter.get("/docs/add" , (req , res)=>{
  console.log(userId , " 0000000")  
  if (!userId){
   let id = req.query.id 
   let updateDoc = req.query.updateDoc
   if (id){
    return res.status(200).render('patientPortal/addDocs' , {userId:id})
   }
   if (updateDoc){
     console.log(" ^^^^^^^^^^^ " , updateDoc)

     let update = "aa"
    return res.status(200).render('patientPortal/addDocs' , {updateDoc:updateDoc
    ,update:update})

   }

  }
  return res.status(200).render('patientPortal/addDocs' , {userId:userId})

})
patientRouter.post("/docs/add" ,multer.single('file'), (req , res , next)=>{
  let fileName = req.body.fileName
 // let file = req.body.file
  let owner = req.body.id
  console.log("the owner is "+owner)
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();
    blobStream.on('error', err => {
      next(err);
      console.log("error  !@# ")
    });
    blobStream.on('finish', async () => {
      // The public URL can be used to directly access the file via HTTP.
      console.log("hello ")
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      let doc = {
        name:fileName,
        url:publicUrl,
        owner:owner,
      }
      

      let updateDoc = req.body.updateOp
      if (updateDoc){
        
        await Doc.updateOne({_id:updateDoc} , {$set:{
          url:doc.url,
          name:doc.name
        }})
        let docx = await Doc.findOne({_id:updateDoc})
        let owner = docx.owner
        console.log("owner " , owner)

        let doctor = await Doctors.findOne({identity:owner})
        let patient = await Patient.findOne({identity:owner})
        let email = undefined
        if (doctor){
          email = doctor.emailAddress
        }
        if (patient){
          email = patient.emailAddress
        }
        console.log("doctor " , doctor)
        console.log("patient " , patient)
        let to = email
        console.log("to " , to)
        let subject = "Notification of changing account information"
        let text = "We inform you that the administrator has modified your data. For more information, we hope to review your account"
        sendEmail( to,subject,text ).then(()=>{
      console.log('the email was sent')
        return res.send("file updated")
    })
  
    
      }else{
       await insertDoc(doc)
       console.log("doc    ",doc)
       let owner = doc.owner
       let doctor = await Doctors.findOne({identity:owner})
       let patient = await Patient.findOne({identity:owner})
       let email = undefined
       if (doctor){
         email = doctor.emailAddress
       }
       if (patient){
         email = patient.emailAddress
       }
       let to = email
       console.log("to " , to)
       let subject = "A file has been added to your account"
       let text = "A file has been added to your account. For more information, please review your account"
       sendEmail( to,subject,text ).then(()=>{
     console.log('the email was sent')
      return res.send("file saved")
    })



      }

   

    });
    blobStream.end(req.file.buffer);

    ///////////////

  
})
patientRouter.get("/docs/view" , (req , res)=>{
  console.log("hhhhhhhhhhh")
  let id = req.query.id
  let docs = []
  getDocs(id).then((response)=>{
    for (let instance of response) {
      let doc = {
        name:instance.name,
        date:instance.createdAt,
        url:instance.url,
    }
    docs.push(doc)
    }
    console.log(docs)
    res.status(200).render('patientPortal/viewDocs' , {docs:docs})
  })

})

let pID = ""
let dID = ""
let test = ""
patientRouter.get('/appointment/book' , pagenator(Doctors), (req , res)=>{
  let id = req.query.id
  pID = id
  return res.status(200).render("patientPortal/newAppointment" , {patientId:id,patientsData:res.patients,})
})

patientRouter.get('/appointment/book/doc', (req , res)=>{
  dID = req.query.Did
  getDoctorAppointment(dID).then((response)=>{
    return res.status(200).render("patientPortal/booking" , {appointments: response})
  })

})


patientRouter.post('/appointment/book/doc' , (req , res)=>{
  let dateTime = req.body.dateTime
  isAvailabel(dateTime).then(result => {
    if (result == true){
      let document = {
        date:dateTime,
        doctor:dID,
        patient:userId,
      }
      console.log(document)
      console.log("  document    ",document , pID)
    if (document.doctor && document.patient){

      insertAppointment(document).then( async () => {
        let patient = await Patient.findOne({identity:document.patient})
        let to = patient.emailAddress
        let subject = "ask for appointment"
        let text = "We would like to inform you that the appointment has been requested from the doctor. Please wait for the approval from the doctor and the official. You will receive a notification as soon as the request is accepted (you have to wait for two emails from the doctor and the official)"
        sendEmail( to,subject,text ).then(()=>{
		  	console.log('the email was sent')
        })


        let doctor = await Doctors.findOne({identity:document.doctor})
        let toDoctor = doctor.emailAddress
        let subjectDoctor = "A new appointment awaits your approval"
        let textDoctor = "We inform you that one of the patients has requested an appointment. You can review the details through your account"
        sendEmail( toDoctor,subjectDoctor,textDoctor ).then(()=>{
		  	console.log('the email was sent')
        })

        return res.status(200).redirect("/patient/appointment/book/doc?Did="+dID)
      })
    }
    }else{
      return res.status(200).send("Sorry the appointment is not availabel at this time , try another time")
    }
  })

})
let patientId_ = undefined
patientRouter.get("/doctors/list" , (req , res)=>{
  patientId_ = req.query.id
  return res.status(200).redirect("/patient/doctors/list/view?id="+patientId_)
})
patientRouter.get("/doctors/list/view" , async (req , res)=>{
  let myDoctors = await getPatients(patientId_)
  let data = await getDoctorsToAPatient(myDoctors)
  return res.status(200).render('patientPortal/viewPatientDocs' , {doctors:data,})

})
let patientId = undefined
patientRouter.get("/doctors/choose" , (req , res)=>{
  patientId = req.query.id
  return res.status(200).redirect("/patient/doctors/choose/recorde?id="+req.query.id)
})
patientRouter.get("/doctors/choose/recorde" , pagenator(Doctors), (req , res)=>{
  let doctorId = req.query.addDoctorWith
  if (doctorId && patientId) {
    // add patient to this doctor patients list
    addPatientToDoctor(patientId,doctorId).then( async () =>{
      addDoctorToPatient(patientId, doctorId).then(async () => {
        let d = await Doctors.findOne({identity:doctorId})
        // to doctor 
        let to = d.emailAddress
        let subject = "A patient asked to follow up on his condition"
        let text = "A new patient has asked you to follow up for more information about his health condition and his files. Check your account and see the page for new requests"
        sendEmail( to,subject,text ).then( async()=>{
			console.log('the email was sent')
              // to patient 
              let p = await Patient.findOne({identity:patientId})
              let to = p.emailAddress
              let subject = "Request to join the health follow-up"
              let text = "Your request has been received and is awaiting the doctor's approval to follow up on the case and the approval of the official. We inform you that this may take some time to follow up. Thank you for your understanding."
              sendEmail( to,subject,text ).then(()=>{
            console.log('the email was sent')
            return res.status(200).send("doctor added")

              })

        })


      })
    })

  }else{
    res.status(200).render('patientPortal/chooseADoctor' , {patientsData:res.patients, patientId})
  }

})


let isAvailabel = async function (dateTime) {
  return new Promise ((resolve , reject)=>{
   console.log("data passed ... ",dateTime)
   isAvailabelAppointment(String(dID) ,dateTime ).then( (result)=>{


       if (result == false){
        console.log("time is not availabel")
        resolve(false) 
      }else{
        console.log("time is availabel")
        resolve(true) 
      }
   
   
  
 
    })

  })
}


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


module.exports = patientRouter