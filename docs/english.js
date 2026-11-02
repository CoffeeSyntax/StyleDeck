'use strict';
const sidebar = document.querySelector('#sidebar');
const menu = document.querySelector('.menu-toggle');
const closeMenu = () => { sidebar.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
menu.addEventListener('click', () => { const open = sidebar.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
const box = document.querySelector('#en-lightbox');
const image = document.querySelector('#en-image');
const zoom = document.querySelector('#en-zoom');
const caption = document.querySelector('#en-caption');
function resetZoom() { box.classList.remove('native-size'); zoom.setAttribute('aria-pressed', 'false'); zoom.textContent = 'Original size'; }
document.querySelectorAll('[data-src]').forEach(button => button.addEventListener('click', () => { image.src = button.dataset.src; image.alt = button.dataset.caption; caption.textContent = button.dataset.caption; resetZoom(); box.showModal(); document.body.classList.add('lightbox-open'); }));
document.querySelector('#en-close').addEventListener('click', () => box.close());
box.addEventListener('close', () => { document.body.classList.remove('lightbox-open'); resetZoom(); });
box.addEventListener('click', event => { if (event.target === box) { const r = box.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) box.close(); } });
zoom.addEventListener('click', () => { const native = box.classList.toggle('native-size'); zoom.setAttribute('aria-pressed', String(native)); zoom.textContent = native ? 'Fit window' : 'Original size'; });
document.querySelectorAll('.en-tour').forEach(tour => {
  const steps = JSON.parse(tour.dataset.steps), picture = tour.querySelector('.en-tour-image'), cursor = tour.querySelector('.demo-cursor'), target = tour.querySelector('.demo-target'), play = tour.querySelector('.en-play'), previous = tour.querySelector('.en-prev'), next = tour.querySelector('.en-next');
  let index = 0, timer = null;
  function render() { const step = steps[index]; picture.src = `assets/screenshots/${step.image}.webp`; picture.alt = step.caption; tour.querySelector('.en-count').textContent = `${index + 1} / ${steps.length}`; tour.querySelector('.en-tour-caption').textContent = step.caption; cursor.style.left = target.style.left = `${step.x}%`; cursor.style.top = target.style.top = `${step.y}%`; previous.disabled = index === 0; next.disabled = index === steps.length - 1; }
  function pause() { clearInterval(timer); timer = null; play.textContent = '▶ Play'; }
  play.addEventListener('click', () => { if (timer) { pause(); return; } if (index === steps.length - 1) index = 0; render(); play.textContent = 'Ⅱ Pause'; timer = setInterval(() => { if (index < steps.length - 1) { index++; render(); } else pause(); }, 2600); });
  previous.addEventListener('click', () => { pause(); index = Math.max(0, index - 1); render(); });
  next.addEventListener('click', () => { pause(); index = Math.min(steps.length - 1, index + 1); render(); });
  tour.querySelector('.en-reset').addEventListener('click', () => { pause(); index = 0; render(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  render();
});
