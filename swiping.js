const returnDuration = 0.3 * 60;

const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

const checkSwipe = (card, tick, cross) => {
  if (tick.style.opacity > 0.8) {
    processSwipe(card, true);
  } else if (cross.style.opacity > 0.8) {
    processSwipe(card, false);
  }
}

const processSwipe = (card, like) => {
  card.parentNode.removeChild(card);
  const nextCard = document.querySelector('.card-container').lastElementChild;

  if (nextCard) {
    nextCard.classList.add('active');
    initSwipe();
  }
}

const initSwipe = () => {
  const card = document.querySelector('.active');
  const tick = card.querySelector('#tick');
  const cross = card.querySelector('#cross');
  let dragging = false;
  let transX = 0;
  let transY = 0;
  card.requestPointerLock = card.requestPointerLock ||
                            card.mozRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock ||
                             document.mozExitPointerLock;

  card.addEventListener('mousedown', () => {
    card.requestPointerLock();
    dragging = true;
  });

  window.addEventListener('mouseup', () => {
    document.exitPointerLock();
    if (dragging) {
      checkSwipe(card, tick, cross);

      dragging = false;
      transX = 0;
      transY = 0;
      Object.assign(card.style, {transform: 'translateX(0px) translateY(0px)', transition: 'transform 0.25s cubic-bezier(.27,1.15,.69,1.04)'});
      tick.style.opacity = 0;
      cross.style.opacity = 0;
    }
  });

  window.addEventListener('mousemove', (event) => {
    if (dragging) {
      const xMin = -card.offsetWidth + (card.offsetWidth/10);
      const xMax = card.offsetWidth - (card.offsetWidth/10);

      transX = clampNumber(transX += event.movementX, xMin, xMax);
      transY = clampNumber(transY += event.movementY, -card.offsetHeight/2, card.offsetHeight/2);
      tick.style.opacity = transX / xMax;
      cross.style.opacity = transX / xMin;

      Object.assign(card.style, {transform: `translateX(${transX}px) translateY(${transY}px)`, transition: 'none'});
    }
  });
}

initSwipe();
