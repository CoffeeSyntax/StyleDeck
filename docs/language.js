/* Preserve an explicit choice and deep link on a static host. */
(() => {
  const key = 'styledeck-guide-language';
  const url = new URL(location.href);
  const explicit = url.searchParams.get('lang');
  const current = /\/en\.html$/i.test(url.pathname) ? 'en' : 'zh';
  let stored = null;
  try { stored = localStorage.getItem(key); } catch (_) {}
  const browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || 'zh';
  const desired = explicit === 'en' || explicit === 'zh' ? explicit : (current === 'en' ? 'en' : (stored === 'en' || stored === 'zh' ? stored : (/^zh\b/i.test(browserLanguage) ? 'zh' : 'en')));
  if (desired !== current) {
    const next = new URL(desired === 'en' ? 'en.html' : 'index.html', url);
    next.search = url.search;
    next.searchParams.set('lang', desired);
    next.hash = url.hash;
    location.replace(next.href);
    return;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const link = document.querySelector('.language-switch');
    if (!link) return;
    const target = current === 'en' ? 'zh' : 'en';
    const destination = new URL(target === 'en' ? 'en.html' : 'index.html', url);
    destination.search = url.search;
    destination.searchParams.set('lang', target);
    destination.hash = location.hash;
    link.href = destination.href;
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      try { localStorage.setItem(key, target); } catch (_) {}
      destination.hash = location.hash;
      location.assign(destination.href);
    });
  });
})();
