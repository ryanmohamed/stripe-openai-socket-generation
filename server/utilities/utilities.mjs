/*
    Fisher-Yates algorithm to shuffle an array randomly
*/
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
/*
    namespaces: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>[]
    returns: { name: string, image: url }[]
*/
export const getConnections = async (namespaces) => {
    let connections = [];
    for (let namespace of namespaces) {
        let sockets = await namespace.fetchSockets();
        for (let socket of sockets) {
            // normalize user data as we don't know if we have public connections without any auth
            const data = socket.handshake?.auth?.data?.user;
            const user = {
                name: data?.name || "Anonymous",
                image: data?.image || "http://placeholder.co/500/500"
            };
            connections.push(user);
        }
    }
    return shuffleArray(connections); // so user doesn't see only members of one namespace (all publics added, then private added, order causes problems)
};
/*
    emittingNamespace: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    namespaces: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>[]
    users { name: string, image: url }[]
*/
export const emitConnectionCount = (namespaces, emittingNamespace) => {
    getConnections(namespaces)
        .then((users) => {
        console.log("Sending updated connection count...");
        emittingNamespace.emit("connection-count", {
            data: users,
            status: "ok"
        });
    });
};
/*
    room: string
    emittingNamespace: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
*/
export const handlePoolUpdate = (room, nsp) => {
    const rooms = nsp.adapter.rooms; //Map<Room, Set<SocketId>>
    const count = rooms.get("pool")?.size || 0;
    nsp.to("pool").emit("pool-count", count);
};
/*
    Core services found in both the public and authenticated namespaces
    namespace: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
*/
export const coreServices = (emitTotalConnections, socket) => {
    emitTotalConnections();
    // response to client emitWithAck
    socket.on("get:connection-count", (foo, callback) => {
        console.log("Sending requested connection count...");
        emitTotalConnections();
    });
    socket.on("disconnect", () => {
        console.log(`Public connection disconnected: ${socket.id}!`);
        emitTotalConnections();
    });
};
/*
    namespace: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
*/
export const generateRoomId = (namespace) => {
    const fn = () => {
        const alphabet = "123456789";
        let string = "";
        for (let i = 0; i < 6; i++) {
            const idx = Math.floor(Math.random() * alphabet.length);
            string += (alphabet[idx]);
        }
        return string;
    };
    const rooms = namespace.adapter.rooms; // Map<string, Set<string>>
    let roomID = fn();
    while (rooms.get(roomID) !== null && rooms.get(roomID) !== undefined)
        roomID = fn();
    return roomID;
};
/*
    emittingNamespace: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    socketID: string
    event: string
    errorMessage: string
*/
export const ackError = (emittingNamespace, socketID, event, errorMessage) => {
    emittingNamespace.to(socketID).emit(event, {
        data: null,
        status: "error",
        errorMessage: errorMessage
    });
};
/*
    room: string
    members: { name: string, image: string }[] | undefined | null
*/
export const getRoomMembers = (namespace, room) => {
    const sids = namespace.adapter.rooms?.get(room); // Set<string> | undefined
    // no room found -> no members
    if (sids === undefined || sids === null)
        return null;
    const members = Array.from(sids).map((sid) => {
        const socket = namespace.sockets.get(sid);
        const data = socket?.handshake?.auth?.data?.user;
        return {
            id: socket?.sessionID || "not-found",
            name: data?.name || "Anonymous",
            image: data?.image || "http://placeholder.co/500/500"
        };
    });
    return members;
};
export const getNewRoomData = async (nsp, room, redisClient) => {
    /*
        retrieve room data from redis
        update with new contents according to managed rooms map
        *** potentially gets called after the room has been deleted
    */
    const value = await redisClient.get(room);
    if (value === null || value === undefined)
        return null;
    const members = getRoomMembers(nsp, room);
    if ((!members || members.length == 0) && room !== "pool") {
        await redisClient.del(room);
        return null;
    }
    const oldRoomData = JSON.parse(value);
    let adminID = oldRoomData.admin;
    // check if the admin is still among the members
    const newMembers = getRoomMembers(nsp, room);
    const sids = nsp.adapter.rooms.get(room);
    if (sids && !sids.has(adminID)) {
        adminID = sids ? Array.from(sids)[0] : null;
    }
    const roomData = {
        roomID: oldRoomData.roomID,
        admin: adminID,
        status: oldRoomData.status,
        members: newMembers,
        currentQuestion: oldRoomData?.currentQuestion,
        questionNum: oldRoomData?.questionNum
    };
    const newRoomDataString = JSON.stringify(roomData);
    const response = await redisClient.set(room, newRoomDataString);
    if (response)
        return roomData;
    return null;
};
export const handleMemberCountChange = async (nsp, room, redisClient, id = null) => {
    /*
        Function will be called for a few events
            1. User creates a room
            2. User joins a room
            3. User leaves a room
            4. Anyone joins the pool
        Emitted to
            1. Creator
            2. Joiner
            3. Leaver
            4. Anyone in affected room
    */
    // get previous redis record
    const roomData = await getNewRoomData(nsp, room, redisClient);
    if (roomData) {
        // if the change happened to the pool, tell everyone
        const cc = room === "pool" ? nsp : nsp.to(room);
        cc.emit("update:room-count", {
            data: roomData,
            status: "ok"
        });
        // update changer if needed
        if (id) {
            const socket = nsp.sockets.get(id);
            socket && nsp.to(socket?.sessionID || socket.id).emit("update:room-count", {
                data: roomData,
                status: "ok"
            });
        }
    }
};
export const leaveAllRooms = (nsp, socket, redisClient) => {
    const rooms = nsp.adapter.sids.get(socket.id);
    if (rooms) {
        for (let room of Array.from(rooms)) {
            if (room !== socket.id && room !== socket?.sessionID)
                socket.leave(room);
            handleMemberCountChange(nsp, room, redisClient); // update members of that room as this client leaves TEMPORARY
        }
    }
};
/*
    Preventative utilities
*/
export const isInRoom = (nsp, socket, room) => {
    const rooms = nsp.adapter.sids.get(socket.id);
    if (!rooms)
        return false;
    if (rooms.has(room))
        return true;
    return false;
};
/*
    Used exclusively for client created rooms and the pool
*/
export const getCurrentRoom = (socket) => {
    const rooms = socket.rooms;
    for (let room of Array.from(rooms)) {
        if (room.match(/^\d{6}$/) || room === "pool")
            return room;
    }
    return null;
};
export const isValidRoomID = (roomID) => {
    if (roomID === null || roomID === undefined || !roomID.match(/^\d{6}$/)) {
        return false; // invalid format
    }
    return true;
};
export const roomExists = (nsp, roomID) => {
    const room = nsp.adapter.rooms.get(roomID);
    if (room === null || room === undefined)
        return false;
    return true;
};
