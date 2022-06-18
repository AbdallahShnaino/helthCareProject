const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
  date:{
      type:String
  },
  doctor:{
    type:String
    },
  patient:{
      type:String
  },
  doctorAccept:{
    type:Boolean,
    default:false,
    required:false,
  },
  adminAccept:{
    type:Boolean,
    default:false,
    required:false,
  },

}, {
  timestamps: true,
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);
module.exports = Appointment;