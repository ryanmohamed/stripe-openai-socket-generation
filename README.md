# Stripe OpenAI Sockets with T3 stack, Express and PostgreSQL

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

## Logs 
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

## Logs
1. Added protected TRPC for obtaining credit amount for signed in users.
2. Procedure queries Postgres database using PK in session information for scalar balance value.
3. Rendering of component handled by parent to avoid inequal renders of useQuery hook. 

### Todo:
1. Stripe payment required for writing to balance column. 