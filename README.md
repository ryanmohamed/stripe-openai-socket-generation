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
