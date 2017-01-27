/* jshint esnext:true */
/* jshint node:true */

'use strict';

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 8001 });
const utils = require('./utils');

const idGen = (function() {
  let id = 1;
  return function() {
    return 'box' + id++;
  };
}());

wss.on('connection', (ws) => {
  const id = idGen();
  const ip = ws._socket.remoteAddress;
  console.log('user', id, 'connected with IP', ip);

  const x = utils.randomIntBetween(-5, 5);
  const z = utils.randomIntBetween(-5, 5);

  ws.box = {
    id,
    position: x + ' 0.5 ' + z,
    rotation: '0 45 0', // TODO: point to origin
    color: utils.randomColor()
  };

  // Let client know its ID, position and rotation.
  ws.send(JSON.stringify({myId: id, position: x + ' -1 ' + z, rotation: ws.box.rotation}));

  const broadcast = (msg) => {
    wss.clients.forEach(client => {
      if (client === ws || client.readyState !== client.OPEN) {
        return;
      }

      client.send(JSON.stringify(msg));
    });
  };

  broadcast(ws.box);

  // Inform client of already existing clients.
  // TODO: Send data in an array rather than sending multiple msgs.
  wss.clients.forEach(client => {
      if (client === ws || client.readyState !== client.OPEN) {
        return;
      }

    ws.send(JSON.stringify(client.box));
  });

  ws.on('message', (msg) => {
    const {id, position, rotation, src} = JSON.parse(msg);

    const dataIsValid = () => {
      if (!id) {
        return false;
      }

      if (!wss.clients.find(c => c.id === id)) {
        return false;
      }

      if (position && typeof position !== 'string') {
        return false;
      }

      if (rotation && typeof rotation !== 'string') {
        return false;
      }

      if (src && !utils.isUrl(src)) {
        return false;
      }
    };

    if (dataIsValid) {
      broadcast({id, position, rotation, src});
    } else {
      console.warn('user', id, 'with ip', 'sent bad data:', msg);
    }
  });

  ws.on('close', function() {
    broadcast({ destroy: true, id: id });
    console.log(id, 'disconnected');
  });
});
