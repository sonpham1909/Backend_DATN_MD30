const Role = require("../models/Role"); // Đường dẫn đến file model Role

const createDefaultRoles = async () => {
  try {
    // Kiểm tra xem role "admin" đã tồn tại chưa
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      // Thêm role "admin" nếu chưa có
      await Role.create({ name: 'admin' });
      console.log('Default role "admin" created.');
    }

    // Kiểm tra xem role "user" đã tồn tại chưa
    const userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      // Thêm role "user" nếu chưa có
      await Role.create({ name: 'user' });
      console.log('Default role "user" created.');
    }
  } catch (error) {
    console.error('Error creating default roles:', error);
  }
};

module.exports = createDefaultRoles;