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
            const data = socket.handshake?.auth?.data?.user
            const user = {
                name: data?.name || "Anonymous",
                image: data?.image || "http://placeholder.co/500/500"
            }
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
    }) 
}

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
}