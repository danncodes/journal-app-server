const { Sequelize, Model, DataTypes } = require("sequelize");
const path = require("path");

class Users extends Model{}
class Entries extends Model{}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, "db.sqlite") // Potencial Production Issue
  });


Users.init({
    uid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Users' 
  });

  Entries.init({
    entryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entry: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: true
  },
  public: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  emotion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  }
  }, {
    sequelize,
    modelName: 'Entries'
  });


Users.hasMany(Entries)
Entries.belongsTo(Users)

// sequelize.sync({force: true})


module.exports = { sequelize, Users, Entries };