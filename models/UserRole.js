const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
});

const UserRole = mongoose.model('UserRole', userRoleSchema);
module.exports = UserRole;
