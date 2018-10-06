// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env } = require('./config/vars');
const app = require('./config/express');
const logger = require('./config/logger');

//imorting sequlize mondel
const sequelize = require('./api/infra-database/models/index');

// listen to requests
app.listen(port, () => console.log(`server started on port ${port} (${env})`));

/**
* Exports express
* @public
*/
module.exports = app;
