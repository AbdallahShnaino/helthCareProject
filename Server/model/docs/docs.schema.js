const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocsSchema = new Schema({
  owner:{
      type:String
  },
  name:{
    type:String
    },
  url:{
    type:String
    },
}, {
  timestamps: true,
});

const Doc = mongoose.model('Docs', DocsSchema);
module.exports = Doc;