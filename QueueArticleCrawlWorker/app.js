require("dotenv").config();
const queue = require('./service/queue');
queue.listenRequestQueue();


