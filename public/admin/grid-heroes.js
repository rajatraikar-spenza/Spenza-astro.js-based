// Hero images on the editor's grid view (Blog, Imported posts, Guest blogs).
//
// Decap shows a card image only for a top-level image field. The hero is nested, so the grid
// had titles and no pictures. This adds the picture in the same place Decap puts one (under the
// title, 150px, cover). The slug-to-image map is /admin/hero-index.json, built from the same data
// as the live site. A post not in it yet (a draft that has never been published) falls back to
// /cms-media/<slug>/hero.webp, the path the publishing pipeline uses; if that is missing too,
// the card is left as it was.
(function () {
  var index = null;
  var failed = {};
  var queued = false;

  fetch('/admin/hero-index.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .catch(function () { return {}; })
    .then(function (j) { index = j; schedule(); });

  // Imported posts store /wp-content/uploads/... paths. Those files live on the media host,
  // not on spenza.com (the editor's own preview does the same).
  var MEDIA = 'https://media.spenza.com';
  function media(u) { return /^\/wp-(content|assets)\//.test(u) ? MEDIA + u : u; }

  function candidates(slug) {
    var e = index && index[slug];
    var list = [];
    if (e && e.thumb) list.push(e.thumb);
    if (e && e.url) list.push(e.url);
    list.push('/cms-media/' + slug + '/hero.webp');
    list = list.map(media);
    return list.filter(function (u, i) { return list.indexOf(u) === i; });
  }

  function tryLoad(list, done) {
    if (!list.length) return done(null);
    var img = new Image();
    img.onload = function () { done(list[0]); };
    img.onerror = function () { tryLoad(list.slice(1), done); };
    img.src = list[0];
  }

  function paint() {
    queued = false;
    if (!index || location.hash.indexOf('#/collections/') !== 0) return;
    var links = document.querySelectorAll('li > a[href*="/collections/"][href*="/entries/"]');
    Array.prototype.forEach.call(links, function (a) {
      var li = a.parentElement;
      // Grid cards are the tall ones; list rows are one line and keep their look.
      if (!li || li.offsetHeight < 200) return;
      if (a.querySelector('[data-testid="entry-card-image"], [data-hero-thumb]')) return;
      var m = a.getAttribute('href').match(/\/entries\/([^/?#]+)/);
      if (!m) return;
      var slug = decodeURIComponent(m[1]);
      if (failed[slug]) return;
      if (a.dataset.heroPending === slug) return;
      a.dataset.heroPending = slug;
      tryLoad(candidates(slug), function (url) {
        delete a.dataset.heroPending;
        if (!url) { failed[slug] = true; return; }
        if (a.querySelector('[data-hero-thumb]')) return;
        var d = document.createElement('div');
        d.setAttribute('data-hero-thumb', slug);
        d.style.cssText = 'background:#eee url("' + url + '") center/cover no-repeat;height:150px;';
        a.appendChild(d);
      });
    });
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', schedule);
})();
