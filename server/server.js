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

import { coreServices, emitConnectionCount, generateRoomId, handlePoolUpdate } from "./utilities.mjs"

const pnsp = io.of('/');
const ansp = io.of('/authenticated');

// public namespace only responsible for read only information for all clients 
pnsp.on("connection", (socket) => {
    const emitTotalConnections = () => emitConnectionCount([pnsp, ansp], pnsp);
    coreServices(emitTotalConnections, socket);
    console.log(`New public connection: ${socket.id}!\n`);
});

const roomMap = new Map();
roomMap.set("123456", {
    status: "waiting", // "waiting" | "ready",
    members: new Set(), // // Set<string>,
    currentQuestion: null, 
});

// middleware to validate incoming session token cookie against values in database
ansp.use((socket, next) => {
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

ansp.on('connection', (socket) => {
    const emitTotalConnections = () => emitConnectionCount([pnsp, ansp], ansp);
    coreServices(emitTotalConnections, socket);
    console.log(`\nNew private connection: ${socket.id}!`);
    console.log(`Placing ${socket.id} into general pool...`)
    socket.join("pool");

    // response to client emitWithAck
    socket.on("get:pool-count", (foo, callback) => {
        console.log("Sending requested pool count...");
        const count = ansp.adapter.rooms.get("pool").size;
        ansp.to(socket.id).emit("pool-count", {
            data: count,
            status: "ok"
        }); // emit to requester
    });

    // response to client emitWithAck
    socket.on("action:new-room", () => {
        const data = socket.handshake?.auth?.data?.user
        const rooms = ansp.adapter.rooms; // Map<string, Set<string>>
       
        // 10^6 = 1000000
        if (rooms.size === 1000000 || !data)
            ansp.to(socket.id).emit("new-room", {
                data: null,
                status: "error"
            });

        else {
            let idString = generateRoomId();
            while (rooms.get(idString) !== null && rooms.get(idString) !== undefined) 
                idString = generateRoomId();
            
            // create room socket and connect client, emit id to client, store client info
            const user = {
                name: data?.name || "Anonymous",
                image: data?.image || "http://placeholder.co/500/500"
            }
            socket.join(idString);
            const members = new Set();
            members.add(user);
            const roomData = {
                roomID: idString,
                status: "waiting", // "waiting" | "ready",
                members: [user], // // Set<string>,
                currentQuestion: null, 
            };
            roomMap.set(idString, roomData);
            ansp.to(socket.id).emit("ack:new-room", {
                data: roomData,
                status: "ok"
            }); // emit to requester
        
        }
    });

    // response to client emitWithAck
    socket.on("action:join-room", (roomID) => {
        const rooms = ansp.adapter.rooms;
        // if recieved non string or non 6 digit string
        if (typeof roomID !== "string" || roomID.match(/^\d{6}$/)) {
            ansp.to(socket.id).emit("join-room", {
                data: null,
                status: "error"
            });
        }

        // if room exists already 
        else if (rooms.get(roomID) !== undefined && rooms.get(roomID) !== null){
            // to do
        }
        
        // create room, store user information in map 
        else {  
            socket.join(roomID); // create-room called as side-effect
            ansp.to(socket.id).emit("join-room", {
                data: null,
                status: "ok"
            });
        }
    });

    // response to client emitWithAck
    socket.on("action:leave-room", (roomID) => {
        const rooms = ansp.adapter.rooms;
        // if recieved non string or non 6 digit string
        const notValidID = typeof roomID !== "string" || !roomID.match(/^\d{6}$/);
        const doesNotExist = rooms.get(roomID) === undefined || rooms.get(roomID) === null
        const doesNotIncludeClient = !rooms?.get(roomID)?.has(socket.id);
        
        if (notValidID || doesNotExist || doesNotIncludeClient) {
            ansp.to(socket.id).emit("ack:left-room", {
                data: null,
                status: "error"
            });
        }
        
        // remove socket
        else {  
            socket.leave(roomID); // leave-room called as side-effect
            ansp.to(socket.id).emit("ack:left-room", {
                data: null,
                status: "ok"
            });
        }
    });

});

ansp.adapter.on("create-room", (room) => {
    console.log(`room ${room} was created`);
});

ansp.adapter.on("delete-room", (room) => {
    console.log(`room ${room} was deleted`);
});

ansp.adapter.on("join-room", (room, id) => {
    room === "pool" && handlePoolUpdate(room, ansp);
});

ansp.adapter.on("leave-room", (room, id) => {
    room === "pool" && handlePoolUpdate(room, ansp);
    console.log(`${id} left room ${room}`);
});

server.listen(port, () => console.log(`Listening on ${port}...`));

