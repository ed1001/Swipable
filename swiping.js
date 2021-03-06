const cards = document.querySelectorAll('.card');
const firstCard = document.querySelector('.card-active');
const arrows = document.querySelectorAll('.arrow');
const dots = document.querySelector('.photo-dots');
const mediaYoutube = document.querySelector('.media-yt');
const mediaSoundcloud = document.querySelector('.media-sc');
const overlay = document.querySelector('.overlay');
const swipeContainer = document.querySelector('.swipe-container');
const ytModal = document.querySelector('.yt-modal');
const scModal = document.querySelector('.sc-modal');

cards.forEach((card) => {
  Object.assign(card.style, {transform: `rotateZ(${getRandomInt(-7, 7)}deg)`});
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

const passClass = (elA, elB, className) => {
  elA.classList.remove(className);
  elB.classList.add(className);
}

const activateDot = (id) => {
  dots.querySelector('.dot-active').classList.remove('dot-active');
  dots.querySelector(`[data-id='${id}']`).classList.add('dot-active');
}

const photoNav = (isNext, activeImg) => {
  if (isNext && activeImg.nextElementSibling) {
    activateDot(activeImg.nextElementSibling.dataset['id']);
    passClass(activeImg, activeImg.nextElementSibling, 'img-active');
  } else if (!isNext && activeImg.previousElementSibling) {
    activateDot(activeImg.previousElementSibling.dataset['id']);
    passClass(activeImg, activeImg.previousElementSibling, 'img-active');
  }
}

const checkSwipe = (card, tick, cross, rotation) => {
  if (tick.style.opacity < 0.8 && cross.style.opacity < 0.8) return '0px';

  const discard = tick.style.opacity > 0.8 ? '200%' : '-200%';

  setTimeout(() => {
    nextCard(card);
  }, 250);

  return discard;
}

const nextCard = (card) => {
  card.parentNode.removeChild(card);
  const nextCard = document.querySelector('.card-container').lastElementChild;

  if (nextCard) {
    nextCard.classList.add('card-active');
    player.loadVideoById(nextCard.dataset['youtubeId'], 0);
    player.pauseVideo();
    scWidget.load(nextCard.dataset['soundcloudUrl']);
    initSwipe();
  } else {

  }
}

const initDots = (length) => {
  dots.innerHTML = '<div class="dot dot-active" data-id="1"></div>'

  for (let i = 2; i <= length; i++) {
    dots.insertAdjacentHTML('beforeend', `<div class="dot" data-id="${i}"></div>`);
  }
  activateDot('1');
}

const activateMedia = (element, dataset) => {
  dataset ? element.classList.add('media-active') : element.classList.remove('media-active')
}

const showModal = (element) => {
  swipeContainer.classList.add('blur');
  overlay.classList.add('overlay-active');
  Object.assign(element.style, {display: 'block'});
  setTimeout(() => { element.classList.add('modal-active'); }, 10);
}

const hideModal = (element) => {
  swipeContainer.classList.remove('blur');
  overlay.classList.remove('overlay-active');
  Object.assign(element.style, {display: 'none'});
  setTimeout(() => { element.classList.remove('modal-active'); }, 10);
}

const showYoutube = (player) => {
  player.playVideo();
  showModal(ytModal);
}

const hideYoutube = (player) => {
  player.seekTo(0, true);
  player.pauseVideo();
  hideModal(ytModal);
}

const showSoundcloud = (player) => {
  showModal(scModal);
  player.play();
}

const hideSoundcloud = (player) => {
  player.seekTo(0);
  player.pause();
  hideModal(scModal);
}

// load js for yt/sc APIs
let tagYt = document.createElement('script');
let tagSc = document.createElement('script');
tagYt.src = "https://www.youtube.com/iframe_api";
tagSc.src = "https://w.soundcloud.com/player/api.js";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tagYt, firstScriptTag);
firstScriptTag.parentNode.insertBefore(tagSc, firstScriptTag);

//init yt player
let player;
const firstVid = firstCard.dataset['youtubeId'];

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: `${firstVid}`,
  });
}

//init sc player
const scPlayer = document.querySelector('.sc-player');
const firstSound = firstCard.dataset['soundcloudUrl'];
let scWidget;

window.addEventListener('load', () => {
  scWidget = SC.Widget(scPlayer);
  scWidget.load(firstSound)
});

mediaYoutube.addEventListener('click', () => {
  showYoutube(player);
});

mediaSoundcloud.addEventListener('click', () => {
  showSoundcloud(scWidget);
});

overlay.addEventListener('click', () => {
  hideYoutube(player);
  hideSoundcloud(scWidget);
});

const initSwipe = () => {
  const card = document.querySelector('.card-active');
  const photos = card.querySelectorAll('.photo');
  const tick = card.querySelector('#tick');
  const cross = card.querySelector('#cross');
  const rotation = card.style.transform;
  let dragging = false;
  let transX = 0;
  let transY = 0;

  card.requestPointerLock = card.requestPointerLock ||
                            card.mozRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock ||
                             document.mozExitPointerLock;

  arrows.forEach((arrow) => {
    arrow.addEventListener('click', (event) => {
      const isNext = event.target.classList.contains('next');
      const activeImg = card.querySelector('.img-active');
      photoNav(isNext, activeImg);
    });
  });

  initDots(photos.length);

  activateMedia(mediaYoutube, card.dataset['youtubeId']);
  activateMedia(mediaSoundcloud, card.dataset['soundcloudUrl']);

  card.addEventListener('mousedown', () => {
    card.requestPointerLock();
    dragging = true;
  });

  window.addEventListener('mouseup', () => {
    document.exitPointerLock();
    if (!dragging) return;

    const discard = checkSwipe(card, tick, cross, rotation);

    dragging = false;
    transX = 0;
    transY = 0;
    Object.assign(card.style, {transform: `translateX(${discard}) translateY(0px) ${rotation}`, transition: 'transform 0.25s cubic-bezier(.27,1.15,.69,1.04)'});
    Object.assign(tick.style, {opacity: '0', transition: 'opacity 0.2s'});
    Object.assign(cross.style, {opacity: '0', transition: 'opacity 0.2s'});
  });

  window.addEventListener('mousemove', (event) => {
    if (dragging) {
      const xMin = -card.offsetWidth + (card.offsetWidth/10);
      const xMax = card.offsetWidth - (card.offsetWidth/10);

      transX = clampNumber(transX += event.movementX, xMin, xMax);
      transY = clampNumber(transY += event.movementY, -card.offsetHeight/2, card.offsetHeight/2);
      tick.style.opacity = transX / xMax;
      cross.style.opacity = transX / xMin;

      Object.assign(card.style, {transform: `translateX(${transX}px) translateY(${transY}px) ${rotation}`, transition: 'none'});
    }
  });
}

initSwipe();
