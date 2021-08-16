const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const amqp = require('amqplib/callback_api');

var corsOptions = {
  origin: "http://localhost:3000"
};

const optionsio={
  cors:true,
  origins:["http://localhost:3000"],
}


const port = process.env.PORT || 4001;
const index = require("./index");
const { options } = require("./index");

const app = express();

app.use(cors());
app.use(index);

const server = http.createServer(app);

const io = socketIo(server,optionsio);



let interval;

io.set

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }


  amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        var exchange = 'logs';

        channel.assertExchange(exchange, 'fanout', {
            durable: false
        });

        channel.assertQueue('', {
            exclusive: true
        }, function(error2, q) {
            if (error2) {
                throw error2;
            }
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
            channel.bindQueue(q.queue, exchange, '');

            channel.consume(q.queue, function(msg) {
                if (msg.content) {
                    console.log(msg.content.toString());
                    getApiAndEmit(socket,msg.content.toString())
                    
                }
            }, {
                noAck: true
            });
        });
    });
});

  
  //interval = setInterval(() => getApiAndEmit(socket,msg), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    //clearInterval(interval);
  });
});

const getApiAndEmit = (socket , message) => {

  socket.emit("FromAPI", message);

  // Emitting a new message. Will be consumed by the client
  
};

server.listen(port, () => console.log(`Listening on port ${port}`));