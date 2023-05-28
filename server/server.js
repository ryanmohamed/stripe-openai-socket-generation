const express = require('express');
const app = express();
const port = 3001;

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('A user has connected!')
    console.log(`${socket.handshake.url}`)
    console.log(`Socket information: ${JSON.stringify(socket.handshake.auth)}`)

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} has disconnected...`)
    });

});

server.listen(port, () => console.log(`Listening on ${port}...`));

