const AdminBro = require('admin-bro')
const AdminBroExpress = require('@admin-bro/express')
const AdminBroSequelize = require('@admin-bro/sequelize')
const AdminBroOptions = require('./options')
const { models: {users} } = require("../../utils");
const bcrypt = require("bcryptjs");

AdminBro.registerAdapter(AdminBroSequelize)

const adminBro = new AdminBro(AdminBroOptions);

// const AdminBroRoutes = AdminBroExpress.buildRouter(adminBro)

// Build and use a router which will handle all AdminBro routes
const AdminBroRouter = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    const user = await users.findOne({ where: { email } });
    if (user && ['ADMIN', 'SUPER_ADMIN', 'CREATOR'].includes(user.role)) {
      const matched = await bcrypt.compare(password, user.password)
      if (matched) {
        return user
      }
    }
    return false
  },
  cookieName: 'adminbro',
  cookiePassword: process.env.COOKIE_ADMIN_SECRET,
})

module.exports = AdminBroRouter;