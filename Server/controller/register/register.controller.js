const validator = require("validator");
const multer = require("multer");
const { conn } = require("../../app");

const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const database = "healthCare";
const connectionURL =
  "mongodb+srv://test_api:6kMdVho66Gv5Atqc@testcluster.sh9id.mongodb.net/" +
  database +
  "?retryWrites=true&w=majority";

const path = require("path");
const bcrypt = require("bcryptjs");

let uploadPersonalImage = function () {
  const patientPresonalImagePath = path.join(
    __dirname,
    "../../images/patientImages/personalImages"
  );

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, patientPresonalImagePath);
    },
    filename: function (req, file, cb) {
      const parts = file.mimetype.split("/");
      cb(null, `${file.fieldname}-${Date.now()}.${parts[1]}`);
    },
  });
  let upload = multer({
    storage,
    limits: 5000000,
    fileFilter(req, file, cb) {
      if (
        file.originalname.endsWith(".jpeg") ||
        file.originalname.endsWith(".jpg") ||
        file.originalname.endsWith(".png")
      ) {
        cb(undefined, true);
      } else {
        cb(new Error("Sorry JPG , JPEG or PNG Accepted"));
      }
    },
  });
  return upload;
};

let registrationValidation = function (errors, user) {
  if (!user.emailAddress || validator.isEmpty(user.emailAddress)) {
    errors.message.push("Missing E-mail Address , It Should Be Supplied");
  }
  if (!user.firstName || validator.isEmpty(user.firstName)) {
    errors.message.push("Missing First Name , It Sould Be Supplied");
  }



  if (!user.familyName || validator.isEmpty(user.familyName)) {
    errors.message.push("Missing Family Name , It Sould Be Supplied");
  }


  if (
    !user.postion ||
    user.postion === "postion"
  ) {
    errors.message.push("Missing Postion , It Should Be Supplied");
  }

};

let hashPassword = async function (pass) {
  // let bool = await bcrypt.compare(pass , hashedone)
  return await bcrypt.hash(pass, 8);
};
let addNewDoctor = function (errors, doctor) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(connectionURL, (error, client) => {
      if (error) {
        console.log("error");
      }
      let db = client.db(database);

      /////////////////
         function isInserted(){
         return new Promise((resolve , reject)=>{
           try{
            db.collection("Doctor").findOne({emailAddress:doctor.emailAddress}).then((res)=>{
              if(res){
                console.log("doctor is found")
                resolve(true)
              }else{
                console.log("doctor is not found")
                resolve(false)
               
              }
            })
      
           }catch(e){
             console.log("error while try finding it")
             resolve(true)
 
           }

         })
        }


        isInserted().then( res => {

          if(res == true){
            console.log(res)
            errors.message.push(
              "This Email Address Exist Before, Try To Use Another One "
            );
            resolve(true)
          }
          if(res == false){
            console.log(res)
            db.collection("Doctor").insertOne(
             {
                  id: "wasn't givven",
                  emailAddress: doctor.emailAddress,
                  firstName: doctor.firstName,
                  fatherName: doctor.fatherName,
                  familyName: doctor.familyName,
                  phoneNumber: doctor.phoneNumber,
                  dateOfBirth: doctor.dateOfBirth,
                  postion: doctor.postion,
                  nationalNumber: doctor.nationalNumber,
                  medicalDepartment: doctor.medicalDepartment,
                  isActive: false,
                  listOfPatients: [],
                  timeOfRegistration: doctor.timeOfRegistration,
                }
                      
            ).then((result) => {          
              if(result){
                console.log("result -> " + result.acknowledged);
                console.log("*******************")
                resolve(false)

              }
             
            });

          }

          if(res == undefined){
            console.log("undefined")
            resolve(true);
          }

        })
    });
  });
};

let addNewPatient = function (errors, patient) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(connectionURL, (error, client) => {
      if (error) {
        console.log("error");
      }
      let db = client.db(database);
      let isFound = false;

      if (isFound == false) {
        db.collection("Patient").updateOne(
          { emailAddress: patient.emailAddress },
          {
            $set: {
              id: "wasn't givven",
              emailAddress: patient.emailAddress,
              firstName: patient.firstName,
              fatherName: patient.fatherName,
              familyName: patient.familyName,
              phoneNumber: patient.phoneNumber,
              dateOfBirth: patient.dateOfBirth,
              postion: patient.postion,
              nationalNumber: patient.nationalNumber,
              isActive: false,
              listOfDoctores: [],
              timeOfRegistration: patient.timeOfRegistration,
            },
          },
          { upsert: true },
          (error, result) => {
            if (error) {
              throw new Error(
                "something go woring throw register you to the system , sorry try again"
              );
            }
            console.log("result -> " + result.acknowledged);
          }
        );
      } else {
        console.log("step 1");
        errors.message.push(
          "This Email Address Exist Before, Try To Use Another One "
        );
      }

      resolve();
    });
  });
};

// from here
let validation = function (errors , postion , medicalDepartment ) {
  if (!postion || postion == "-1"){
    errors.message.push("You need to enter your postion");

  }
  if (postion == "Patient" && medicalDepartment != "-1"){
    errors.message.push("As a patient, You don't need to enter your health care dept.");
  }
  if ( postion == "Doctor" && medicalDepartment == "-1" ){
    errors.message.push("As a doctor, Choose your department , If it's not listed choose other");

  }
  
}



module.exports = {
  validation,
  registrationValidation,
  uploadPersonalImage,
  addNewPatient,
  addNewDoctor,
};
