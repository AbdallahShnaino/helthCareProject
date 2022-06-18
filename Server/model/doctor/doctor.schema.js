const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DoctorSchema = new Schema({
  id: { type: String, required: false , trim:true },
  identity: { type: String, required: false , trim:true , length:10 , default:"_"},
  emailAddress: { type: String, required: true , trim:true },
  firstName: { type: String, required: true , trim:true},
  familyName: { type: String, required: true , trim:true},
  photo: { type: String, required: false },
  patients: { type: [Object], required: false },
  isActive:{type:Boolean , required:false , default:false}
}, {
  timestamps: true,
});

const Doctor = mongoose.model('Doctor', DoctorSchema);
module.exports = Doctor;