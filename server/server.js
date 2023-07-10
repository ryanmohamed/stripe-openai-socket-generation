import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import express from "express";
const app = express();
app.use(express.json());
const port = 3001;

import http, { get } from "http";
const server = http.createServer(app);

import { Namespace, Server } from "socket.io";
const io = new Server(server, {
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 2 * 60 * 1000,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: false,
    },
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



/* OPEN AI (TODO: MOVE TO CONFIG) */
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: process.env.OPEN_AI_ORG,
    apiKey: process.env.OPEN_AI_KEY
});

const openai = new OpenAIApi(configuration);

import { ackError, coreServices, emitConnectionCount, generateRoomId, handlePoolUpdate, getRoomMembers, handleMemberCountChange, leaveAllRooms, getNewRoomData, isInRoom, getCurrentRoom, isValidRoomID, roomExists } from "./utilities/utilities.mjs";

import { questions } from "./utilities/questions.mjs";

const pnsp = io.of('/');
const ansp = io.of('/authenticated');

// api middleware
/* TODO: parse token provided by requester */
app.use(async (req, res, next) => {
    //console.log("\n\n\n\n\nREST API\n\n\n\n");
    const sessionToken = req.headers["x-session-token-cookie"];
    const serverToken = req.headers.authorization?.split(" ")[1];
    if (serverToken === undefined || serverToken === null) return res.status(401).json({ error: "Missing token." });
    if (sessionToken === undefined || sessionToken === null) return res.status(401).json({ error: "Missing session token."});

    const session = await prisma.session.findUnique({ where: { sessionToken: sessionToken } })
    if(session === null || session === undefined) return res.status(401).json({ error: "User isn't authenticated." });
    
    const sessionID = session.id;   // valid user, now check room
    const room = req.query?.room;
    if (room === null || room === undefined || !room.match(/^\d{6}$/)) return res.status(401).json({ error: "No room provided or room id is invalid."});
    
    const roomDataString = await redisClient.get(room);
    const roomData = JSON.parse(roomDataString || "null");
    if (roomData === null || roomData === undefined) return res.status(404).json({ error: "Room not found."});

    const members = roomData?.members;
    if (members === null || members === undefined || members?.length === 0) return res.status(404).json({ error: "No users in room."});
    const idx = members?.findIndex(member => member.id === sessionID);
    if(idx === null || idx === undefined || idx === -1) return res.status(403).json({ error: "Did not find user among members."});

    if(roomData?.status !== "ready") return res.status(403).json({ error: "Room match hasn't started."});

    next();
});

// api routes
app.get("/api", (req, res) => {
    return res.status(200).json({ message: "hey there" });
});

// public namespace only responsible for read only information for all clients 
pnsp.on("connection", (socket) => {
    const emitTotalConnections = () => emitConnectionCount([pnsp, ansp], pnsp);
    coreServices(emitTotalConnections, socket);
    console.log(`New public connection: ${socket.id}!\n`);
});

const initialRoomData = {
    roomID: "pool",
    admin: null, 
    status: null, 
    members: getRoomMembers(ansp, "pool"),
    currentQuestion: null, 
};
redisClient.set("pool", JSON.stringify(initialRoomData));

// middleware to validate incoming session token cookie against values in database
ansp.use((socket, next) => {
    console.log(`\n\n\n\nSocket ${socket.id} attempting to connect to authenticated namespace...`)
    // full-stack app appends cookies to client requests
    const cookies = socket.request.headers?.cookie?.split('; ');
    if (!cookies) return next(new Error("Did not find any cookies."))
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
            const { id } = session;
            socket.sessionID = id;
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

    console.log(`\n\nNew private connection: ${socket.id}!\n\n`);
    socket.join(socket.sessionID); // gurantee of addition is made by middleware

    // client explicity asks for a rooms count (i.e on mount)
    socket.on("get:room-count", async (room) => {
        // update requesters count only
        // changes to the members array are sent to entire room via callbacks 
        const roomData = await getNewRoomData(ansp, room, redisClient);
        ansp.to(socket.sessionID || socket.id).emit("ack:room-count", {
            data: roomData,
            status: "ok"
        });
    });

    // response to client emitWithAck
    socket.on("action:new-room", async () => {
        const data = socket.handshake?.auth?.data?.user
        const rooms = ansp.adapter.rooms; 
        if (rooms.size === 1000000)
            ackError(ansp, socket.sessionID, "ack:new-room", "Too many active rooms.");
        else if (!data) 
            ackError(ansp, socket.sessionID, "ack:new-room", "Connecting user has no session data.");

        else {
            const roomID = generateRoomId(ansp);
            
            // create room socket and connect client, emit id to client, store client info
            leaveAllRooms(ansp, socket, redisClient);
            socket.join(roomID);

            const members = [{
                id: socket.sessionID, // memberhood based on session, allows seperate tabs and clean secured checks of authenticity by web server
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
                questionNum: null
            };

            // avoid overhead of redis type, centralize data as string
            const roomDataString = JSON.stringify(roomData);

            // written to redis
            const response = await redisClient.set(roomID, roomDataString);

            if (response) {
                ansp.to(socket.sessionID).emit("ack:new-room", {
                    data: roomData,
                    status: "ok"
                }); // emit to requester
            }
        }
    });

    // response to client emitWithAck
    socket.on("action:join-room", async (roomID) => {
        const rooms = ansp.adapter.rooms;
        const members = getRoomMembers(ansp, roomID);


        // if recieved non string or non 6 digit string
        if  (typeof roomID !== "string" || (!roomID.match(/^\d{6}$/) && roomID !== "pool")) {
            ackError(ansp, socket.sessionID, "ack:join-room", "Bad room ID.");
        }

        // room doesn't exist
        else if (roomID !== "pool" && rooms.get(roomID) === undefined || rooms.get(roomID) === null){
            ackError(ansp, socket.sessionID, "ack:join-room", "Room doesn't exist.");
        }

        else if (roomID.match(/^\d{6}$/) && members?.length >= 4) {
            ackError(ansp, socket.sessionID, "ack:join-room", "Room is full.");
        } 
        
        // create room, store user information in map 
        else {  
            const roomDataString = await redisClient.get(roomID);
            const oldRoomData = JSON.parse(roomDataString || "null");
            if (oldRoomData.status === "ready") return ackError(ansp, socket.sessionID, "ack:join-room", "Could not join. Room in progress.");

            leaveAllRooms(ansp, socket, redisClient);
            socket.join(roomID); // create-room called as side-effect  
            // ack:join-room and ack:create-room update the clients room information, so we can't simply propogate change alone
            const roomData = await getNewRoomData(ansp, roomID, redisClient);
            ansp.to(socket.sessionID).emit("ack:join-room", {
                data: roomData,
                status: "ok" 
            });
        }
    });

    // response to client emitWithAck
    socket.on("action:leave-room", async (roomID) => {
        const rooms = ansp.adapter.rooms;
        // if recieved non string or non 6 digit string
        const notValidID = typeof roomID !== "string" || (!roomID.match(/^\d{6}$/) && roomID !== "pool");
        const doesNotExist = rooms.get(roomID) === undefined || rooms.get(roomID) === null
        const doesNotIncludeClient = !rooms?.get(roomID)?.has(socket.id);
        
        if (notValidID || doesNotExist || doesNotIncludeClient) {
            ansp.to(socket.sessionID).emit("ack:left-room", {
                data: null,
                status: "error"
            });
        }
        
        // remove socket
        else {  

            socket.leave(roomID); // leave-room called as side-effect
            const roomData = await getNewRoomData(ansp, roomID, redisClient);
            ansp.to(socket.sessionID).emit("ack:left-room", {
                data: roomData,
                status: "ok" 
            });
        }
    });

    socket.on("action:start-match", async (roomID) => {
        if(!isInRoom(ansp, socket, roomID)) return ackError(ansp, socket.sessionID, "ack:start-match", "Not in room.");
        const roomDataString = await redisClient.get(roomID);
        const roomData = JSON.parse(roomDataString || "null");
        if(!roomData) return ackError(ansp, socket.sessionID, "ack:start-match", "No room data found.");
        if(roomData?.admin !== socket.id) return ackError(ansp, socket.sessionID, "ack:start-match", "Not an admin for this room.");
        
        const members = getRoomMembers(ansp, roomID);

        // tested ✅, form questions from aggregate file with with no repetition
        const questionSet = new Set();
        const len = 2;
        while (questionSet.size < len) {
            let idx = Math.floor(Math.random() * questions.length);
            if (!questionSet.has(questions[idx])) {
                questionSet.add(questions[idx]);
            }
        }
        const newQuestions = Array.from(questionSet);
        
        // create an object with member ids as keys for quickly indexing their response
        /* 
            QuestionAnswerType: {
                "socketid"?: null,
                "socketid"?: null,
                "socketid3"?: null,
                "socketid4"?: null
            }
        */
        const userAnswerMap = new Map();
        for (let member of members) {
            userAnswerMap.set(member.id, null);
        }
        const userAnswerTemplateObject = Object.fromEntries(userAnswerMap);

        // each question needs an object like the above
        // QuestionAnswerType[]
        const userAnswers = new Array();
        while (userAnswers.length !== len)
            userAnswers.push({...userAnswerTemplateObject});

        // managed by and secure to socket server
        const newServerRoomData = {
            roomID: roomData?.roomID || roomID,
            admin: roomData?.admin, 
            status: "ready", 
            members: members,
            questions: newQuestions,
            answers: userAnswers,
            currentQuestion: newQuestions[0], 
            questionNum: 0 
        }; 

        const firstQuestion = newServerRoomData.questions[0];
        delete firstQuestion.info?.matchingKeywords;

        // subset of server data intended for clients
        const newRoomData = {
            roomID: newServerRoomData.roomID,
            admin: newServerRoomData.admin, 
            status: newServerRoomData.status, 
            members: newServerRoomData.members,
            currentQuestion: newServerRoomData.currentQuestion,
            questionNum: newServerRoomData.questionNum,
            userCurrentAnswerStatuses: userAnswers[0] // valid to send this data since it's just null for each user answer
        };

        console.log(userAnswers[0]);

        console.log("\n\n\n\n\nNEW ANSWER DATA:", userAnswers)

        // write server room data to redis
        const newRoomDataString = JSON.stringify(newServerRoomData);
        const status = await redisClient.set(roomID, newRoomDataString);
        if (!status) return ackError(ansp, socket.sessionID, "ack:start-match", "Error occured updating room.");
        ansp.to(roomID).emit("ack:start-match", {
            data: newRoomData,
            status: "ok"
        });
    })

    // when answering a question, nothing should be provided by the client but the answer (assuming a hacker tries to use socket in dev tools, similar thought process in above code as well)
    socket.on("action:answer-question", async (answer) => {

        // what room is the socket in? 
        const room = getCurrentRoom(socket);
        if(room === null || room === undefined) return ackError(ansp, socket.sessionID, "ack:answer-question", "User is not in any applicable rooms.");
        else if (!isInRoom(ansp, socket, room)) return ackError(ansp, socket.sessionID, "ack:answer-question", "Server did not find user in room.");
        
        // get the room data, validate the data to be mutated as expected
        const roomDataString = await redisClient.get(room);
        const roomData = JSON.parse(roomDataString || "null");
        if (roomData === null || roomData === undefined) return ackError(ansp, socket.sessionID, "ack:answer-question", "Server could not find the room.");
        if (roomData?.status !== "ready") return ackError(ansp, socket.sessionID, "ack:answer-question", "Room not ready for answers.");
        if (roomData?.currentQuestion === null || roomData?.currentQuestion === undefined) return ackError(ansp, socket.sessionID, "ack:answer-question", "Room has no current question.");
      
        const idx = roomData?.questionNum;
        const answers = roomData?.answers;
        if (answers === null || answers === undefined) return ackError(ansp, socket.sessionID, "ack:answer-question", "Room has no trackable answers.");
       
        // get the current answer object
        // keys are usernames, values are their answer
        const currentAnswersObj = roomData.answers[idx];
        if (currentAnswersObj === null || currentAnswersObj === undefined) return ackError(ansp, socket.sessionID, "ack:answer-question", "Server could not make changes for this question.");

        // has the user answered already?
        const userAnswers = currentAnswersObj[socket?.sessionID];
        if (userAnswers !== null && userAnswers !== undefined) return ackError(ansp, socket.sessionID, "ack:answer-question", "User has provided answer already.");

        // push user answers to current question, insert into aggregate
        currentAnswersObj[socket?.sessionID] = answer;

        // has everyone answered? update game state accordingly
        let nextQuestion = true;
        for (let userID in currentAnswersObj) {
            if (currentAnswersObj[userID] === null || currentAnswersObj[userID] === undefined){
                nextQuestion = false;
                break;
            } 
        }
        const newRoomAnswers = roomData?.answers;
        newRoomAnswers[idx] = currentAnswersObj;
        roomData.answers = newRoomAnswers;
        roomData.questionNum += nextQuestion ? 1 : 0;
        roomData.currentQuestion = roomData?.questions[roomData.questionNum];

        // while we want to update other users of their fellow user status' 
        // we don't want to send their actual values, simply send a standalone attribute for each users current answer question status
        // likewise we want to conditionally send this
        let userCurrentAnswerStatuses = {};
        for (let userID in currentAnswersObj){
            const userAnswer = currentAnswersObj[userID];
            userCurrentAnswerStatuses[userID] = (nextQuestion || !userAnswer) ? false : true;
        }
        
        const newRoomData = {
            roomID: roomData.roomID,
            admin: roomData.admin, 
            status: roomData.status, 
            members: roomData.members,
            currentQuestion: roomData.currentQuestion,
            questionNum: roomData.questionNum,
            userCurrentAnswerStatuses: userCurrentAnswerStatuses
        }

        // write to redis
        const newRoomDataString = JSON.stringify(roomData);
        const status = await redisClient.set(room, newRoomDataString);
        if (!status) return ackError(ansp, socket.sessionID, "ack:answer-question", "Error occured updating room.");
        if(roomData?.questionNum === roomData?.questions.length) {
            newRoomData.status = "complete";
            ansp.to(room).emit("ack:finish-match", {
                data: newRoomData,
                status: "ok"
            });

            // console.log(roomData)
            // const foo = "Question 1\nprompt: \"You come home to this, what do you do first?\"\nimage description: \"image dog destroys something after being left home home\"\noptions: \"'Burst into rage 🤬\", \"Join in 😁\", \"'Calm Discipline 🥺'\", \"Go for a walk 🦮\"\n\nAnswers for Question 1:\n\"Join in 😁\", \"Join in 😁\", \"Calm Discipline 🥺'\""
           
            let formatted = "";
            const questions = roomData.questions;
            questions?.forEach((question, index) => {
                const prompt = question?.prompt;
                const image = question?.image;

                const type = question?.info?.type;
                const options = question?.info?.options;
                let optionString = type === "short" ? "SHORT ANSWER" : "";
                options?.forEach((option, index) => { 
                    optionString += `\"${option}\", `;
                })

                let answerString = "";
                const currentAnswers = Object.values(roomData?.answers[index]);
                currentAnswers.forEach((ans, index) => {
                    answerString += `\"${ans}\", `;
                })

                formatted += `Question ${index+1}\nprompt: \"${prompt}\"\nimage description: \"${image?.alt || ""}\"\noptions: \"${optionString}\n\nAnswers for Question ${index+1}:\n${answerString}\n\n`
                console.log(formatted)
            })

            // const response = await openai.createChatCompletion({
            //     model: "gpt-3.5-turbo",
            //     messages: [
            //       {
            //         "role": "system",
            //         "content": "You are an image prompt generator. You are responsible for turning an array of question and answer combos into a single prompt that will generate an image when used with Dalle-2. Multiple users pair together to answer questions about pets and your job is to interpret their answers to each question and determine the best pet. With that being said once you find the best pet, you then craft the perfect prompt. "
            //       },
            //       {
            //         "role": "user",
            //         "content": "Question 1\nprompt: \"You come home to this, what do you do first?\"\nimage description: \"image dog destroys something after being left home home\"\noptions: \"'Burst into rage 🤬\", \"Join in 😁\", \"'Calm Discipline 🥺'\", \"Go for a walk 🦮\"\n\nAnswers for Question 1:\n\"Join in 😁\", \"Join in 😁\", \"Calm Discipline 🥺'\""
            //       },
            //       {
            //         "role": "assistant",
            //         "content": "The users seem to be tolerant of undesired behavior in their pets, this can be a double edged sword but leans towards the positive side. Their pet would probably not get scared of making mistakes, making it easier to rectify the behavior itself. For a balanced experience  I recommend a pet with medium energy like the English bull dog.\n\nMY PROMPT IS: An english bull dog running across a grass field, afternoon suburban lighting."
            //       },
            //       {
            //         "role": "user",
            //         "content": "Question 1\nprompt: \"You come home to this, what do you do first?\"\nimage description: \"image dog destroys something after being left home home\"\noptions: \"'Burst into rage 🤬\", \"Join in 😁\", \"'Calm Discipline 🥺'\", \"Go for a walk 🦮\"\n\nAnswers for Question 1:\n\"Go for a walk 🦮\", \"Go for a walk 🦮\", \"Calm Discipline 🥺'\"\n\nQuestion 2\nprompt: \"Your pet enjoys a day at the?\"\nimage description: \"image of a dog park\"\noptions: \"Beach\", \"Living Room\", \"'Park'\", \"Office\"\n\nAnswers for Question 2:\n\"Beach\", \"Beach\", \"Office\""
            //       },
            //       {
            //         "role": "assistant",
            //         "content": "The users seem to be responsible and loving pet owners. They know how to release a dog's pent up aggression in positive ways so having a high energy dog like a Border Collie or Australian Shepard. may be the best. The answers to the next question shows that a majority of the members have an ideal pet who likes spending time at the beach. However one member does mention the office so it can be assumed they may spend some time at work. A great recommendation considering the above is a medium energy dog like the Shiba Inu. \n\nMY PROMPT IS: Shiba Inu running down the shore on a lovely beach."
            //       },
            //       {
            //         "role": "user",
            //         "content": "Question 1\nprompt: \"You would name your pet...\"\nimage description: \"image dog destroys something after being left home home\"\noptions: SHORT ANSWER\n\nAnswers for Question 1:\n\"Fluffy\", \"Ben\", \"Midnight'\"\n\nQuestion 2\nprompt: \"Your pet enjoys a day at the?\"\nimage description: \"image of a dog park\"\noptions: \"Beach\", \"Living Room\", \"'Park'\", \"Office\"\n\nAnswers for Question 2:\n\"Living Room\", \"Beach\", \"Office\"\n\nQuestion 3\nprompt: \"Are you allergic to pets?\"\nimage description: \"Sneezing person\"\noptions: \"Yes\", \"No\"\n\nAnswers for Question 3:\n\"No\", \"No\", \"No\""
            //       },
            //       {
            //         "role": "assistant",
            //         "content": "None of the members have allergies which is the highest priority when considering a new pet. The members also seem to prefer a stay at home pet due to the majority of answers to question 2, such as \"Living Room\" and \"Office\". A nice name that was given by the users in the short answer question 1 was \"Midnight\". All of the above makes me want to suggest the cuddly Bombay cat.\n\nMY PROMPT: A cute Bombay cat laying on a pizza box."
            //       },
            //       {
            //         "role": "user",
            //         "content": "Question 1\nprompt: \"You prefer...\"\nimage description: \"lizard on a desk\"\noptions: \"Reptiles\", \"Mammals\", \"Birds\", \"Something Cute\"\n\nAnswers for Question 1:\n\"Reptiles\", \"Birds\", \"Birds'\"\n\nQuestion 2\nprompt: \"Your pet enjoys a day at the?\"\nimage description: \"image of a dog park\"\noptions: \"Beach\", \"Living Room\", \"'Park'\", \"Office\"\n\nAnswers for Question 2:\n\"Living Room\", \"Living Room\", \"Living Room\"\n\nQuestion 3\nprompt: \"Are you allergic to pets?\"\nimage description: \"Sneezing person\"\noptions: \"Yes\", \"No\"\n\nAnswers for Question 3:\n\"No\", \"No\", \"No\""
            //       },
            //       {
            //         "role": "assistant",
            //         "content": "Based on the answers, it seems that the users have a preference for birds and enjoy having their pets in the living room. Since there are no allergies, a suitable pet recommendation would be a colorful and sociable pet bird, such as a parakeet or a cockatiel.\n\nMY PROMPT: An adorable and vibrant parakeet perched on a branch, surrounded by colorful feathers."
            //       },
            //       {
            //         "role": "user",
            //         "content": formatted
            //       }
            //     ],
            //     temperature: 1,
            //     max_tokens: 256,
            //     top_p: 1,
            //     frequency_penalty: 0,
            //     presence_penalty: 0,
            // });

            // if(response.data.choices.length > 0){
            //     const content = response.data.choices[0].message.content;
            //     console.log(content)

            //     const explanation = content.split("MY PROMPT: ")[0];
            //     const prompt = content.split("MY PROMPT: ")[1];
            //     newRoomData.result = {
            //         explanation: explanation,
            //         prompt: prompt,
            //         data: null
            //     }
            //     ansp.to(room).emit("ack:finish-match", {
            //         data: newRoomData,
            //         status: "ok"
            //     });

            //     console.log(prompt);

            //     const imageResponse = await openai.createImage({
            //         prompt: prompt,
            //         n: 1,
            //         size: "256x256"
            //     });
            //     newRoomData.result.data = imageResponse.data;
            //     ansp.to(room).emit("ack:finish-match", {
            //         data: newRoomData,
            //         status: "ok"
            //     });

            //     console.log(imageResponse.data)

            // }

            /* TESTS */
            const testContent = "A majestic and calm-looking cat relaxing on a window sill, basking in the warm sunlight. A majestic and calm-looking cat relaxing on a window sill, basking in the warm sunlight."
            const testImage = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-ZdGIjlQ2976uh4fFXUDVI1UI/user-uMzdDyR77MjjhR3WuGDZzgUr/img-QtJMmmf24lAxtjRLyjt1Ejpa.png?st=2023-07-10T02%3A25%3A02Z&se=2023-07-10T04%3A25%3A02Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-07-09T22%3A17%3A21Z&ske=2023-07-10T22%3A17%3A21Z&sks=b&skv=2021-08-06&sig=5QHggitEFIdzAopsb1vGQZT4jTuCKjdW66WbVJYZv0U%3D";
        
            const explanation = testContent.split("MY PROMPT: ")[0];
            const prompt = testContent.split("MY PROMPT: ")[1];

            setTimeout(() => {
                newRoomData.result = {
                    explanation: explanation,
                    prompt: prompt,
                    data: null
                }
                ansp.to(room).emit("ack:finish-match", {
                    data: newRoomData,
                    status: "ok"
                });
            }, 5000);
            setTimeout(() => {
                newRoomData.result = {
                    explanation: explanation,
                    prompt: prompt,
                    data: {
                        data: [{
                            url: testImage
                        }]
                    }
                }
                ansp.to(room).emit("ack:finish-match", {
                    data: newRoomData,
                    status: "ok"
                });
            }, 10000)
        }
        else {
            ansp.to(room).emit("ack:answer-question", {
                data: newRoomData,
                status: "ok"
            });
        }
        //console.log("New room answers:", roomData); 
    });

    socket.on("action:send-message", (roomID, message) => {
        if (!isValidRoomID(roomID)) return ackError(ansp, socket.id, "ack:send-message", "Room ID is invalid.");
        else if (!roomExists(ansp, roomID)) return ackError(ansp, socket.id, "ack:send-message", "Room does not exist.");
        else if (!isInRoom(ansp, socket, roomID)) return ackError(ansp, socket.id, "ack:send-message", "Client not a member of room.");
 
        const data = socket?.handshake?.auth?.data?.user;

        // emit to other clients in room 
        ansp.to(roomID).emit("ack:send-message", {
            data: {
                message: message,
                sender: {
                    id: socket.id,
                    name: data?.name || "Anonymous",
                    image: data?.image || "http://placeholder.co/500/500"
                }
            },
            status: "ok"
        });
    });

});

ansp.adapter.on("create-room", (room) => {
    console.log(`room ${room} was created`);
});

ansp.adapter.on("join-room", async (room, id) => {
    room === "pool" && handlePoolUpdate(room, ansp);
    console.log(`${id} joined room ${room}`);
    handleMemberCountChange(ansp, room, redisClient, id); // update room as well as client specifically
}); 

ansp.adapter.on("leave-room", async (room, id) => {
    room === "pool" && handlePoolUpdate(room, ansp);
    console.log(`${id} left room ${room}`);

    const roomDataString = await redisClient.get(room);
    const roomDataJSON = JSON.parse(roomDataString || "null");
    // if(roomDataJSON)

    handleMemberCountChange(ansp, room, redisClient, id); // update room as well as the changer
});

ansp.adapter.on("delete-room", async (room) => {
    room !== "pool" && await redisClient.del(room)
    handleMemberCountChange(ansp, room, redisClient);
    console.log(`room ${room} was deleted`);
});

server.listen(port, () => console.log(`Listening on ${port}...`));

