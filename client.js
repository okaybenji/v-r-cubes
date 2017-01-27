/* jshint esnext:true */
/* jshint browser:true */
/* global utils */

// const ws = new WebSocket('wss://banjo.benjikay.com/v-r-cubes');
const ws = new WebSocket('ws://localhost:8001');

let id;

const send = (msg) => {
  ws.send(JSON.stringify(msg));
};

ws.onmessage = (data, flags) => {
  const msg = JSON.parse(data.data);

  if (msg.myId) {
    id = msg.myId;

    const camera = document.querySelector('a-entity');
    camera.setAttribute('position', msg.position);
    camera.setAttribute('rotation', msg.rotation);

    return;
  }

  const scene = document.querySelector('a-scene');
  let box = scene.querySelector('#' + msg.id);

  if (msg.destroy) {
    scene.removeChild(box);
    return;
  }

  // Create a box if we didn't find this one.
  if (!box) {
    box = document.createElement('a-box');
    scene.appendChild(box);
    box.setAttribute('id', msg.id);
    box.setAttribute('width', '1');
    box.setAttribute('height', '1');
    box.setAttribute('depth', '1');
  }

  const setEmIfYouGotEm = (attribute) => {
    if (msg[attribute]) {
      box.setAttribute(attribute, msg[attribute]);
    }
  };

  const attributes = ['position', 'rotation', 'color', 'src'];
  attributes.forEach(setEmIfYouGotEm);

  if (msg.color) {
    box.removeAttribute('src');
  } else if (msg.src) {
    box.setAttribute('color', 'white');
  }
};

const input = document.querySelector('input');

input.addEventListener('input', () => {
  // TODO: why does setting the same image twice fail?
  if (utils.isUrl(input.value)) {
    utils.validateImage(input.value)
      .then(() => {
        send({id, src: input.value});
      });
  } else {
    send({id, color: utils.randomColor()});
  }
});
