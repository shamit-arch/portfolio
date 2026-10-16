const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * Caption bar under the painting with ◀ ▶ controls.
 * slides: [{ type: 'triptych' | 'trio', items: [painting, ...] }]
 * A trio shows up to three single paintings; tabs (or clicking a panel) pick which one is described.
 */
export function createGallery(el, slides, { onSlide, onSelect }) {
  let slide = 0;
  let item = 0;
  el.innerHTML = `
    <button class="gal-arrow" data-dir="-1" aria-label="Previous">◀</button>
    <div class="gal-info">
      <div class="gal-count"></div>
      <div class="gal-tabs" hidden></div>
      <h2 class="gal-title"></h2>
      <div class="gal-meta"></div>
      <p class="gal-note"></p>
      <a class="gal-orig" target="_blank" rel="noopener" hidden>view original ↗</a>
      <p class="gal-hint">More of my drawings are on the laptop → drawings/</p>
    </div>
    <button class="gal-arrow" data-dir="1" aria-label="Next">▶</button>`;
  const q = (s) => el.querySelector(s);
  el.querySelectorAll('.gal-arrow').forEach((b) => b.addEventListener('click', () => go(slide + +b.dataset.dir)));
  q('.gal-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-item]');
    if (b) select(+b.dataset.item);
  });

  function render() {
    const s = slides[slide];
    const p = s.items[item];
    const many = slides.length > 1;
    el.classList.toggle('single', !many);
    el.querySelectorAll('.gal-arrow').forEach((b) => (b.hidden = !many));
    q('.gal-count').hidden = !many;
    q('.gal-count').textContent = `${String(slide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}${s.type === 'trio' ? ' · set of ' + s.items.length : ''}`;
    const tabs = q('.gal-tabs');
    tabs.hidden = s.type !== 'trio' || s.items.length < 2;
    tabs.innerHTML = s.items.map((it, i) => `<button data-item="${i}" class="${i === item ? 'on' : ''}">${esc(it.title)}</button>`).join('');
    q('.gal-title').textContent = p.title;
    q('.gal-meta').textContent = [p.medium, p.year].filter(Boolean).join(' · ');
    q('.gal-note').textContent = p.note || '';
    const orig = q('.gal-orig');
    orig.hidden = !p.src;
    if (p.src) orig.href = p.src;
  }
  function go(i) {
    const n = slides.length;
    const next = ((i % n) + n) % n;
    if (next === slide) return;
    slide = next;
    item = 0;
    render();
    onSlide(slide);
    onSelect(slide, item);
  }
  function select(i) {
    if (i < 0 || i >= slides[slide].items.length) return;
    item = i;
    render();
    onSelect(slide, item);
  }
  render();
  return {
    go,
    select,
    next: () => go(slide + 1),
    prev: () => go(slide - 1),
    set(s, i = 0) {
      slide = s;
      item = i;
      render();
    },
    get slide() {
      return slide;
    },
    get item() {
      return item;
    },
  };
}

const STATUS = { watching: 'Watching', completed: 'Completed', plan: 'Plan to watch', dropped: 'Dropped' };

/** The straw-hat anime log. */
export function createAnimeLog(el, anime) {
  let filter = 'all';
  const counts = anime.reduce((m, a) => ((m[a.status] = (m[a.status] || 0) + 1), m), {});
  el.innerHTML = `
    <div class="log-paper">
      <div class="log-head">
        <div class="log-kicker">CAPTAIN'S</div>
        <h2>ANIME LOG</h2>
        <div class="log-sub">${anime.length} entries · ${counts.completed || 0} completed · ${counts.watching || 0} sailing now</div>
      </div>
      <div class="log-tabs">
        ${['all', 'watching', 'completed', 'plan'].map((f) => `<button data-f="${f}">${f === 'all' ? 'All' : STATUS[f]}</button>`).join('')}
      </div>
      <ol class="log-list"></ol>
    </div>`;
  const list = el.querySelector('.log-list');
  el.querySelector('.log-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    filter = b.dataset.f;
    render();
  });
  function stars(n) {
    const full = Math.round(n / 2);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }
  function render() {
    el.querySelectorAll('.log-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.f === filter));
    const rows = anime
      .filter((a) => filter === 'all' || a.status === filter)
      .sort((a, b) => b.rating - a.rating);
    list.innerHTML = rows.map((a) => `
      <li class="st-${esc(a.status)}">
        <div class="log-row">
          <span class="log-title">${esc(a.title)}</span>
          <span class="log-stars" title="${a.rating}/10">${a.status === 'plan' ? '—' : stars(a.rating)}</span>
        </div>
        <div class="log-detail">
          <span class="log-badge">${esc(STATUS[a.status] || a.status)}</span>
          ${a.fav && a.fav !== '—' ? `<span>fav: ${esc(a.fav)}</span>` : ''}
          ${a.note ? `<em>${esc(a.note)}</em>` : ''}
        </div>
      </li>`).join('') || '<li class="log-empty">Nothing here yet.</li>';
  }
  render();
}

export function createNotebook(el, now) {
  el.innerHTML = `
    <div class="nb-page">
      <h2>${esc(now.heading)}</h2>
      <ul>${now.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      <div class="nb-sign">— scribbled at my desk</div>
    </div>`;
}

/** Plain, accessible HTML version of everything (no WebGL needed). */
export function createPlain(el, c) {
  el.innerHTML = `
    <div class="plain-inner">
      <button class="plain-close">◀ back to the desk</button>
      <h1>${esc(c.profile.name)}</h1>
      <p class="plain-sub">${esc(c.profile.title)} · ${esc(c.profile.location)}</p>
      ${c.profile.bio.map((p) => `<p>${esc(p)}</p>`).join('')}
      <h2>Experience</h2>
      ${(c.experience || []).map((x) => `<article><h3>${esc(x.role)} <small>${esc(x.years)}</small></h3><p class="plain-sub">${esc(x.org)}</p>
        <ul>${x.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></article>`).join('')}
      <h2>Education</h2>
      ${(c.education || []).map((e) => `<article><h3>${esc(e.degree)} <small>${esc(e.years)}</small></h3><p class="plain-sub">${esc(e.school)}</p><p>${esc(e.notes || '')}</p></article>`).join('')}
      <p><a href="${esc(c.profile.resumeUrl)}" target="_blank" rel="noopener">View resume ↗</a></p>
      <h2>Projects</h2>
      ${c.projects.map((p) => `<article><h3>${esc(p.title)} <small>${esc(p.year || '')}</small></h3><p>${esc(p.description)}</p>
        <p class="plain-tags">${(p.tags || []).map(esc).join(' · ')}</p>
        <p>${(p.links || []).map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(' ')}</p></article>`).join('')}
      <h2>Skills</h2>
      <ul>${c.skills.map((s) => `<li>${esc(s.name)} — ${s.level}/10</li>`).join('')}</ul>
      <h2>Drawings &amp; paintings</h2>
      <ul>${(c.drawings || []).map((p) => `<li><a href="${esc(p.src)}" target="_blank" rel="noopener">${esc(p.title)}</a>${p.medium ? ` — ${esc([p.medium, p.year].filter(Boolean).join(', '))}` : ''}</li>`).join('')}</ul>
      <h2>Anime</h2>
      <ul>${c.anime.map((a) => `<li>${esc(a.title)} — ${esc(STATUS[a.status] || a.status)}${a.status !== 'plan' ? ` (${a.rating}/10)` : ''}</li>`).join('')}</ul>
      <h2>Contact</h2>
      <ul>${c.contact.map((x) => `<li>${esc(x.label)}: <a href="${esc(x.href)}">${esc(x.value)}</a></li>`).join('')}</ul>
    </div>`;
}
