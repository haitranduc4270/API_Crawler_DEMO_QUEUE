require("dotenv").config();
const crawer = require('./service/crawler');

const { logger } = require('./service/log/logger');
const db = require('./config/connect')
db.connect();



async function startup () {
    await crawer.scrapeAll();
}

startup();

// setTimeout(function() {
//     process.exit(0);
// }, 1000000)

