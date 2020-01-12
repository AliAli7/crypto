const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 80;

const server = http.createServer((req, res) => {
  const path = './public'+(req.url === '/' ? '/index.html' : req.url);
  if (fs.existsSync(path)) {
    const html = fs.readFileSync(path);
    // res.setHeader('Content-Type', 'text/html');
    res.statusCode = 200;
    res.write(html);
    res.end();
  }
  res.statusCode = 404;
  res.end();
});

const io = require('socket.io')(server);

io.on('connection', socket => {
  socket.on('join', pubKey => {
    socket.join(pubKey);
  });

  socket.on('message', msg => {
    io.to(msg.to).emit('message', msg.message);
  });

  socket.on('disconnect', function() {
    // console.log('Got disconnect!');
  });
});


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
