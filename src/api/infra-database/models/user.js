'use strict';
const Sequelize = require('sequelize');
const crypto = require('crypto');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('../../utils/APIError');
const { env, jwtSecret, jwtExpirationInterval } = require('../../../config/vars');



module.exports = (sequelize, DataTypes) => {
  let saltRound = 10;

  let Users = sequelize.define('Users', {

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
    }

  }, {
    hooks : {
      beforeCreate : async (user , option) => {
        const passwordHash = await user.generateHash(user.dataValues.passwordHash);
        user.passwordHash = passwordHash;
      }
    },
    freezeTableName: true

  });

  // instance Method
  Users.prototype.generateHash = async (password) => {
    try {
      return await bcrypt.hash(password, saltRound);
    } catch(err) {
      throw err;
    }
    
  };

  Users.prototype.passwordMatches =  async function (passwordAttempt) {
    return bcrypt.compare(passwordAttempt, this.passwordHash);
  };

  Users.prototype.transform =  function () {
      let user =  this.dataValues;
      delete user.passwordHash;
      delete user.salt;
      return user;
  } 

  Users.prototype.token = function() {
    const playload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this.id,
    };
    return jwt.encode(playload, jwtSecret);
  };

  
  Users.associate = function(models) {
    // associations can be defined here
    Users.hasOne(models.Roles);
    Users.hasOne(models.RefreshTokens);

  };

   /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<Users, APIError>}
   */
  Users.get = async (id) => {
    try {
      let user;

      if (id) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'Users does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  }

    /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<Users, APIError>}
   */
  Users.findAndGenerateToken = async function (options) {
    try {
      const { email, password, refreshObject } = options;
      if (!email) throw new APIError({ message: 'An email is required to generate a token' });
  
      const user = await this.findOne({ email });
      const err = {
        status: httpStatus.UNAUTHORIZED,
        isPublic: true,
      };
      if (password) {
        if (user && await user.passwordMatches(password)) {
          return { user, accessToken: user.token() };
        }
        err.message = 'Incorrect email or password';
      } else if (refreshObject && refreshObject.userEmail === email) {
        if (moment(refreshObject.expires).isBefore()) {
          err.message = 'Invalid refresh token.';
        } else {
          return { user, accessToken: user.token() };
        }
      } else {
        err.message = 'Incorrect email or refreshToken';
      }
      throw new APIError(err);
    } catch(err) {
      throw err;
    }
    
  }

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<Users[]>}
   */
  Users.list = ({page = 1, perPage = 30, name, email, role}) => {
    const options = omitBy({ name, email, role }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  }


  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  Users.checkDuplicateEmail = (error) => {
    try {
      if (error && error.original && error.original.code === 'ER_DUP_ENTRY' && error.original.errno === 1062) {
        return new APIError({
          message: 'Validation Error',
          errors: [{
            field: 'email',
            location: 'body',
            messages: ['"email" already exists'],
          }],
          status: httpStatus.CONFLICT,
          isPublic: true,
          stack: error.stack,
        });
      }
      return error;
    } catch(err) {
      throw err;
    }

  }

  return Users;

};