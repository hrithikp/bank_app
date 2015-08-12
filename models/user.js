'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    fullname: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Account)
      }
    }
  });
  return User;
};