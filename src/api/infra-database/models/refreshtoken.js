'use strict';
const Sequelize = require('sequelize');
const crypto = require('crypto');
const moment = require('moment-timezone');

module.exports = (sequelize, DataTypes) => {
  const RefreshTokens = sequelize.define('RefreshTokens', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    token: {
      type: Sequelize.STRING
    },
    expire: {
      allowNull: false,
      type: Sequelize.DATE
    },
    userId: {
      type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
      }
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }, {});
  RefreshTokens.associate = function(models) {
    // associations can be defined here
    RefreshTokens.belongsTo(models.Users);
  };

    /**
   * Generate a refresh token object and saves it into the database
   *
   * @param {User} user
   * @returns {RefreshToken}
   */
  RefreshTokens.generate = async (user , transaction) => {
    try {
      const token = `${user.id}.${crypto.randomBytes(40).toString('hex')}`;
      const expire = moment().add(30, 'days').toDate();
      const tokenObject = new RefreshTokens({
        token, expire
      });
      await tokenObject.save(transaction);
      return tokenObject;
    } catch(err) {
      throw new Error(err);
    }
  }
    


  return RefreshTokens;
};