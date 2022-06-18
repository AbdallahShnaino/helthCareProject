const Doctor = require('./doctor.schema')

async function insertDoctor(doctor) {
    return Doctor.create(doctor);
}



let addPatientToDoctor = function (patientId , doctorId) {
  let patients = []
  return new Promise((resolve, reject) => {
    try {
      Doctor.findOne({ identity: doctorId }).then((res) => {
        if (res) {
          patients = res.patients
          let isExist = false
          for ( let d of patients) {
            if (d.patientId == patientId){
              isExist = true
              break
            }else{
              console.log("you are exist .... " , patients.length)
            }
            
          }
          if (isExist == false){
            let obj = {patientId:patientId,adminAcceptance:false,doctorAcceptance:false}
            patients.push(obj)        
            console.log("obj**** ",obj)
          }

        } else {
          resolve(false);
        }
      }).then(()=>{
        Doctor.updateOne({identity: doctorId},{$set:{patients
          :patients}}).then( result => {
            console.log("addPatientToDoctor ***** ",patients)
            resolve(true);

        })

      });
    } catch (e) {
      console.log("error while try find the user");
      resolve(false);
    }
  });
}

let doctorExist = function (doctor) {
    return new Promise((resolve, reject) => {
      try {
        Doctor.findOne({ emailAddress: doctor.emailAddress }).then((res) => {
          if (res) {
            console.log("Doctor is found");
            resolve(true);
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


  let doctorExistwithID = function (id) {
    return new Promise((resolve, reject) => {
      try {
        Doctor.findOne({ identity: id }).then((res) => {
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

  let getListOfDoctors = function (array) {
    let doctors = []
    return new Promise((resolve, reject) => {
      try {
        let index = 0
        console.log("the array  ",array)
        for (let x of array) {
          let id =  x.doctorId 
          Doctor.findOne({ identity:id}).then((res) => {
            if (res) {
              console.log("Doctor is found");
              doctors.push(res)
              
            } else {
              console.log("Doctor is not found");
              resolve(false);
            }
          }).then(()=>{
            index++
            if (index == array.length) {
              resolve(doctors);
            }

          });
        }
      } catch (e) {
        console.log("error while try find the user");
        resolve(false);
      }
    });
  };

  let doctorExistwithEmail = function (emailAddress) {
    return new Promise((resolve, reject) => {
      try {
        Doctor.findOne({ emailAddress: emailAddress }).then((res) => {
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

let updateDoctorPhoto = function ( id , photo ) {
  return new Promise((resolve, reject) => {
    try {
      Doctor.updateOne({ identity: id } , {
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
async function getNoNActivatedDoctor () {
    return await Doctor.find({isActive:false})
}

async function getAllDoctor () {
  return await Doctor.find({})
}

let getPatientDoctorsList = function (id) {
  return new Promise((resolve, reject) => {
    try {
      Doctor.findOne({ identity: id }).then((res) => {
        if (res) {
          resolve(res.patients);
        } else {
          resolve(false);
        }
      });
    } catch (e) {
      console.log("error while try find the user");
      resolve(false);
    }
  });
};

let acceptPatient = function (patientId , doctorId) {
  let meddilware = []
  return new Promise((resolve, reject) => {
    try {
      Doctor.findOne({ identity: doctorId }).then((res) => {
        if (res) {
          meddilware = res.patients
          console.log(" ..................+++++............ " , meddilware)
          let done = false
          for (let i of meddilware) {
            if(i.patientId == patientId){
              i.doctorAcceptance = true
            }
            Doctor.updateOne({identity: doctorId},{$set:{patients
              :meddilware}}).then( result => {
                done = true
            }).then(()=>{
              if(done){
                console.log(" ..................--**--............ " , meddilware)
                resolve(res.patients);
              }
            })
          }
        } else {
          resolve(false);
        }
      })
    } catch (e) {
      console.log("error while try find the user");
      resolve(false);
    }
  });
}


async function getDoctorsToAPatient (array) {
  let data = []
  for (let cersor of array){
    let doctor = await Doctor.findOne({identity:cersor.doctorId})
    data.push(doctor)
  }
  return data 
}
module.exports = {
    insertDoctor,getNoNActivatedDoctor,doctorExist,doctorExistwithID,doctorExistwithEmail,
    updateDoctorPhoto,
    getAllDoctor,
    addPatientToDoctor,
    getListOfDoctors,
    getPatientDoctorsList,
    acceptPatient,
    getDoctorsToAPatient,
}
