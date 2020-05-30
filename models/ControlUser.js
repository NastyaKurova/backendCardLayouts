const {Schema, model, Types} = require('mongoose');

const schema = new Schema({
  idUser: {type: String, required: true, unique: true},
  name: {type: String, required: false},
  email: {type: String, required: true, unique: true},
  phone: {type: String, required: false},
  role: {type: String, required: true},

});

module.exports = model('ControlUser', schema);