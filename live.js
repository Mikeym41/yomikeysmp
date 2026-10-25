/* YoMikey SMP live data: the server publishes live.json to the repo's live-data branch every few minutes. */
(function () {
  var URL_LIVE = 'https://raw.githubusercontent.com/Mikeym41/yomikeysmp/live-data/live.json';
  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var src = local ? 'dev/live-sample.json' : URL_LIVE + '?t=' + Math.floor(Date.now() / 120000);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ago(t) {
    var s = Math.max(0, (Date.now() - t) / 1000);
    if (s < 90) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' days ago';
  }
  function date(t) { return t ? new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''; }
  function money(n) { return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function spark(vals, w, h, up) {
    if (!vals || vals.length < 2) return '';
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals); if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
    var pts = vals.map(function (v, i) { return (i * w / (vals.length - 1)).toFixed(1) + ',' + (h - 2 - (v - lo) / (hi - lo) * (h - 4)).toFixed(1); }).join(' ');
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke="' + (up ? '#5ee6a3' : '#ff6b6b') + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }
  // stable colour per nation
  var PAL = ['#19e3ff', '#ffd166', '#b49bff', '#5ee6a3', '#ff8fa3', '#7aa7ff', '#ffb36b', '#9ef0d0'];
  function colorFor(name) { if (!name) return '#8aa0bf'; var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return PAL[h % PAL.length]; }

  var listeners = [], data = null, failed = false;
  window.YMS = {
    esc: esc, ago: ago, date: date, money: money, spark: spark, colorFor: colorFor,
    onData: function (fn) { if (data) fn(data); else if (failed) fn(null); else listeners.push(fn); }
  };
  if (!window.fetch) { failed = true; return; }
  fetch(src, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { data = d; listeners.splice(0).forEach(function (fn) { fn(d); }); })
    .catch(function () { failed = true; listeners.splice(0).forEach(function (fn) { fn(null); }); });
})();
