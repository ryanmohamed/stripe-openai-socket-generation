import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import express from "express";
const app = express();
const port = 3001;

import http from "http";
const server = http.createServer(app);

import { Server } from "socket.io";
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
});

// middleware to validate incoming session token cookie against values in database
io.use((socket, next) => {
    console.log(`Socket ${socket.id} attempting to connect...`)
    // full-stack app appends cookies to client requests
    const cookies = socket.request.headers.cookie.split('; ');
    const sessionTokenCookie = cookies.find(cookie => cookie.startsWith('next-auth.session-token='));
    if (!sessionTokenCookie) return next(new Error("No session token cookie found."));
    const sessionToken = sessionTokenCookie.split("=")[1];

    // get user information
    const authData = socket.handshake.auth.data;
    if (!authData) return next(new Error("No authentication data found"));
    const { user } = authData;

    // find by unique identifier
    prisma.session.findUnique({ where: { sessionToken: sessionToken } })
    .then((session) => {
        // does the record match the provided user and not expired?
        const isSameUser = session.userId == user.id;
        const isExpired = session.expires < new Date();
        if (!isSameUser) return next(new Error(`Session token user does not match auth user.`));
        else if (isExpired) return next(new Error(`Session token is expired.`));
        else {
            console.log(`Found valid session token: ${session.sessionToken}\n`);
            next(); // proceed 
        }
    })
    .catch((error) => {
        console.log(`No session token found for user ${user.id}.\n`);
        return next(new Error(`No session token found for user ${user.id}.\n`));
    })
});

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} has succesfully connected!`)

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} has disconnected...`)
    });

});

server.listen(port, () => console.log(`Listening on ${port}...`));

