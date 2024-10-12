const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    // admin, user, etc.
    unique: true,
  }


});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
