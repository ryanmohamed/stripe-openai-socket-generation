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

import { getRoomCount } from "./utilities.mjs"

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

// room events
io.of("/").adapter.on("create-room", (room) => {

});
io.of("/").adapter.on("delete-room", (room) => {

});

io.of("/").adapter.on("join-room", (room, id) => {
    const pool = () => {
        io.to("pool").emit("connection-count", getRoomCount(io, room));
    }
    const thing =  [
        [ "pool", pool ]
    ];
    const map = new Map(thing);
    const fn = map.get(room);
    fn && fn();
});

io.of("/").adapter.on("leave-room", (room, id) => {

});

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} has succesfully connected!`)
    console.log(`Placing ${socket.id} into general pool...`)
    socket.join("pool");

    socket.on("get:connection-count", (foo, callback) => {
        console.log("Requested connection count.");
        callback({
            count: getRoomCount(io, 'pool'),
            status: "ok"
        });
    });


    socket.on('disconnect', () => {
        console.log(`User ${socket.id} has disconnected...`)
    });
});

server.listen(port, () => console.log(`Listening on ${port}...`));

