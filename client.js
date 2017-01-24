const input = document.querySelector('input');
const box = document.querySelector('a-box');

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

const isUrl = url =>  url.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

let cachedImages = {};

const testImage = (url) => {
  if (cachedImages[url]) {
    return new Promise(resolve => resolve(cachedImages[url]));
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
      cachedImages[url] = img;
      resolve();
    };
    timer = setTimeout(() => {
      img.src = '';
      reject(new Error('Timed out while validating image.'));
    }, timeout);
    img.src = url;
  });
};

input.addEventListener('input', () => {
  // TODO: why does setting the same image twice fail?
  if (isUrl(input.value)) {
    testImage(input.value)
      .then(() => {
        box.setAttribute('src', input.value);
        box.setAttribute('color', 'white');
      });
  } else {
    box.removeAttribute('src');
    box.setAttribute('color', randomColor());
  }
});
