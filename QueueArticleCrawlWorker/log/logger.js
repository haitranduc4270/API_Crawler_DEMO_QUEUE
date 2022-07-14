const winston = require ('winston');



function cusLogger(filename, level) {

    const logger = winston.createLogger({
        transports: [
            new winston.transports.File({
                filename: filename,
                level: level,
            
                format: winston.format.json()
            }),
        ]
    });
       
    return logger;
}

module.exports = {
    cusLogger,
}