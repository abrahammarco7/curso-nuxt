'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const mobileNavigation = document.getElementById('mobile-navigation');

function setMenu(open, restoreFocus = false) {
  if (!menuToggle || !mobileNavigation) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  mobileNavigation.hidden = !open;
  if (restoreFocus) menuToggle.focus();
}

menuToggle?.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});
mobileNavigation?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    setMenu(false);
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false, true);
  }
});
window.matchMedia('(min-width: 1051px)').addEventListener('change', event => {
  if (event.matches) setMenu(false);
});

const year = document.getElementById('current-year');
if (year) year.textContent = new Intl.DateTimeFormat('es-ES', { year: 'numeric', timeZone: 'Atlantic/Canary' }).format(new Date());

const credits = document.getElementById('credits-dialog');
document.getElementById('credits-button')?.addEventListener('click', () => credits?.showModal());
credits?.querySelector('.dialog-close')?.addEventListener('click', () => credits.close());
credits?.addEventListener('click', event => {
  if (event.target !== credits) return;
  const box = credits.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) credits.close();
});

document.getElementById('load-map')?.addEventListener('click', () => {
  const map = document.getElementById('map-preview');
  if (!map) return;
  const iframe = document.createElement('iframe');
  iframe.title = 'Ubicación de Farmacia Carolina Viera Bosa en El Tablero';
  iframe.src = 'https://maps.google.com/maps?q=Farmacia%20Carolina%20Viera%20Bosa%20El%20Tablero&t=m&z=17&output=embed';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.allowFullscreen = true;
  iframe.width = '600';
  iframe.height = '285';
  map.replaceChildren(iframe);
});

const gallery = document.getElementById('pharmacy-gallery');
if (gallery) {
  const slides = [...gallery.querySelectorAll('.gallery-slide')];
  const dots = [...gallery.querySelectorAll('[data-slide]')];
  const controls = gallery.querySelector('.gallery-controls');
  const toggle = gallery.querySelector('.gallery-pause');
  const toggleLabel = toggle.querySelector('span');
  const toggleIcon = toggle.querySelector('use');
  const status = gallery.querySelector('.gallery-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const intervalMs = 5000;
  let current = 0;
  let paused = reducedMotion.matches;
  let hovered = false;
  let timer = null;
  let pointerToggleAction = null;

  function showSlide(index, announce = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      dots[i].setAttribute('aria-current', String(i === current));
    });
    if (announce) status.textContent = `Foto ${current + 1} de ${slides.length}: ${slides[current].dataset.caption}`;
  }

  function syncPlayback() {
    clearInterval(timer);
    timer = null;
    toggleLabel.textContent = paused ? 'Reanudar' : 'Pausar';
    toggle.setAttribute('aria-label', paused ? 'Reanudar el pase automático de fotos' : 'Pausar el pase automático de fotos');
    toggleIcon.setAttribute('href', paused ? '#icon-play' : '#icon-pause');
    if (!paused && !hovered && !document.hidden && slides.length > 1) {
      timer = setInterval(() => showSlide(current + 1), intervalMs);
    }
  }

  function setPaused(value) {
    paused = value;
    syncPlayback();
  }

  // Keep the intended pointer action even if focusing the button pauses the gallery.
  toggle.addEventListener('pointerdown', () => { pointerToggleAction = !paused; });
  toggle.addEventListener('pointercancel', () => { pointerToggleAction = null; });
  toggle.addEventListener('click', event => {
    const next = event.detail > 0 && pointerToggleAction !== null ? pointerToggleAction : !paused;
    pointerToggleAction = null;
    setPaused(next);
  });
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      setPaused(true);
      showSlide(index, true);
    });
  });
  gallery.addEventListener('focusin', () => setPaused(true));
  gallery.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') { hovered = true; syncPlayback(); }
  });
  gallery.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') { hovered = false; syncPlayback(); }
  });
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) setPaused(true);
  });

  controls.hidden = false;
  showSlide(0);
  syncPlayback();
}

