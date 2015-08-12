'use strict';
module.exports = function(sequelize, DataTypes) {
  var Transaction = sequelize.define('Transaction', {
    type: DataTypes.STRING,
    desc: DataTypes.TEXT,
    amount: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        Transaction.belongsTo(models.Account)
      }
    }
  });
  return Transaction;
};