var socket = io();

var messages = document.getElementById("messages");
//var form = document.getElementById("form");
//var input = document.getElementById("input");

//form.addEventListener("submit", function (e) {
//  e.preventDefault();
//  if (input.value) {
//    socket.emit("ch-post", input.value);
//    input.value = "";
//  }
//});

socket.emit("ch-subscribe","test/1");

socket.on("ch-post", function (msg) {
  var item = document.createElement("li");
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
