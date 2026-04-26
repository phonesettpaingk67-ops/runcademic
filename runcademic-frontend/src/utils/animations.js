import { animate, stagger } from 'animejs';

// Fade in + slide up for page content
export function animatePageEnter(selector) {
  animate(selector, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 400,
    easing: 'easeOutCubic',
  });
}

// Staggered entrance for stat cards
export function animateCards(selector) {
  animate(selector, {
    opacity: [0, 1],
    translateY: [24, 0],
    scale: [0.96, 1],
    delay: stagger(80),
    duration: 450,
    easing: 'easeOutCubic',
  });
}

// Slide in from left for sidebar
export function animateSidebar(selector) {
  animate(selector, {
    opacity: [0, 1],
    translateX: [-20, 0],
    duration: 350,
    easing: 'easeOutCubic',
  });
}

// Staggered list items
export function animateList(selector) {
  animate(selector, {
    opacity: [0, 1],
    translateX: [-10, 0],
    delay: stagger(60),
    duration: 300,
    easing: 'easeOutCubic',
  });
}

// Login panel entrance
export function animateLogin(selector) {
  animate(selector, {
    opacity: [0, 1],
    scale: [0.97, 1],
    translateY: [16, 0],
    duration: 500,
    easing: 'easeOutCubic',
  });
}

// Number counter for stat values
export function animateCounter(element, targetValue) {
  const obj = { value: 0 };
  animate(obj, {
    value: targetValue,
    round: 1,
    duration: 480,
    easing: 'easeOutCubic',
    update: () => {
      if (element) element.textContent = obj.value;
    },
  });
}

// Shake animation for errors
export function animateError(selector) {
  animate(selector, {
    translateX: [-8, 8, -6, 6, -4, 4, 0],
    duration: 400,
    easing: 'easeInOutSine',
  });
}
