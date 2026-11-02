"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Add an arrowhead to each screenshot's SVG overlay. The screenshot stays intact.
$$('.annotation').forEach((svg, index) => {
  const ns = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns, 'defs');
  const marker = document.createElementNS(ns, 'marker');
  marker.id = `annotation-arrow-${index}`;
  Object.entries({viewBox:'0 0 10 10', refX:'8', refY:'5', markerWidth:'7', markerHeight:'7', orient:'auto-start-reverse'}).forEach(([key, value]) => marker.setAttribute(key, value));
  const arrow = document.createElementNS(ns, 'path');
  arrow.setAttribute('d', 'M 0 0 L 9 5 L 0 10 Z');
  arrow.setAttribute('fill', '#87a5ff');
  marker.append(arrow); defs.append(marker); svg.prepend(defs);
  $$('.arrow-line', svg).forEach(path => { path.style.markerEnd = `url(#${marker.id})`; });
});

const regions = {
  library: ['1', '预设目录', '选择一个目录，比较其中的预设；点目录左边的小三角，可以展开单个预设名称。'],
  photos: ['2', '照片列表', '点“文件…”导入照片，或点“会话…”打开 C1 会话。点击缩略图，切换当前要比较的照片。'],
  matrix: ['3', '预设比较网格', '同一张照片显示多种预设效果。点右上角圆圈勾选候选，双击图片进入放大预览。'],
  inspector: ['4', '调色面板', '围绕当前效果调整白平衡、曝光、曲线等。可以撤销、复位，也可以复制调整；顶部按钮可收起面板。'],
  toolbar: ['5', '筛选与常用操作', '“仅显示已选”只看当前照片的候选；“查找”可组合名称和标记条件；“预设库…”选择预设来源。']
};
$$('.map-pin').forEach(button => button.addEventListener('click', () => {
  $$('.map-pin').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  const [number, title, description] = regions[button.dataset.region];
  $('#region-number').textContent = number;
  $('#region-title').textContent = title;
  $('#region-description').textContent = description;
}));

const features = {
  compare: {image:'compare', title:'先看整体方向', description:'照片保持相同，变化来自预设。比较时先固定一个观察区域，例如墙面的冷暖或玩偶的暗部。', alt:'同一张 RAW 的基础预览和四个预设并排显示'},
  select: {image:'shortlist-tight', title:'把范围收拢到喜欢的方向', description:'勾选属于当前照片，收藏属于常用预设。只显示已选后，继续在少量候选之间比较。', alt:'已选筛选只显示 Cinema Cool 和 Film F400 两个候选'},
  enlarge: {image:'enlarged-f400', title:'先看大图，再决定怎么调', description:'放大窗口可缩放、拖动和切换候选，右侧面板可以调整当前效果。检查原始细节前，先确认预览尺寸。', alt:'Film F400 的放大窗口与右侧调色面板'},
  push: {image:'c1-pushed', title:'候选与调整，接回 Capture One', description:'对当前照片勾选预设。从 C1 会话打开时默认推回该会话，也可设置现有或新建目标；第 03 章说明两条路径与操作入口。', alt:'StyleDeck 中两个候选都显示已推送'},
  export: {image:'export', title:'项目与成片，各有用途', description:'保存 .styledeck 项目，方便继续比较与调整；导出 JPEG / PNG，用于分享照片，可选择尺寸和色彩空间。', alt:'导出界面的格式、JPEG 画质、sRGB 和尺寸选项局部'}
};
function activateFeature(button, focus = false) {
  const feature = features[button.dataset.feature];
  $$('.feature-tab').forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
  const path = `assets/screenshots/${feature.image}.webp`;
  $('#feature-image').src = path; $('#feature-image').alt = feature.alt;
  $('#feature-image-button').dataset.lightbox = path;
  $('#feature-image-button').dataset.caption = feature.title;
  $('#feature-panel').setAttribute('aria-labelledby', button.id);
  $('#feature-title').textContent = feature.title;
  $('#feature-description').textContent = feature.description;
  if (focus) button.focus();
}
const featureTabs = $$('.feature-tab');
featureTabs.forEach((button, index) => {
  button.addEventListener('click', () => activateFeature(button));
  button.addEventListener('keydown', event => {
    let target;
    if (['ArrowDown', 'ArrowRight'].includes(event.key)) target = (index + 1) % featureTabs.length;
    if (['ArrowUp', 'ArrowLeft'].includes(event.key)) target = (index - 1 + featureTabs.length) % featureTabs.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = featureTabs.length - 1;
    if (target !== undefined) { event.preventDefault(); activateFeature(featureTabs[target], true); }
  });
});

const lightbox = $('#lightbox');
const lightboxImage = $('#lightbox-image');
const lightboxZoom = $('#lightbox-zoom');
function resetZoom() {
  lightbox.classList.remove('native-size');
  lightboxZoom.setAttribute('aria-pressed', 'false');
  lightboxZoom.textContent = '原尺寸查看';
  $('.lightbox-viewport').scrollTo(0, 0);
}
$$('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
  const caption = button.dataset.caption || $('img', button)?.alt || '截图详情';
  lightboxImage.src = button.dataset.lightbox;
  lightboxImage.alt = caption;
  $('#lightbox-caption').textContent = caption;
  resetZoom(); lightbox.showModal(); document.body.classList.add('lightbox-open');
}));
$('#lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('close', () => { document.body.classList.remove('lightbox-open'); resetZoom(); });
lightbox.addEventListener('click', event => { if (event.target === lightbox) { const r = lightbox.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) lightbox.close(); } });
lightboxZoom.addEventListener('click', () => {
  const native = lightbox.classList.toggle('native-size');
  lightboxZoom.setAttribute('aria-pressed', String(native));
  lightboxZoom.textContent = native ? '适合窗口' : '原尺寸查看';
});

const sidebar = $('#sidebar');
const menuToggle = $('.menu-toggle');
function closeMenu() { sidebar.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }
menuToggle.addEventListener('click', () => { const opened = sidebar.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(opened)); });
$$('a', sidebar).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) closeMenu(); });
const navigationLinks = $$('nav a[href^="#"]', sidebar);
const watchedSections = navigationLinks.map(link => $(link.getAttribute('href'))).filter(Boolean).sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
function updateReadingPosition() {
  let current = watchedSections[0];
  for (const section of watchedSections) if (section.getBoundingClientRect().top <= 180) current = section;
  navigationLinks.forEach(link => {
    const active = link.hash === `#${current.id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
}
let scrollPending = false;
window.addEventListener('scroll', () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(() => { updateReadingPosition(); scrollPending = false; }); } }, {passive:true});
updateReadingPosition();

// A narrated path over real screenshots. It never controls the actual application.
const demoSteps = [
  {image:'compare', after:'one-selected', x:70.9, y:18.25, caption:'点 Cinema Cool 右上角圆圈，留下第一个候选。', alt:'四个预设的比较网格，尚未勾选候选'},
  {image:'one-selected', after:'select', x:44.4, y:61.3, caption:'再点 Film F400 右上角圆圈，留下第二个候选。', alt:'Cinema Cool 已勾选，准备选择 Film F400'},
  {image:'select', after:'shortlist-tight', x:70.5, y:2.8, caption:'点顶部“仅显示已选”，收拢到两个候选；结果图已适当放大预览。', alt:'两个候选已勾选，准备开启仅显示已选'},
  {image:'shortlist-tight', after:'shortlist-tight', x:33, y:35, caption:'现在只比较两个候选。双击任意图片，可进入放大预览。', alt:'仅显示已选已开启，只保留两个候选'}
];
function initTour(prefix, demoSteps) {
const local = selector => $(selector.replace('#demo-', `#${prefix}-`), document.getElementById(prefix === 'demo' ? 'operation-demo' : `${prefix}-demo`));
const demoImage = local('#demo-image');
const demoCursor = local('.demo-cursor');
const demoTarget = local('.demo-target');
const playButton = local('#demo-play');
let demoIndex = 0, demoPlaying = false, demoFinished = false, demoTimers = [];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function clearDemoTimers() { demoTimers.forEach(clearTimeout); demoTimers = []; demoCursor.classList.remove('clicking'); }
function later(fn, ms) { demoTimers.push(setTimeout(fn, ms)); }
function setDemoImage(name, alt) { demoImage.src = `assets/screenshots/${name}.webp`; demoImage.alt = alt; }
function renderDemo(index) {
  demoIndex = Math.max(0, Math.min(demoSteps.length - 1, index));
  const step = demoSteps[demoIndex];
  setDemoImage(step.image, step.alt);
  local('#demo-count').textContent = `${demoIndex + 1} / ${demoSteps.length}`;
  local('#demo-caption').textContent = step.caption;
  local('#demo-prev').disabled = demoIndex === 0;
  local('#demo-next').disabled = demoIndex === demoSteps.length - 1;
  demoTarget.style.left = `${step.x}%`; demoTarget.style.top = `${step.y}%`;
  demoCursor.style.left = `${step.x}%`; demoCursor.style.top = `${step.y}%`;
}
function pauseDemo() {
  const cursorPosition = getComputedStyle(demoCursor);
  const left = cursorPosition.left, top = cursorPosition.top;
  demoCursor.style.transition = 'none';
  demoCursor.style.left = left; demoCursor.style.top = top;
  demoPlaying = false; clearDemoTimers();
  playButton.innerHTML = '<span aria-hidden="true">▶</span> 继续演示';
  playButton.setAttribute('aria-label', '继续播放鼠标操作演示');
}
function runDemoStep() {
  const step = demoSteps[demoIndex];
  const previous = demoIndex ? demoSteps[demoIndex - 1] : {x:34,y:44};
  demoCursor.style.transition = 'none'; renderDemo(demoIndex);
  demoCursor.style.left = `${previous.x}%`; demoCursor.style.top = `${previous.y}%`;
  later(() => {
    demoCursor.style.transition = reducedMotion.matches ? 'none' : '';
    demoCursor.style.left = `${step.x}%`; demoCursor.style.top = `${step.y}%`;
  }, 70);
  if (!step.hover) later(() => { demoCursor.classList.remove('clicking'); void demoCursor.offsetWidth; demoCursor.classList.add('clicking'); }, 1120);
  later(() => setDemoImage(step.after, demoIndex === demoSteps.length - 1 ? step.alt : `${step.caption} 操作完成后的真实界面`), 1400);
  later(() => {
    if (demoIndex < demoSteps.length - 1) { demoIndex++; runDemoStep(); }
    else { clearDemoTimers(); demoPlaying = false; demoFinished = true; playButton.innerHTML = '<span aria-hidden="true">↻</span> 重新播放'; playButton.setAttribute('aria-label', '重新播放完整鼠标操作演示'); }
  }, 3400);
}
playButton.addEventListener('click', () => {
  if (demoPlaying) { pauseDemo(); return; }
  clearDemoTimers(); if (demoFinished) { demoIndex = 0; demoFinished = false; }
  demoPlaying = true; playButton.innerHTML = '<span aria-hidden="true">Ⅱ</span> 暂停演示';
  playButton.setAttribute('aria-label', '暂停鼠标操作演示'); runDemoStep();
});
function manualDemo(index) { pauseDemo(); demoFinished = false; renderDemo(index); playButton.innerHTML = '<span aria-hidden="true">▶</span> 播放演示'; }
local('#demo-prev').addEventListener('click', () => manualDemo(demoIndex - 1));
local('#demo-next').addEventListener('click', () => manualDemo(demoIndex + 1));
local('#demo-reset').addEventListener('click', () => manualDemo(0));
document.addEventListener('visibilitychange', () => { if (document.hidden && demoPlaying) pauseDemo(); });
[...new Set(demoSteps.flatMap(step => [step.image, step.after]))].forEach(name => { const image = new Image(); image.src = `assets/screenshots/${name}.webp`; });
renderDemo(0);

}
initTour('demo', demoSteps);
initTour('session', [
{image:'session-start',after:'session-picker-stage',x:11.7,y:55.6,caption:'点左下方“会话…”，进入会话文件选择窗口。',alt:'StyleDeck 照片区域的会话入口'},
{image:'session-picker-stage',after:'session-canon',x:76.6,y:72.5,caption:'选中 .cosessiondb 后点 Open；打开后选择 Film & Cine Looks 目录。',alt:'已选中公开样片的演示会话数据库'},
{image:'session-canon',after:'session-sony',x:14,y:78,caption:'点 Sony 缩略图：同一组样式改为显示另一张照片。',alt:'四张照片已载入，当前显示 Canon 样片'},
{image:'session-sony',after:'session-nikon',x:5,y:78,caption:'再点 Nikon 缩略图，回到本次详细比较的静物样片。',alt:'当前显示 Sony 样片，同一会话中可以逐张比较'}
]);

initTour('panels', [
  {image:'fullscreen',after:'fullscreen-left',x:.3,y:46,hover:true,caption:'移到最左边缘：展开预设目录与照片列表，不用点击。',alt:'全屏主窗口的两侧面板已隐藏'},
  {image:'fullscreen-left',after:'fullscreen',x:48,y:48,hover:true,caption:'移回中间图片区域：左侧面板自动收起。',alt:'全屏左侧面板已展开'},
  {image:'fullscreen',after:'fullscreen-right',x:99.6,y:46,hover:true,caption:'移到最右边缘：展开调色面板，不用点击。',alt:'全屏主窗口的两侧面板已隐藏'},
  {image:'fullscreen-right',after:'fullscreen',x:48,y:48,hover:true,caption:'移回中间：右侧面板收起；按 F 或 Esc 可退出主窗口全屏。',alt:'全屏右侧调色面板已展开'}
]);
