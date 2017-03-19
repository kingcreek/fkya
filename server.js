'use strict';

var express = require('express'),
    port = process.env.PORT || 8080,
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

	
   server.listen(8080,'192.168.1.36');
 
// Live reload
if (process.env.LIVERELOAD_PORT) {
  try {
    var livereload = require('connect-livereload');
  } catch (er) {
    livereload = null;
  }
  if (livereload) {
    app.use(livereload({
      port: process.env.LIVERELOAD_PORT
    }));
  }
}

// Serve static files
app.use(express.static(__dirname + '/build'));
app.use(express.static(__dirname + '/dist'));
http.createServer(onRequest).listen(process.env.PORT || 6000)

// Socket.IO: just broadcast everything
io
  .on('connection', function(socket) {
    socket.on('position', function(data) {
      data.sender = socket.id;
      socket.broadcast.emit('position', data);
    });
  });

server.listen(port, function() {
  console.log('Listening on ' + port);
});
