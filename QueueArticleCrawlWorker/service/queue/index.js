const amqplib = require('amqplib');
const articleCrawler = require('../crawler/index');

let i = 0;
async function listenRequestQueue () {

    var queue = 'task_queue';
    const conn = await amqplib.connect('amqp://localhost');
    const channel = await conn.createChannel();
    await channel.assertQueue(queue);

    while(1){

        let message = false; 
        message = await channel.get(queue);

        if(message){
            await articleCrawler.crawlArticle(JSON.parse(message.content.toString()));
            channel.ack(message);
        }
    }
};

module.exports = {
    listenRequestQueue
}