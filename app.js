const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const Redis = require("ioredis");
const redisClient = new Redis();
const io = new Server(server);


// Intro

console.log(`
\x1b[2m          .-~~~-.
  .- ~ ~-(       )_ _
/                     ~ -.
|                         \\
\\           ~-~          .'
  ~- . ______|______ . -~
             |
             J \x1b[36m\x1b[1m <-- CloudHook Server v0.1.0.0alpha
\x1b[0m
--- Change Log -------------------------------------

[#] Re-written in NodeJS with Socket.IO
____________________________________________________
`);


// Core Server

server.listen(3000, () => {
  console.log("Cloudhook listening on *:3000");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});


// Express Routing and Config

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/hook/:tenant/:hookid", (req, res) => {
  var fullHook = (req.params.tenant + '/' + req.params.hookid);
  console.log("[Express] POST: " + fullHook + ": " + JSON.stringify(req.body));
  io.to(fullHook).emit("ch-post", JSON.stringify(req.body));
  res.status(200).send({"path": fullHook});
});

app.get("/hook/:tenant/:hookid", (req, res) => {
  var fullHook = (req.params.tenant + '/' + req.params.hookid);
  console.log("[Express] GET: " + fullHook + ": " + JSON.stringify(req.body));
  io.to(fullHook).emit("ch-get",JSON.stringify({
    "status":"success",
    "tenant":req.params.tenant,
    "hook":req.params.hookid
  }));
  res.status(200).send({"path": fullHook});
});

//app.get("/:id", (req, res) => {
//  res.sendFile(__dirname + "/public/hats.html");
//});


// Socket.IO PubSub

io.on("connection", (socket) => {
  console.log("[Socket.IO] " + socket.handshake.address + " connected.");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("ch-subscribe", (msg) => {
    console.log("[Socket.IO] " + socket.handshake.address + " subscribed to " + msg);
    socket.join(msg);
  });
  socket.on("ch-unsubscribe", (msg) => {
    console.log("[Socket.IO] " + socket.handshake.address + " unsubscribed from " + msg);
    socket.leave(msg);
  });

  // Client publishing functionality currently disabled.
  //socket.on("ch-publish", (msg) => {
  //  console.log("user published " + msg.payload + " to " + msg.room);
  //  io.to(msg.room).emit("ch-publish", msg.payload);
  //});

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});
