const { 
  // db, 
  models 
} = require('../../utils');
const bcrypt = require("bcryptjs");

const accessibleTo = (arr)=>({ currentAdmin, record })=>currentAdmin && arr.includes(currentAdmin.role);

const userResource = { 
  resource: models.users, 
  options: { 
    properties: {
      id: { 
        position: -2,
        isVisible: { edit: false, show: true, list: true, filter: true }
      },
      email: { position: -1 },
      role: { position: 1 },
      password: { isVisible: false },
      _password: { 
        isVisible: {list: false, edit: true, filter: false, show: false, new: true},
      }
    },
    actions: {
      new: {
        before: async (request) => {
          if(request.payload.password) {
            request.payload = {
              ...request.payload,
              password: await bcrypt.hash(request.payload.password, 12),
              _password: undefined,
            }
          }
          return request
        },
        isAccessible: accessibleTo(['CREATOR', 'SUPER_ADMIN']),
      },
      delete: {
        isAccessible: accessibleTo(['CREATOR', 'SUPER_ADMIN']),
      },
      edit: {
        isAccessible: accessibleTo(['CREATOR', 'SUPER_ADMIN']),
      }
    }
  }
};

const taskResource = { 
  resource: models.tasks, 
  options: { 
    properties: {
      id: {
        isVisible: { edit: false, show: true, list: true, filter: true }
      },
      color: { position: 1 }
    }
  }
};

const statusResource = { 
  resource: models.statuses, 
  options: { 
    properties: {
      id: { 
        position: -1,
        isVisible: { edit: false, show: true, list: true, filter: true }
      },
      task_id: { position: 1 },
      status: { position: 2 },
      date: { position: 3 },
      owner: { position: 4 },
    }
  }
};

const AdminBroOptions = {
  // databases: [db],
  resources: [
    userResource,
    taskResource,
    statusResource,
  ],
  rootPath: '/admin',
  name: "Pipisasa",
  branding: {
    companyName: 'Makers Checklist Admin Panel',
    favicon: '/favicon.ico'
  },
};

module.exports = AdminBroOptions;