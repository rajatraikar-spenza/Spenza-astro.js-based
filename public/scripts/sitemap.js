/* /sitemap/ — filter the list as the reader types, and mark the section in view.
 *
 * The list is plain HTML that works without this file; this only narrows it.
 * Everything keys off the attributes the build writes (`data-q` on each link,
 * `data-sm-group` on each section, `data-sm-chip` on each chip), so a section
 * added to the page needs no change here.
 */
(function () {
  var input = document.getElementById('sm-q');
  if (!input) return;

  var status = document.getElementById('sm-status');
  var empty = document.getElementById('sm-empty');
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-sm-group]'));
  var chips = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-sm-chip]'), function (c) {
    chips[c.getAttribute('data-sm-chip')] = c;
  });

  var total = 0;
  groups.forEach(function (g) {
    total += g.querySelectorAll('li').length;
  });

  function filter() {
    var q = input.value.trim().toLowerCase();
    var terms = q ? q.split(/\s+/) : [];
    var shown = 0;

    groups.forEach(function (g) {
      var n = 0;
      Array.prototype.forEach.call(g.querySelectorAll('li'), function (li) {
        var hay = li.getAttribute('data-q') || '';
        var hit = terms.every(function (t) {
          return hay.indexOf(t) !== -1;
        });
        li.hidden = !hit;
        if (hit) n++;
      });
      g.hidden = n === 0;
      shown += n;

      var count = g.querySelector('[data-sm-count]');
      if (count) count.textContent = terms.length ? n + ' of ' + count.getAttribute('data-total') : count.getAttribute('data-total');
      var chip = chips[g.id];
      if (chip) {
        chip.classList.toggle('is-empty', n === 0);
        var num = chip.querySelector('span');
        if (num) num.textContent = terms.length ? String(n) : g.querySelector('[data-sm-count]').getAttribute('data-total');
      }
    });

    empty.hidden = shown !== 0;
    status.textContent = terms.length ? shown + ' of ' + total : '';
  }

  input.addEventListener('input', filter);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && input.value) {
      input.value = '';
      filter();
    }
  });

  // "/" focuses the search, unless the reader is already typing somewhere.
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault();
    input.focus();
    input.select();
  });

  // A shared link such as /sitemap/?q=esim opens already filtered.
  try {
    var preset = new URLSearchParams(location.search).get('q');
    if (preset) {
      input.value = preset;
      filter();
    }
  } catch (_) {}

  // Mark the chip of the section nearest the top of the window.
  if ('IntersectionObserver' in window) {
    var seen = {};
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          seen[en.target.id] = en.isIntersecting ? en.boundingClientRect.top : null;
        });
        var best = null;
        groups.forEach(function (g) {
          if (g.hidden || seen[g.id] == null) return;
          if (best === null || seen[g.id] < seen[best]) best = g.id;
        });
        Object.keys(chips).forEach(function (id) {
          chips[id].classList.toggle('is-on', id === best);
        });
      },
      { rootMargin: '-140px 0px -55% 0px', threshold: 0 }
    );
    groups.forEach(function (g) {
      io.observe(g);
    });
  }
})();
