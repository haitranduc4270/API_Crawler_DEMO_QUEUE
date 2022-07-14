#!/usr/bin/env node

var amqplib = require('amqplib');

let sum = 0;

async function addToTaskQueue (taskList) {
    try{
        const connection  = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel();

        var queue = 'task_queue';
            
        await channel.assertQueue(queue, {
            durable: true
        });
        

        for(let i = 0; i < taskList.length; i++ ){
            if(taskList[i].link){
                sum += 1;
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(taskList[i])), {
                    persistent: true
                });
                console.log(" [x] Sent " + sum + ' ' + taskList[i].link);
            }
        }
        
        setTimeout(function() {
            
            connection.close();
        }, 10000);
    }
    catch(err) {
        console.log(err);
    }
        
}


module.exports = {
    addToTaskQueue
}