require("dotenv").config();
const crawer = require('./service/crawler');

async function startup () {
    await crawer.scrapeAll();
}

startup();