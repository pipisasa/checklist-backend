const { Sequelize, DataTypes, BOOLEAN } = require('sequelize');

const {
  STRING,
  INTEGER,
  DATE,
  FLOAT,
  TEXT,
} = DataTypes;

const USER_ROLE_ENUM = DataTypes.ENUM(
  "USER",
  "ADMIN",
  "SUPER_ADMIN",
  "CREATOR"
);

const db = new Sequelize(process.env.DATABASE_URI,{
  // logging: console.log,
  logging: false,
});

const models = {};

models.users = db.define('user',{
  email: {
    type: STRING, allowNull: false, unique: true,
  },
  password: {
    type: STRING, allowNull: false,
  },
  role: {
    type: USER_ROLE_ENUM, allowNull: false,
  },
  createdAt: DATE,
  updatedAt: DATE,
});

models.statuses = db.define('status',{
  date: DATE,
  status: {type: BOOLEAN, defaultValue: false, allowNull: false},
  createdAt: DATE,
  updatedAt: DATE,
});

models.tasks = db.define('task',{
  title: { type: STRING, allowNull: false },
  color: { type: STRING, defaultValue: "inherit" },
  createdAt: DATE,
  updatedAt: DATE,
})


models.statuses.belongsTo(models.users, { foreignKey: "owner" });
models.tasks.belongsTo(models.users, { foreignKey: "owner" });
models.statuses.belongsTo(models.tasks, { foreignKey: "task_id" })
module.exports = {db, models};