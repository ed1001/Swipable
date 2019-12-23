const cards = document.querySelectorAll('.card');
const arrows = document.querySelectorAll('.arrow');
const dots = document.querySelector('.photo-dots');

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
  dots.querySelector('.active-dot').classList.remove('active-dot');
  dots.querySelector(`[data-id='${id}']`).classList.add('active-dot');
}

const photoNav = (isNext, activeImg) => {
  if (isNext && activeImg.nextElementSibling) {
    activateDot(activeImg.nextElementSibling.dataset['id']);
    passClass(activeImg, activeImg.nextElementSibling, 'active-img');
  } else if (!isNext && activeImg.previousElementSibling) {
    activateDot(activeImg.previousElementSibling.dataset['id']);
    passClass(activeImg, activeImg.previousElementSibling, 'active-img');
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
    initSwipe();
  }
}

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
      const activeImg = card.querySelector('.active-img');
      photoNav(isNext, activeImg);
    });
  });

  activateDot('1');

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
