
import cors from 'cors';
import { Server } from 'socket.io';
import { join } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { createServer, request } from 'http';
import require from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {},
});


app.use(express.json());

////////////////////////////////////////////////
//REST STUFF



app.get('/chat', (req, res) => {
    res.sendFile(join(__dirname, 'indexvl.html'));
});


app.get('/home', (req, res) => {
    console.log('[GET ROUTE]');
    res.sendFile(join(__dirname, 'home.html'));
});


app.use('/home', function (request, response) {
    Response.redirect('chat');
});


app.get('/name', (req, res) => {
    const hostName = require('os').hostname();
    const interfaces = require('os').networkInterfaces();
    let ipAdress = '';
    for (const networkInterface of Object.values(interfaces)) {
        for (const adress of networkInterface) {
            if (adress.family === 'IPv4' && !adress.internal) {
                ipAdress = adress.address;
                break;
            }
        }
    }
    res.json({
        hostname: hostName,
        ipAdress: ipAdress
    });
});


app.post('/message', (req, res) => {
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




io.on('connection', (socket) => {
    console.log('a user connected');
    io.emit('chat message', 'user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.emit('chat message', 'user disconnected');

    });
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        console.log('log: chat message: ' + msg);
    });
});

io.on('connection', (socket) => {
    socket.broadcast.emit('hi');
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

server.listen(3400, () => {
    console.log('----------------3 server running at http://localhost:3400');
});