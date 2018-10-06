const APIError = require('./APIError');
const httpStatus = require('http-status');

class StringUtil  {

    splitStringOnFirstSpace(stringToSplit) {
        try {
            if(!stringToSplit || typeof stringToSplit != 'string') {
                throw new APIError("Internal Server Error" , httpStatus.INTERNAL_SERVER_ERROR);
            } 

            let newNameObj = {};

            let fullName = stringToSplit.split(' ');
            newNameObj.firstName = fullName[0],
            newNameObj.lastName = fullName[fullName.length - 1];
            return newNameObj;        

        } catch(err) {
            throw err;
        }
    }
    
}

let instance = new StringUtil();

module.exports =  instance;