import { Server } from 'socket.io';
import { join } from 'path';
import express from 'express';
import { createServer, request } from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { hostname } from 'os';
import { networkInterfaces } from 'os';
import { connect } from 'http2';

const interfaces = networkInterfaces();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {},
});


app.use(express.json());

const port = 3400; //port to create server


////////////////////////////////////////////////
//REST STUFF
app.get('/chat', (req, res) => {                    //chat page
    res.sendFile(join(__dirname, 'index.html'));
});

app.get('/name', (req, res) => {        //returns json with server host nsme and ip 
    let ipAdress = '';
    var hostNAME = hostname();
    for (const networkInterface of Object.values(interfaces)) {
        for (const adress of networkInterface) {
            if (adress.family === 'IPv4' && !adress.internal) {
                ipAdress = adress.address;
                break;
            }
        }
    }
    res.json({
        hostname: hostNAME,
        ipAdress: ipAdress
    });
});


app.post('/message', (req, res) => {                            //recieves message with POST request body in JSON format: {"message": "text"}
    const message = req.body.message;   
    io.emit('chat message', `Собеседник: ${message}`);
    if (!message) {
        return res.status(400).json({
        error: 'Message not found'});
       }
    console.log('Recieved Message:', message);
    res.status(200).json({ message: 'Message recieved' });

}); 
//END OF REST STUFF
///////////////////////////////////////////////

                     

io.on('connection', (socket) => {                           //write "user connected" or "disconnected" 
    console.log('a user connected');
    io.emit('chat message', 'user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.emit('chat message', 'user disconnected');

    });
});

io.on('connection', (socket) => {                           //logs chat message
    socket.on('chat message', (msg) => {
        console.log('log: chat message: ' + msg);
    });
});

io.on('connection', (socket) => {                           //recieves chat message from client socket and emits it to other connected sockets
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

server.listen(port, () => {
    console.log(`----------------3 server running at http://localhost:${port}`);
});