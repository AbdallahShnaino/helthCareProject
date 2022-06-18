const express = require('express')
const doctorRouter = express.Router()
const {Strategy} = require('passport-google-oauth20')
const cookieSession = require('cookie-session')
const {acceptPatient,getPatientDoctorsList,doctorExistwithID , updateDoctorPhoto} = require("../../model/doctor/doctor.model")
const {getPatientsToADoctor ,getPatients,exc, prephareAppointmentsData} = require("../../model/patient/patient.model")
const path = require('path')
let sendEmail = require('../../controller/mail/mail.controller')
const {format} = require('util');
const Multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const {getDoctorAppointment , doctorAcceptAppointment} = require('../../model/appointment/appointment.model')
const { getDocs , getPatientsDocuments } = require('../../model/docs/docs.model')
const Patient = require('../../model/patient/patient.schema')
const Doctor = require('../../model/doctor/doctor.schema')
const Appointment = require('../../model/appointment/appointment.schema')
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
doctorRouter.get("/",(req , res)=>{
    userId = req.query.id
    doctorExistwithID(userId).then(user => {
      console.log(user)
        return res.status(200).render('doctorPortal/',user)
    })
})


const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});
const bucket = storage.bucket("health-care-fs");

doctorRouter.post('/', multer.single('file'), (req, res, next) => {
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
    updateDoctorPhoto(req.body.id , publicUrl).then(()=>{
        res.status(200).redirect('doctor?id='+userId)
    })
  });
  blobStream.end(req.file.buffer);
});


doctorRouter.get("/newPatients/accept",async (req , res)=>{
  try{
    let patients = []
    let doctor = await Doctor.findOne({identity:userId})
    console.log('to log our error ' , doctor)
  
    for (let patient of doctor.patients){
      if ( patient.doctorAcceptance == false){
        let id = patient.patientId
        console.log('to log id ' , id)
        let res = await Patient.findOne({identity:id})
        console.log('to log our error ' , res)
   
        let obj = {
          identity:patient.patientId,
          emailAddress: res.emailAddress,
          firstName:res.firstName,
          familyName:res.familyName,
          documents:[],
          isActive:res.isActive,
          acceptedFromDoctor:patient.doctorAcceptance,
          acceptedFromAdmin:patient.adminAcceptance,
        }
        let documents = await getDocs(obj.identity)
        for(let document of documents){
          let doc = {
            name:document.name,
            url:document.url,
          }
          obj.documents.push(doc)
        }
         
        patients.push(obj)
      }
    }
    console.log( "res 0 0 0 ",patients)
   /* 
     let arr = []
    let data = []
    getPatientDoctorsList(userId).then((response)=>{
      try{
        for (let i of response){
          if (i.doctorAcceptance == false){
            arr.push(i)
          }
        }
      }catch(e){}
    })
    
    
    .then(()=>{
      console.log("progress 1 -> " , arr)
  
      })
   */
  
      return res.status(200).render("doctorPortal/AcceptNewPatients" , {response:patients})

  }catch(e){
    return res.status(200).render("doctorPortal/AcceptNewPatients")

  }
 

})



doctorRouter.get("/add/patient/",(req , res)=>{
  patientId = req.query.id
  let doctorId = userId
  acceptPatient(patientId , doctorId).then( async()=>{
    let p = await Patient.findOne({identity:patientId})
    let to = p.emailAddress
    let subject = "Notification of acceptance of follow-up by the doctor"
    let text = "We inform you that your follow-up has been accepted by the doctor. You can contact him via email and you can upload important files to your account"
    sendEmail( to,subject,text ).then( async()=>{
  console.log('the email was sent')

    let d = await Doctor.findOne({identity:doctorId})
    let to = d.emailAddress
    let subject = "A follow-up patient has been accepted"
    let text = "You have followed up on a new case. Just wait for approval from admin We wish you good luck"
    sendEmail( to,subject,text ).then(()=>{
  console.log('the email was sent')
  res.status(200).redirect("/doctor/newPatients/accept")
})
})
    
    
  })
})

doctorRouter.get("/add/appointment/", (req , res)=>{
  console.log(userId)
  getDoctorAppointment(userId).then(async response =>{
    let container = []
    for (let index of response){
      let date = index.date
      let patientName = index.patient
      let adminAccept = index.adminAccept
      let id = index._id
      let obj = {
        id:id,
        date:date,
        name:patientName,
        adminAccept:adminAccept,
      }
      if (index.doctorAccept == false) {
        container.push(obj)
      }

    }

    let i = 0
    for (let user of container) {
      i++
      let patient = await Patient.findOne({identity: user.name})
      if (patient){
        console.log("lllllllllll " , patient)
          user.name =  patient.firstName + " " + patient.familyName
      }
      
    }


    console.log("44 444 44 ",container)
    return res.status(200).render("doctorPortal/appointmentsErquiests" , {response:container})
  })
})

doctorRouter.get("/add/appointment/accept/",(req , res)=>{
  let appointmentId = req.query.id
  doctorAcceptAppointment(appointmentId).then(async()=>{
    let appoint = await Appointment.findOne({_id:appointmentId})
    let doctorID = appoint.doctor
    let patientID = appoint.patient
    let doctor = await Doctor.findOne({identity:doctorID})
    let patient = await Patient.findOne({identity:patientID})
    let doctorEmail = doctor.emailAddress
    let patientEmail = patient.emailAddress

    if (appoint.adminAccept == true){
      let to = doctorEmail
      let subject = "Accept a new appointment"
      let text = "You have accepted a new appointment and it has been approved by the administrator"
      sendEmail( to,subject,text ).then(async()=>{
    console.log('the email was sent')
  
  
  
    let to = patientEmail
    let subject = "Appointment accepted"
    let text = "The appointment was accepted by the doctor and the official, check your account for more details"
    sendEmail( to,subject,text ).then(async()=>{
  console.log('the email was sent')

  console.log(" ++++++++++++++++++++++++++++++++++++++ ",appointmentId)
  return res.status(200).redirect("/doctor/add/appointment/")

})
  
    })

}else{

  let to = doctorEmail
  let subject = "Accept a new appointment"
  let text = "Your approval of the appointment has been registered, awaiting approval from the administrator"
  sendEmail( to,subject,text ).then(async()=>{
console.log('the email was sent')



let to = patientEmail
let subject = "Appointment accepted"
let text = "We inform you that the appointment to be held has been approved by the doctor, pending approval by the official"
sendEmail( to,subject,text ).then( async()=>{
console.log('the email was sent')

console.log(" ++++++++++++++++++++++++++++++++++++++ ",appointmentId)
return res.status(200).redirect("/doctor/add/appointment/")})

})

}


  })
})


doctorRouter.get("/view/patients/" ,pagenator(Patient), async (req , res)=>{
  let data = {}
  data.pages = res.patients.pages
  data.next = res.patients.next
  data.previous = res.patients.previous
  let results = []
  for (let obj of res.patients.results){
    let container = {
      identity:obj.identity,
      emailAddress:obj.emailAddress,
      firstName:obj.firstName,
      familyName:obj.familyName,
      doctores:[],
      isActive:obj.isActive,
      docs:[],
    }
    try{
        for (let doctor of obj.doctores){
        let result = await doctorExistwithID(doctor.doctorId)
        let name =result.firstName + " "+ result.familyName
        container.doctores.push(name)
      }
      let docs = await getDocs(container.identity)
      for (let doc of docs){
        container.docs.push({name:doc.name , url:doc.url})
      }
      console.log("docs ..... + ",docs)

      }catch(e){}
    results.push(container)
  }
  data.results = results
  
  console.log("kkk h " , data)
  res.status(200).render("doctorPortal/viewAllPatients" , {patientsData:data})
})


// do next
doctorRouter.get("/patients/view/", async (req , res)=>{
  let doctor = await Doctor.findOne({identity:userId})
  let patients = doctor.patients
  let data = {
    results:[]
  }
  for (let p of patients){
    if (p.doctorAcceptance && p.adminAcceptance){
      console.log(" ;;;; " ,p.patientId )
      let obj = await Patient.findOne({identity:p.patientId})

      let container = {
        identity:obj.identity,
        emailAddress:obj.emailAddress,
        firstName:obj.firstName,
        familyName:obj.familyName,
        doctores:[],
        isActive:obj.isActive,
        docs:[],
      }
      try{
          for (let doctor of obj.doctores){
          let result = await doctorExistwithID(doctor.doctorId)
          let name =result.firstName + " "+ result.familyName
          container.doctores.push(name)
        }
        let docs = await getDocs(container.identity)
        for (let doc of docs){
          container.docs.push({name:doc.name , url:doc.url})
        }
        console.log("docs ..... + ",docs)
        data.results.push(container)
        }catch(e){}

        
    }
  }
  res.status(200).render("doctorPortal/myPatients" , {data:data})
})

doctorRouter.get("/cancel/patient/" , async (req , res)=>{
  let id = req.query.id
  let doctor = await Doctor.findOne({ identity: userId })
  let array = doctor.patients
  for (let index of array){
    if (index.patientId == id){
      index.doctorAcceptance = false
    }
  }
  await Doctor.updateOne({ identity: userId } , {
    $set: {
      patients: array
    }
})
  res.status(200).redirect('/doctor/patients/view/')
})


doctorRouter.get("/appointments/accepted/" , async (req , res)=>{
  let appointments = await Appointment.find(
    {
      doctor:userId,
      doctorAccept:true,
      adminAccept:true,
    }
    )
  let data = []
  for (let app of appointments){
    let obj = {}
    let patient = await Patient.findOne({identity:app.patient})
    console.log(patient , "bbb")
    if (patient){
      obj.name = patient.firstName + " "+ patient.familyName
      obj.date = app.date
      data.push(obj)
    }
  }
  console.log("23123 "  , data)
  res.status(200).render("doctorPortal/acceptedAppointments" , {response:data})
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

module.exports = doctorRouter