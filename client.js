const randomIntBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const randomColor = () => {
  const minBrightness = 25;
  const minSaturation = 50;

  let color = 'hsl(';
  color += randomIntBetween(0, 360) + ',';
  color += randomIntBetween(minSaturation, 100) + '%,';
  color += randomIntBetween(minBrightness, 100) + '%)';

  return color;
};

let box = {
  id: 0,
  position: '0 0.5 0',
  rotation: '0 45 0',
  color: randomColor()
};

const addBox = (box) => {
  const scene = document.querySelector('a-scene');
  const el = document.createElement('a-box');

  el.setAttribute('width', '1');
  el.setAttribute('height', '1');
  el.setAttribute('depth', '1');
  el.setAttribute('id', box.id);
  el.setAttribute('position', box.position);
  el.setAttribute('rotation', box.rotation);
  el.setAttribute('color', box.color);

  scene.appendChild(el);
};

addBox(box);

const isUrl = url =>  url.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

let cachedUrls = {};

const input = document.querySelector('input');

input.addEventListener('input', () => {
  const validateImage = (url) => {
    if (cachedUrls[url]) {
      return new Promise(resolve => resolve());
    }

    const timeout = 5000;
    const img = new Image();
    let timer;

    return new Promise((resolve, reject) => {
      img.onerror = img.onabort = () => {
        clearTimeout(timer);
        reject(new Error('URL is not a valid image.'));
      };
      img.onload = () => {
        clearTimeout(timer);
        cachedUrls[url] = true;
        resolve();
      };
      timer = setTimeout(() => {
        img.src = '';
        reject(new Error('Timed out while validating image.'));
      }, timeout);
      img.src = url;
    });
  };

  // TODO: why does setting the same image twice fail?
  if (isUrl(input.value)) {
    const box = document.querySelector('a-box'); // TODO: remove me
    validateImage(input.value)
      .then(() => {
        box.setAttribute('src', input.value);
        box.setAttribute('color', 'white');
      });
  } else {
    box.removeAttribute('src');
    box.setAttribute('color', randomColor());
  }
});
