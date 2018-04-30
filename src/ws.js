
let connected = false;
const connection = new WebSocket('ws://192.168.1.8/ws');

connection.onopen = () => {
  connected = true;
}

const sendPosition = (pos) => {
  if (!connected) { return }
  connection.send(pos);
}

// Log errors
connection.onerror = function (error) {
  console.log('WebSocket Error ' + error);
};

// Log messages from the server
connection.onmessage = function (e) {
  console.log('Server: ' + e.data);
};

export {
  sendPosition,
};
