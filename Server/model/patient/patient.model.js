const Patient = require("./patient.schema");
let {doctorExistwithID} = require('../doctor/doctor.model');
const { all } = require("../../router/doctor/doctor.router");
const Doctor = require("../doctor/doctor.schema");
async function insertPatient(patient) {
  return Patient.create(patient);
}

async function getNoNActivatedPatients() {
  return await Patient.find({ isActive: false });
}

let PatientExist = function (patient) {
  return new Promise((resolve, reject) => {
    try {
      Patient.findOne({ emailAddress: patient.emailAddress }).then((res) => {
        if (res) {
          console.log("Patient is found");
          resolve(true);
        } else {
          console.log("Patient is not found");
          resolve(false);
        }
      });
    } catch (e) {
      console.log("error while try find the user");
      resolve(false);
    }
  });
};

let patientExistwithID = function (id) {
    return new Promise((resolve, reject) => {
      try {
        Patient.findOne({ identity: id }).then((res) => {
          if (res) {
            console.log("Doctor is found");
            resolve(res);
          } else {
            console.log("Doctor is not found");
            resolve(false);
          }
        });
      } catch (e) {
        console.log("error while try find the user");
        resolve(false);
      }
    });
  };

  let updatePatientPhoto = function ( id , photo ) {
    return new Promise((resolve, reject) => {
      try {
        Patient.updateOne({ identity: id } , {
          $set: {
            photo: photo
          }
      }).then((res) => {
          if (res) {
            console.log("Doctor photo updated");
            resolve(res);
          } else {
            console.log("Doctor photo wasn't updated");
            resolve(false);
          }
        });
      } catch (e) {
        console.log("error while try update the doctor photo");
        resolve(false);
      }
    });
  }

  let patientExistwith_ID = function (id) {
    return new Promise((resolve, reject) => {
      try {
        Patient.findOne({ _id: id }).then((res) => {
          if (res) {
            console.log("Doctor is found");
            resolve(res);
          } else {
            console.log("Doctor is not found");
            resolve(false);
          }
        });
      } catch (e) {
        console.log("error while try find the user");
        resolve(false);
      }
    });
  };

  let patientExistwithEmail = function (emailAddress) {
    return new Promise((resolve, reject) => {
      try {
        Patient.findOne({ emailAddress: emailAddress }).then((res) => {
          if (res) {
            console.log("Doctor is found");
            resolve(res);
          } else {
            console.log("Doctor is not found");
            resolve(false);
          }
        });
      } catch (e) {
        console.log("error while try find the user");
        resolve(false);
      }
    });
  };
  let addDoctorToPatient = function (patientId , doctorId) {
    let doctors = []
    return new Promise((resolve, reject) => {
      try {
        Patient.findOne({ identity: patientId }).then((res) => {
          if (res) {
            doctors = res.doctores
            let isExist = false
            for ( let d of doctors) {
              if (d.doctorId == doctorId){
                isExist = true
                break
              }else{
                console.log("you are exist .... " , doctors.length)
              }
              
            }
            if (isExist == false){
              let obj = {doctorId:doctorId,adminAcceptance:false,doctorAcceptance:false}
              doctors.push(obj)        
              console.log("obj**** ",obj)
            }
          } else {
            resolve(false);
          }
        }).then(()=>{
          Patient.updateOne({identity: patientId},{$set:{doctores
            :doctors}}).then( result => {
              console.log("***** ",doctors.length)
              resolve(true);

          })

        });
      } catch (e) {
        console.log("error while try find the user");
        resolve(false);
      }
    });
  }
  
  let getPatientDoctorsData = async function (patientId) {

    let patient = undefined
    patient = await Patient.findOne({ identity: patientId })
    const p = new Promise((res, rej) => {
      res(patient);
    })
    return Promise.resolve(p)
  }
  ///////////// ////////////// /////////////// //////////////

let getPatientDoctors = async function (patientId) {
  let patient = undefined
 return await  getPatientDoctorsData(patientId).then( (re)=>{
    patient = re
    let doctorsContainer = []
    let ids = []
    return async function () {
      let doctors = patient.doctores
       for ( let i of doctors){
         let id = i.doctorId
           ids.push(id)
    /* 
           doctorExistwithID(id).then((result)=>{
           doctorsContainer.push(result)
         })
    */
   return function () {
     console.log("finished" , ids)
     return ids
   }
       }
     }
  })

  }



/* 

async function getListOfPatients (array) {

  let doctors = []
  let index = 0
    return new Promise( async(resolve, reject) => {
      try {



        console.log("the array  ",array)
        for (let x of array) {
          let id =  x.patientId
          console.log("test .........  ",id)
            Patient.findOne({ identity:id}).then((res) => {
              if (res) {
                console.log("Doctor is found");
                let obj = {
                  identity:x.patientId,
                  emailAddress: res.emailAddress,
                  firstName:res.firstName,
                  familyName:res.familyName,
                  documents:[],
                  isActive:res.isActive,
                  acceptedFromDoctor:x.doctorAcceptance,
                  acceptedFromAdmin:x.adminAcceptance,
                }

                console.log(" 09090909 " , obj)

              
                  doctors.push(obj)
                  index++

                  if (index == array.length) {
                    console.log("--------- ++++++ -----------" , doctors)
                    resolve(doctors);
                  }else{
                    console.log("--------- ++++++ ----------- nooo "  , array.length , index)
    
                  }
      
                
              } else {
                console.log("patient is not found");
                resolve(false);
              }
            })
          
        }
      } catch (e) {
        console.log("error while try find the user");
        resolve(false);
      }
    });
  };
*/
 async function getListOfPatients (array) {
  let myArray = []
  for ( let x of array){
    let patientId = x.patientId;
    let patient = undefined;
    await Patient.findOne({ identity:patientId}).then((res) => {
      if (res) {
        console.log("Doctor is found");
        let obj = {
          identity:x.patientId,
          emailAddress: res.emailAddress,
          firstName:res.firstName,
          familyName:res.familyName,
          documents:[],
          isActive:res.isActive,
          acceptedFromDoctor:x.doctorAcceptance,
          acceptedFromAdmin:x.adminAcceptance,
        }
        console.log(" 09090909 " , obj)
        patient = obj        
      } else {
        console.log("patient is not found");
        resolve(false);
      }
    })
    myArray.push(patient)

  }
  return myArray
  };


  async function exc (array) {
    let myArray = []
    for ( let x of array){
      let patientId = x.patientId;
      let patient = undefined;
      await Patient.findOne({ identity:patientId}).then((res) => {
        if (res) {
          console.log("Doctor is found");
          let obj = {
            identity:x.patientId,
            emailAddress: res.emailAddress,
            firstName:res.firstName,
            familyName:res.familyName,
            documents:[],
            isActive:res.isActive,
            acceptedFromDoctor:x.doctorAcceptance,
            acceptedFromAdmin:x.adminAcceptance,
          }
          console.log(" 09090909 " , obj)
          patient = obj        
        } else {
          console.log("patient is not found");
          resolve(false);
        }
      })
      myArray.push(patient)
  
    }
    return myArray
    };

    

  let prephareAppointmentsData = async function(array){
    let container = []
    for (let index of array){
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
    if (i == container.length){
      console.log("778899 ",container)
      return container
    }
  }

  async function getPatients (id){
    let doctors = []
    let patient = await Patient.findOne({identity: id})
    for (let doctor of patient.doctores) {
      if (doctor.adminAcceptance == true){
        doctors.push(doctor)
      }
    }
    return doctors
  }

  async function getDoctorPatients (id){
    let doctors = []
    let doctor = await Doctor.findOne({identity: id})
    for (let patient of doctor.patients){
      
    }
    let patient = await Patient.findOne({identity: id})
    for (let doctor of patient.doctores) {
      if (doctor.adminAcceptance == true){
        doctors.push(doctor)
      }
    }
    return doctors
  }

  async function getPatientsToADoctor (array) {
    let data = []
    for (let cersor of array){
      let doctor = await Doctor.findOne({identity:cersor.doctorId})
      data.push(doctor)
    }
    return data 
  }

module.exports = {
  insertPatient,
  getNoNActivatedPatients,
  PatientExist,
  patientExistwithID,
  patientExistwith_ID,
  patientExistwithEmail,
  updatePatientPhoto,
  addDoctorToPatient,
  getPatientDoctors,
  getPatientDoctorsData,
  getListOfPatients,
  prephareAppointmentsData,
  getPatients,
  exc,
  getPatientsToADoctor,

};
