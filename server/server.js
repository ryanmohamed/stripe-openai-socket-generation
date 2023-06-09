import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import express from "express";
const app = express();
const port = 3001;

import http from "http";
const server = http.createServer(app);

import { Namespace, Server } from "socket.io";
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
});

// set up connection to redis 
import { createClient } from "redis";
const redisClient = createClient();

// TODO: 
// redisClient.auth('your_redis_password');

// TODO:
// redisClient.options... // Set any other necessary options here

redisClient.connect();

redisClient.on('connect', () => {
    console.log("Succesfully connect to Redis.\n\n");
})

redisClient.on('error', () => {
    console.log("Error connecting to Redis.\n\n");
})

import { ackError, coreServices, emitConnectionCount, generateRoomId, handlePoolUpdate, getRoomMembers, handleMemberCountChange, leaveAllRooms, getNewRoomData } from "./utilities/utilities.mjs";

const pnsp = io.of('/');
const ansp = io.of('/authenticated');

// public namespace only responsible for read only information for all clients 
pnsp.on("connection", (socket) => {
    const emitTotalConnections = () => emitConnectionCount([pnsp, ansp], pnsp);
    coreServices(emitTotalConnections, socket);
    console.log(`New public connection: ${socket.id}!\n`);
});

const roomMap = new Map();

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
    console.log(`\nNew private connection: ${socket.id}!\n`);
    socket.join("pool");

    // client explicity asks for a rooms count (i.e on mount)
    socket.on("get:room-count", async (room) => {
        // update requesters count only
        // changes to the members array are sent to entire room via callbacks 
        const roomData = await getNewRoomData(ansp, room, redisClient);
        ansp.to(socket.id).emit("ack:room-count", {
            data: roomData,
            status: "ok"
        });
    });

    // response to client emitWithAck
    socket.on("action:new-room", async () => {
        const data = socket.handshake?.auth?.data?.user
        const rooms = ansp.adapter.rooms; 
        if (rooms.size === 1000000)
            ackError(ansp, socket.id, "ack:new-room", "Too many active rooms.");
        else if (!data) 
            ackError(ansp, socket.id, "ack:new-room", "Connecting user has no session data.");

        else {
            const roomID = generateRoomId(ansp);
            
            // create room socket and connect client, emit id to client, store client info
            leaveAllRooms(ansp, socket, redisClient);
            socket.join(roomID);

            const members = [{
                name: data?.name || "Anonymous",
                image: data?.image || "http://placeholder.co/500/500"
            }];

            // data created
            const roomData = {
                roomID: roomID, // string
                admin: socket.id, // string
                status: "waiting", // "waiting" | "ready",
                members: members, // // { name: string, image: string }[],
                currentQuestion: null, 
            };

            // avoid overhead of redis type, centralize data as string
            const roomDataString = JSON.stringify(roomData);

            // written to redis
            const response = await redisClient.set(roomID, roomDataString);

            if (response) {
                ansp.to(socket.id).emit("ack:new-room", {
                    data: roomData,
                    status: "ok"
                }); // emit to requester
            }
        }
    });

    // response to client emitWithAck
    socket.on("action:join-room", async (roomID) => {
        const rooms = ansp.adapter.rooms;

        // if recieved non string or non 6 digit string
        if (typeof roomID !== "string" || !roomID.match(/^\d{6}$/)) {
            ackError(ansp, socket.id, "ack:join-room", "Bad room ID.");
        }

        // room doesn't exist
        else if (rooms.get(roomID) === undefined || rooms.get(roomID) === null){
            ackError(ansp, socket.id, "ack:join-room", "Room doesn't exist.");
        }
        
        // create room, store user information in map 
        else {  
            leaveAllRooms(ansp, socket, redisClient);
            socket.join(roomID); // create-room called as side-effect  
            // ack:join-room and ack:create-room update the clients room information, so we can't simply propogate change alone
            const roomData = await getNewRoomData(ansp, roomID, redisClient);
            ansp.to(socket.id).emit("ack:join-room", {
                data: roomData,
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
            socket.join("pool");
        }
    });
});

ansp.adapter.on("create-room", (room) => {
    console.log(`room ${room} was created`);
    // explicitly add a unique record for the pool
    if (room === "pool") {
        const roomData = {
            roomID: room,
            admin: null, 
            status: null, 
            members: getRoomMembers(ansp, room),
            currentQuestion: null, 
        };
        redisClient.set("pool", JSON.stringify(roomData));
        return;
    }
});

ansp.adapter.on("join-room", async (room, id) => {
    room === "pool" && handlePoolUpdate(room, ansp);
    console.log(`${id} joined room ${room}`);
    handleMemberCountChange(ansp, room, redisClient, id); // update room as well as client specifically
}); 

ansp.adapter.on("leave-room", (room, id) => {
    room === "pool" && handlePoolUpdate(room, ansp);
    console.log(`${id} left room ${room}`);
    handleMemberCountChange(ansp, room, redisClient, id); // update room as well as the changer
});

ansp.adapter.on("delete-room", async (room) => {
    await redisClient.del(room)
    handleMemberCountChange(ansp, room, redisClient);
    console.log(`room ${room} was deleted`);
});

server.listen(port, () => console.log(`Listening on ${port}...`));

