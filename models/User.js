const {Schema, model, Types} = require('mongoose');

const schema = new Schema({
  name: {type: String, required: false},
  email: {type: String, required: true, unique: true},
  phone: {type: String, required: false},
  password: {type: String, required: true},
  role: {type: String, required: true},
  companies: {type: Array, required: false},

});

module.exports = model('User', schema);