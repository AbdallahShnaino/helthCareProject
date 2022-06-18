const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PatientSchema = new Schema({
  id: { type: String, required: false , trim:true },
  identity: { type: String, required: false , trim:true , length:10 , default:"_"},
  emailAddress: { type: String, required: true , trim:true },
  firstName: { type: String, required: true , trim:true},
  familyName: { type: String, required: true , trim:true},
  photo: { type: String, required: false },
  doctores: { type: [Object], required: false },
  medicalPhotos: { type: [String], required: false },
  medicalVedios: { type: [String], required: false },
  isActive:{type:Boolean , required:false , default:false}
}, {
  timestamps: true,
});

const Patient = mongoose.model('Patient', PatientSchema);
module.exports = Patient;