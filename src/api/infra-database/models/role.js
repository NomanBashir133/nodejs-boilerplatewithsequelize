'use strict';
module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    roleTitle: DataTypes.STRING
  }, {});
  Roles.associate = function(models) {
    // associations can be defined here
    Roles.belongsTo(models.Users);
  };
  return Roles;
};