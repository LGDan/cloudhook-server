
// HTTP
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
//const e = require("express");

// WebSockets
const { Server } = require("socket.io");
const io = new Server(server);

// WebSockets Clustering
const { createAdapter } = require("@socket.io/redis-adapter");
const { Cluster } = require("ioredis");
const redis = require('socket.io-redis');

// ENV
const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "my_master_password";
const DEBUG = process.env.DEBUG || false;
io.adapter(redis({ host: REDIS_HOST, port: REDIS_PORT }));


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

server.listen(PORT, () => {
  console.log("Cloudhook listening on *:" + PORT);
  console.log("Redis server: " + REDIS_HOST + ":" + REDIS_PORT);
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
  if (DEBUG) {console.log("[Express] POST: " + fullHook + ": " + JSON.stringify(req.body));}
  io.to(fullHook).emit("ch-post", JSON.stringify(req.body));
  res.status(200).send({"path": fullHook});
});

app.get("/hook/:tenant/:hookid", (req, res) => {
  var fullHook = (req.params.tenant + '/' + req.params.hookid);
  if (DEBUG) {console.log("[Express] GET: " + fullHook + ": " + JSON.stringify(req.body));}
  io.to(fullHook).emit("ch-get",JSON.stringify({
    "status":"success",
    "tenant":req.params.tenant,
    "hook":req.params.hookid
  }));
  res.status(200).send({"path": fullHook});
});

// Socket.IO PubSub

io.on("connection", (socket) => {
  console.log("[Socket.IO] " + socket.handshake.address + " connected.");
  socket.on("disconnect", () => {
    if (DEBUG) {console.log("user disconnected");}
  });

  socket.on("ch-subscribe", (msg) => {
    if (DEBUG) {console.log("[Socket.IO] " + socket.handshake.address + " subscribed to " + msg);}
    socket.join(msg);
  });
  socket.on("ch-unsubscribe", (msg) => {
    if (DEBUG) {console.log("[Socket.IO] " + socket.handshake.address + " unsubscribed from " + msg);}
    socket.leave(msg);
  });
});
