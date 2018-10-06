const Log4js = require('log4js');

const path = require('path');
const logPath = path.join(__dirname, './logs/development.log');
const logging = {
    appenders: {
        cheeseLogs: { type: 'file', filename: logPath },
        console: { type: 'console' }
      },
      categories: {
        cheese: { appenders: ['cheeseLogs'], level: 'error' },
        another: { appenders: ['console'], level: 'trace' },
        default: { appenders: ['console', 'cheeseLogs'], level: 'trace' }
      }
  }

module.exports = () => {
    Log4js.configure(logging);

    var logger = Log4js.getLogger();
    logger.level = 'debug';

    return logger;
};
