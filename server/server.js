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

import { getConnectionCount, getRoomCount } from "./utilities.mjs"

const publicNamespace = io.of('/');
const authenticatedNamespace = io.of('/authenticated');

// publicNamespace.adapter.on("create-room", (room) => {
//     const pool = () => {
//         publicNamespace.emit("connection-count", getConnectionCount([publicNamespace, authenticatedNamespace]));
//     }
//     const thing =  [
//         [ "pool", pool ]
//     ];
//     const map = new Map(thing);
//     const fn = map.get(room);
//     fn && fn();
// });

// public namespace only responsible for read only information for all clients 
publicNamespace.on("connection", (socket) => {
    const emitConnectionCount = () => {
        getConnectionCount([publicNamespace, authenticatedNamespace])
        .then((count) => {
            console.log("Sending updated connection count...");
            publicNamespace.emit("connection-count", {
                count: count,
                status: "ok"
            });
        }) 
    }

    console.log(`New public connection: ${socket.id}!\n`);
    emitConnectionCount();
    
    // response to client emitWithAck
    socket.on("get:connection-count", (foo, callback) => {
        console.log("Sending requested connection count...");
        emitConnectionCount();
    });
    
    socket.on("disconnect", () => {
        console.log(`Public connection disconnected: ${socket.id}!`);
        emitConnectionCount();
    });
});

// middleware to validate incoming session token cookie against values in database
authenticatedNamespace.use((socket, next) => {
    console.log(`Socket ${socket.id} attempting to connect to authenticated namespace...`)
    // full-stack app appends cookies to client requests
    const cookies = socket.request.headers?.cookie?.split('; ');
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

authenticatedNamespace.on('connection', (socket) => {

    const emitConnectionCount = () => {
        getConnectionCount([publicNamespace, authenticatedNamespace])
        .then((count) => {
            console.log("Sending updated connection count...");
            authenticatedNamespace.emit("connection-count", {
                count: count,
                status: "ok"
            });
        }) 
    }

    console.log(`\nNew private connection: ${socket.id}!`);
    console.log(`Placing ${socket.id} into general pool...`)
    socket.join("pool");
    emitConnectionCount();
    
    // response to client emitWithAck
    socket.on("get:connection-count", (foo, callback) => {
        console.log("Sending requested connection count...");
        emitConnectionCount();
    });
    
    socket.on("disconnect", () => {
        console.log(`Public connection disconnected: ${socket.id}!`);
        emitConnectionCount();
    });
});

server.listen(port, () => console.log(`Listening on ${port}...`));

