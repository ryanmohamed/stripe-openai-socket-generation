import { expect, assert } from "chai";
import { questions } from "../utilities/questions.mjs"

import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { Server } from "socket.io";

// tested functions
import { isValidRoomID } from "../utilities/utilities.mjs"

describe("Server Tests", () => {

    let io, serverSocket, clientSocket1, clientSocket2;

    before((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket1 = new Client(`http://localhost:${port}`);
            clientSocket2 = new Client(`http://localhost:${3002}`);
            io.on("connection", (socket) => {
                serverSocket = socket;
                serverSocket.join("123456");           
            });
            clientSocket1.on("connect", done);
            clientSocket2.on("connect", done);
        });
    });

    after(() => {
        io.close();
        clientSocket1.close();
        clientSocket2.close();
      });

    it("should generate a set of questions without fail", () => {
        const questionSet = new Set();
        const len = 3;
        while (questionSet.size < len) {
            let idx = Math.floor(Math.random() * questions.length);
            if (!questionSet.has(questions[idx])) {
                questionSet.add(questions[idx]);
            }
        }
        expect(questionSet.size).to.equal(len);
    });

    it("should work", (done) => {
        clientSocket1.on("hello", (arg) => {
          assert.equal(arg, "world");
          done();
        });
        serverSocket.emit("hello", "world");
      });
    
    it("should work (with ack)", (done) => {
        serverSocket.on("hi", (cb) => {
            cb("hola");
        });
        clientSocket1.emit("hi", (arg) => {
            assert.equal(arg, "hola");
            done();
        });
    });

    it("should accurately determine a valid roomID", () => {
        const validRoomIDs = ["123456", "234567", "345678"];
        const invalidRoomIDs = ["12345", "", "abcdef"];
        validRoomIDs.forEach((roomID) => expect(isValidRoomID(roomID)).to.be.equal(true));
        invalidRoomIDs.forEach((roomID) => expect(isValidRoomID(roomID)).to.be.equal(false));
    });

});