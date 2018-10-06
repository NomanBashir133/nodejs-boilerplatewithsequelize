const httpStatus = require('http-status');
const sequelize = require('../infra-database/models/index').sequelize;
const Users = require('../infra-database/models/index').Users;
const RefreshTokens = require('../infra-database/models/index').RefreshTokens;
const moment = require('moment-timezone');
const { jwtExpirationInterval } = require('../../config/vars');
const stringUtils = require('../utils/stringUtil');

/**
* Returns a formated object with tokens
* @private
*/
async function generateTokenResponse(user, accessToken , transaction) {
  try {
    const tokenType = 'Bearer';
    return RefreshTokens.generate(user , transaction)
    .then((refreshToken) => {
      const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
      return {
        tokenType, accessToken, refreshToken, expiresIn,
      };
    }).catch((err) => {
      throw err;
    });
   
  } catch(err) {
    throw err;
  }
}

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  let t = await sequelize.transaction();

  try {
    
    let firstNameLastNameObj = stringUtils.splitStringOnFirstSpace(req.body.fullName);
    req.body.firstName = firstNameLastNameObj.firstName;
    req.body.lastName = firstNameLastNameObj.lastName;
    req.body.passwordHash = req.body.password;
    const user = await (new Users(req.body)).save({transaction: t});
    const userTransformed = user.transform(user);
    const token = await generateTokenResponse(userTransformed, user.token() , {transaction: t});
    res.status(httpStatus.CREATED);
    t.commit();
    return res.json({ token, user: userTransformed });
  
  } catch (error) {
    t.rollback();
    return next(Users.checkDuplicateEmail(error));
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await Users.findAndGenerateToken(req.body);
    const token = await generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async (req, res, next) => {
  try {
    const { user } = req;
    const accessToken = user.token();
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    });
    const { user, accessToken } = await Users.findAndGenerateToken({ email, refreshObject });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
