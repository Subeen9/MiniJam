const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const player = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let queue = [];
let isplaying = false;

player.on('connection', (socket) => {
  console.log('A user connected', socket.id);
  socket.emit('init', { queue, isplaying });

  socket.on('addtoqueue', (song) => {
    queue.push(song);
    console.log('Queue updated:', queue);
    player.emit('queueupdated', queue);
  });

  socket.on('play', () => {
    if (!isplaying && queue.length > 0) {
      isplaying = true;
      console.log('Playing song:', queue[0]);
      player.emit('play', queue[0]);
    }
  });

  socket.on('stop', () => {
    if (isplaying) {
      isplaying = false;
      console.log('Stopped playing');
      player.emit('stop');
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server running at http://localhost:3000');
});
