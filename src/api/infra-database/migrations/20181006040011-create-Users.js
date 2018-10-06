'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullName: {
        type: Sequelize.STRING,
        required : true
      },
      firstName: {
        type: Sequelize.STRING,
        required : true
      },
      lastName: {
        type: Sequelize.STRING,
        required : true
      },
      email: {
        type: Sequelize.STRING,
        required : true,
        unique: true
      },
      passwordHash: {
        type: Sequelize.STRING,
        required : true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      RoleId: {
        type: Sequelize.INTEGER,
          references: {
            model: "Roles",
            key: "id"
        }
      },
      RefreshTokenId: {
        type: Sequelize.INTEGER,
          references: {
            model: "RefreshTokens",
            key: "id"
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};