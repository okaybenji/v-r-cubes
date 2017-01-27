/* jshint esnext:true */
/* jshint browser:true */
/* global utils */

// const ws = new WebSocket('ws://localhost:8001');
const ws = new WebSocket('wss://banjo.benjikay.com/v-r-cubes');
const camera = document.querySelector('a-camera');
const priorState = {
  pos: camera.getAttribute('position'),
  rot: camera.getAttribute('rotation'),
};
let id;

const send = (msg) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
};

ws.onmessage = (data, flags) => {
  const msg = JSON.parse(data.data);

  if (msg.myId) {
    id = msg.myId;

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

  if (msg.color) {
    box.removeAttribute('src');
    box.setAttribute('color', msg.color);
  }

  if (msg.src) {
    utils.validateImage(msg.src)
      .then(() => {
        box.setAttribute('color', 'white');
        // TODO: Make this more robust. (Find a better gif test.)
        if (msg.src.substr(msg.src.length - 3) === 'gif') {
          box.setAttribute('material', `shader:gif;src:url(${msg.src});`);
        } else {
          box.setAttribute('src', msg.src);
        }
      });
  }

  if (msg.position) {
    box.setAttribute('position', {x: msg.position.x, y: 0.5, z: msg.position.z});
  }

  if (msg.rotation) {
    box.setAttribute('rotation', {x: 0, y: msg.rotation.y, z: 0});
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

const step = () => {
  let shouldUpdate = false;
  let update = {id, position: {}, rotation: {}};

  const pos = camera.getAttribute('position');
  if (pos.x !== priorState.pos.x) {
    shouldUpdate = true;
    update.position.x = priorState.pos.x = pos.x;
  }

  if (pos.z !== priorState.pos.z) {
    shouldUpdate = true;
    update.position.z = priorState.pos.z = pos.z;
  }

  const rot = camera.getAttribute('rotation');
  if (rot.y !== priorState.rot.y ) {
    shouldUpdate = true;
    update.rotation.y = priorState.rot.y = rot.y;
  }

  if (shouldUpdate) {
    send(update);
  }

  requestAnimationFrame(step);
};

step();
