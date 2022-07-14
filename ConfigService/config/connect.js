const mongoose = require ('mongoose');

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_NEWS_SERVICE_URL);
        console.log('connect successfuly');
    }
    catch(error) {
        console.log('connect faile');
        console.log(error);
    }

}

module.exports = { connect };