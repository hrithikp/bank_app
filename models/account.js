'use strict';
module.exports = function(sequelize, DataTypes) {
  var Account = sequelize.define('Account', {
    uuid: DataTypes.STRING,
    type: DataTypes.STRING,
    balance: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        Account.belongsTo(models.User)
        Account.hasMany(models.Transaction)
      }
    }
  });
  return Account;
};