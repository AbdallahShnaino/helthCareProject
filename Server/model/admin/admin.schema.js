const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  id: { type: String, required: false , trim:true },
  identity: { type: String, required: false , trim:true , length:10 , default:"_"},
  emailAddress: { type: String, required: true , trim:true },
  firstName: { type: String, required: true , trim:true},
  familyName: { type: String, required: true , trim:true},
  photo: { type: String, required: false },
}, {
  timestamps: true,
});

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;