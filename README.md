# Stripe OpenAI Sockets with T3 stack, Express and PostgreSQL

![demo image](https://i.ibb.co/7GPZ3Bm/Screen-Shot-2023-06-10-at-1-46-27-AM.png)

## Validating connections to the socket server
**See branch `socket-connection`**
Some key points to keep in mind:
1. `next-auth` allows authentication with many different providers
2. `next-auth` supports different **session** strategies (e.g. "jwt" | "database)
3. We implement the `database` strategy. 

To stick with conventions, keep the isolations of full-stack web app and external game server, and avoid creating new data we'll proceed with the `database` strategy and build around it. 

### Pipeline
1. Client requests server route /api/auth/signin 
2. `Session` created in database with `userId` and `expires` timestamp
3. Client side request to Socket-Server
4. Socket-Server middleware validates requesting `User`'s `Session`

### Todo:
Implemented context for requesting and listening to pool conneciton count via acknowledgements. 

Uses our preexisting channel which requires authentication.

Connection isn't protected, so we should implement 2 namespaces. A public channel with no middleware, and an authenticated channel with our previously added session token method. 

Isolates public and protected socket information and allows realtime data flow for any client. 

## Namespaces for authenticated and public realtime data
Data like the number of connections should be emitted to any client irrespective of session information. Therefore we establish two namespaces for authenticated and public data flow.

### Logs 
1. Public and private namespaces added to socket server
2. Refactored client connection to connect to and disconnect from the appropriate namespace.
3. Refactored context to cleanly apply and remove listers for socket events
4. Implemented use of useConnectionCount hook

### Todo:
1. Implement same functionality for pool connections (private connections)
2. Implement **User Credits** functionality, add to middleware checks performed by socket server

### User Credits Notes
User credits are...user specific. Meaning we should implement client-cide data-fetching. 

Reasons for this are as follows:
1. Server side props unnecessary and cumbersome to add to every page
2. Credits are mounted only for signed in users, meaning we should implement at the component level.
3. TRPC router handlers handle authentication validation and query for token on the server side. Handles database operations (controller) away from the client and simply returns a count. 

## TRPC routes for Token retrieval

### Logs
1. Added protected TRPC for obtaining credit amount for signed in users.
2. Procedure queries Postgres database using PK in session information for scalar balance value.
3. Rendering of component handled by parent to avoid inequal renders of useQuery hook. 

#### Todo:
1. Stripe payment required for writing to balance column. 

## RoomContext for realtime Room state

### Logs
1. Protected room and root account paths.
2. Added socket events action:create-room & ack:create-room.
3. Created hook for creating room and updating a component similar to clash of codes starter match .

### Todo:  
1. Add persistence to client component `CreateRoom`, when the user changes routes, the room is still created but the component remounts itself to it's original state, allowing user to create more than one active room at a time, not good :(.
2. Isolate member component for re-use across app, specifically for `CreateRoom` and `JoinLink` components.
3. Create JoinLink component displaying users in a room and a button to join it
4. Add server logic to ack the information about the users in client's current room
5. Add server logic to ack information about atleast 10 rooms (leave room for pagination)

### Logs
- [x] Room Context for room information persistence.
- [x] Leave room action and acknowledgement events 
- [x] Room Context
- [x] Update room context on edge case events like force refresh

## Node.js + Typescript 

### Logs
- [x] Added Typescript to server for more stable module development.
- [x] Refactored events into more general, reusable events that update a **changer**, and the **affected** in real time.
- [x] Refactored events on client side in `RoomContext`.
- [x] Added conditional room panel to create & join rooms, view members once joined.

## Introduction of Redis for Room Data Synchronization
### Rationales
1. Redis provides a more robust, best practice way to store potentially 1 million JSON formatted records than storing in program locally as a Map. 
2. Acts as single source of truth for all rooms and their respective connected members. 
3. **Memory Efficiency**: Redis is designed to efficiently manage data in memory, making it more optimized for storing large datasets compared to keeping them in the memory of a running program.
4. **Persistence**: Redis provides options for persisting data on disk, allowing you to maintain the dataset even after restarting the server or in case of system failures.
5. **Scalability**: Redis is designed to handle large datasets and can be easily scaled horizontally through mechanisms like clustering and replication.
6. **Performance**: Redis is known for its fast read and write operations, thanks to its in-memory nature and optimized data structures. (realtime application, data should be gathered faster than querying a DB)
7. **Simiplicity**: Redis offers a straightforward and consistent API, making it easier to integrate with Node.js in this case. 
8. **ETC** & **K.I.S.S.**!
  
**Keep in mind** this Redis implementation should not be exposed to the internet, and should only accept connections from the socket-server instance the 2 are running on. Consider adding `requirepass` and `bind` in the deployed instances' `redis.conf` file. See more information [here.](https://redis.io/docs/management/security/)

### Gettting Started
Run the Redis server for development purposes with
```bash
    cd server
    redis-server 
```

Test the client connection (socket-server) to Redis server. 
```bash
    cd server
    redis-cli
```

Add dependency to Node
```bash
    npm install redis
```

### Logs 
1. Major refactor to socket server code, reusability, clarity, and harnessing the power of events to distribute data in real time to many different clients. 
2. Replaced local JS map with Redis key-value pairs.
3. Records created, updated, and deleted based on rooms events of same names.
4. Refactored client side room context. Established clear seperation of pool and room count logic while using the same event `update:room-count`.
   1. Changes to the pool are emitted to all authenticated connections, irrespective of whether they are in the pool or not.
   2. Room updates with the `roomID` "pool" are handled by `usePoolCount` hook.
   3. `RoomContext` foundational state like `roomID` and `roomData` can only be changed by an ACK made by the socket server for the events `ack:create-room`, `ack:update-room`, `ack:delete-room` as these explcitally imply the room the client is in. Whereas updates only inform us of changes made to any rooms we made be in, have left, or have altered.

### To Do:
1. Continue to refactor and remove repititions in the server code.
2. Do major cleanup on client side code and ensure type safety for all contexts.
3. Implement Admin functionality and handling. 
4. Joinable rooms pagination. 
5. Restyle `RoomPanel` 
6. Stronger error messages on ack events from the server. 

## Logs
1. Refactored client side code
2. Fixed some edge cases on server side
3. Added some styles for the room page

![room page example](https://i.ibb.co/kM002T1/Screen-Shot-2023-06-10-at-1-46-08-AM.png)
![room connection example](https://i.ibb.co/7rWJKfX/Screen-Shot-2023-06-10-at-1-50-24-AM.png)


### To Do:
1. Handle socket disconnections, when the server abruptly shuts down the rooms in progress should be 
