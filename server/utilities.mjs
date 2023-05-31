/*
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    room: string
*/
export const getRoomCount = (io, room) => {
    const rooms = io.of("/").adapter.rooms; // Map<Room, Set<SocketId>>
    const roomSet = rooms.get(room); // Set<SocketId>
    return roomSet?.size || 0;
};

export const getConnectionCount = async (namespaces) => {
    let count = 0;
    for (let namespace of namespaces) {
        let sockets = await namespace.fetchSockets();
        count += sockets.length;
    }
    return count;
};