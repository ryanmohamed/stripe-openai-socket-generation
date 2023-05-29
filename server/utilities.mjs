/*
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    room: string
*/
export const getRoomCount = (io, room) => {
    const rooms = io.of("/").adapter.rooms; // Map<Room, Set<SocketId>>
    const roomSet = rooms.get(room); // Set<SocketId>
    return roomSet?.size || 0;
};