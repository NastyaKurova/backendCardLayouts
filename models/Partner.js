const {Schema, model, Types} = require('mongoose');

const schema = new Schema({
  idUser: {type: String, required: true, unique: true},
  name: {type: String, required: false},
  email: {type: String, required: true, unique: true},
  phone: {type: String, required: false},
  description: {type: String, required: false},
  address: {type: String, required: false},
  cardLayout: {type: String, required: false},
  needApprove: {type: Boolean, required: false},
  approved: {type: Boolean, required: false},
  users: {type: Number, required: false},
});

module.exports = model('Partner', schema);