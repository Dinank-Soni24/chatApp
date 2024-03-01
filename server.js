const http = require('http');
const app = require('./app');
const formatMessage = require('./api/utils/message');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./api/utils/user');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = require('socket.io')(server);

// Socket.IO event handlers
io.on('connection', (socket) => {
  // Listen for joinRoom event
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', formatMessage('Bot', 'Welcome to the chat!'));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage('Bot', `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chat messages
  socket.on('chatMessage', (message) => {
    const user = getCurrentUser(socket.id);

    // Broadcast the message to all connected clients
    io.to(user.room).emit('message', formatMessage(user.username, message));
  });

  // Listen for disconnection
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          formatMessage('Bot', `${user.username} has left the chat`)
        );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
    // socket.broadcast.emit(
    //   'message',
    //   formatMessage('Bot', 'A user has left the chat')
    // );
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
