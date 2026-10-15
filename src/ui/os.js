import { icon, projectThumb } from './icons.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * "ShamitOS": a tiny retro desktop rendered as HTML on top of the 3D laptop screen.
 * opts: { content, art, onShutdown, onOpenGallery(i), onOpenAnime, onPower, sfx }
 */
export function createOS(root, opts) {
  const { content, sfx, art } = opts;
  const { profile, projects, skills, contact, anime, education = [], experience = [] } = content;
  let state = 'off';
  let zTop = 10;
  const windows = new Map();

  root.innerHTML = `
    <div class="os-screen os-off">
      <button class="os-power" aria-label="Power on">
        <span class="os-power-icon">⏻</span>
        <span class="os-power-text">PRESS POWER</span>
      </button>
    </div>
    <div class="os-screen os-boot" hidden><pre></pre><div class="os-bar"><i></i></div></div>
    <div class="os-screen os-desktop" hidden>
      <div class="os-icons"></div>
      <div class="os-windows"></div>
      <div class="os-startmenu" hidden></div>
      <div class="os-taskbar">
        <button class="os-start"><img src="${icon('start')}" alt="">START</button>
        <div class="os-tasks"></div>
        <div class="os-clock"></div>
      </div>
    </div>
    <div class="os-scanlines"></div>`;

  const $ = (s) => root.querySelector(s);
  const offEl = $('.os-off'), bootEl = $('.os-boot'), deskEl = $('.os-desktop');
  const winLayer = $('.os-windows'), tasks = $('.os-tasks'), startMenu = $('.os-startmenu');

  $('.os-power').addEventListener('click', () => boot());

  // ── apps ──────────────────────────────────────────────────
  const apps = {
    about: {
      title: 'about_me.txt', icon: 'txt', w: 56, h: 62,
      body: () => `
        <div class="np-menu"><span>File</span><span>Edit</span><span>Help</span></div>
        <div class="np-text">
          <p class="np-h">${esc(profile.name)}</p>
          <p class="np-sub">${esc(profile.title)} · ${esc(profile.location)}</p>
          ${profile.bio.map((p) => `<p>${esc(p)}</p>`).join('')}
          <p class="np-sub">Next, open <b>experience.txt</b>, <b>projects/</b>, <b>skills.exe</b> or <b>contact.lnk</b>.</p>
        </div>`,
    },
    cv: {
      title: 'experience.txt', icon: 'txt', w: 60, h: 66,
      body: () => `
        <div class="np-menu"><span>File</span><span>Edit</span><span>Help</span></div>
        <div class="np-text">
          <p class="np-h">EXPERIENCE</p>
          ${experience.map((x) => `
            <p><b>${esc(x.role)}</b> · ${esc(x.org)}<br><span class="np-sub">${esc(x.years)}</span></p>
            <ul class="np-list">${x.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`).join('')}
          <p class="np-h">EDUCATION</p>
          ${education.map((e) => `
            <p><b>${esc(e.degree)}</b><br>${esc(e.school)} · <span class="np-sub">${esc(e.years)}</span><br>${esc(e.notes || '')}</p>`).join('')}
        </div>`,
    },
    projects: {
      title: 'C:\\projects', icon: 'folder', w: 62, h: 60,
      body: () => `
        <div class="ex-path">C:\\projects\\ — ${projects.length} items</div>
        <div class="ex-grid">
          ${projects.map((p, i) => `
            <button class="ex-item" data-project="${i}">
              <img src="${p.thumb ? esc(p.thumb) : projectThumb(p.title, p.color || '#f2b233')}" alt="">
              <span>${esc(p.title)}</span>
            </button>`).join('')}
        </div>`,
      mount: (body) => body.querySelectorAll('[data-project]').forEach((b) =>
        b.addEventListener('click', () => openProject(+b.dataset.project))),
    },
    skills: {
      title: 'skills.exe', icon: 'exe', w: 54, h: 58,
      body: () => `
        <div class="sk-head">SKILL CHECK v1.0 — scanning operator...</div>
        ${skills.map((s) => `
          <div class="sk-row"><span>${esc(s.name)}</span>
            <span class="sk-bar">${'<i></i>'.repeat(s.level)}${'<i class="e"></i>'.repeat(10 - s.level)}</span>
          </div>`).join('')}`,
    },
    drawings: {
      title: 'C:\\drawings', icon: 'image', w: 62, h: 60,
      body: () => `
        <div class="ex-path">C:\\drawings\\ — ${art.length} files · click one to open it full size</div>
        <div class="ex-grid wide">
          ${art.map((p, i) => `
            <button class="ex-item" data-painting="${i}">
              <span class="ex-thumb"><img class="pix" src="${p.thumb()}" alt=""></span>
              <span>${esc(p.title)}</span>
            </button>`).join('')}
        </div>`,
      mount: (body) => body.querySelectorAll('[data-painting]').forEach((b) =>
        b.addEventListener('click', () => openViewer(+b.dataset.painting))),
    },
    anime: {
      title: 'anime.lnk', icon: 'hat', launch: () => shutdown(() => opts.onOpenAnime()),
    },
    contact: {
      title: 'contact.lnk', icon: 'mail', w: 54, h: 48,
      body: () => `
        <div class="sk-head">Say hi! I reply faster than Luffy finds food.</div>
        <ul class="ct-list">
          ${contact.map((c) => `<li><b>${esc(c.label)}</b><a href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.value)}</a></li>`).join('')}
        </ul>`,
    },
    resume: {
      title: 'resume.pdf', icon: 'pdf', w: 46, h: 40,
      body: () => `
        <div class="rs">
          <img class="pix big" src="${icon('pdf')}" alt="">
          <p>${esc(profile.name)} — Resume</p>
          <a class="os-btn" href="${esc(profile.resumeUrl)}" target="_blank" rel="noopener">OPEN RESUME ↗</a>
        </div>`,
    },
    terminal: {
      title: 'terminal.exe', icon: 'term', w: 60, h: 56,
      body: () => `<div class="tm"><div class="tm-out"></div><label class="tm-line"><span>${esc(profile.handle)}@desk:~$</span><input spellcheck="false" autocomplete="off"></label></div>`,
      mount: mountTerminal,
    },
    trash: {
      title: 'Recycle Bin', icon: 'trash', w: 44, h: 36,
      body: () => `<div class="rs"><p>Empty.</p><p class="np-sub">Just like my sleep schedule during exams.</p></div>`,
    },
  };

  const desktopOrder = ['about', 'cv', 'projects', 'skills', 'drawings', 'anime', 'contact', 'resume', 'terminal', 'trash'];
  $('.os-icons').innerHTML = desktopOrder.map((id) => `
    <button class="os-icon" data-app="${id}">
      <img src="${icon(apps[id].icon)}" alt=""><span>${esc(apps[id].title.replace('C:\\', '') + (apps[id].icon === 'folder' || apps[id].icon === 'image' ? '/' : ''))}</span>
    </button>`).join('');
  $('.os-icons').addEventListener('click', (e) => {
    const b = e.target.closest('[data-app]');
    if (b) launch(b.dataset.app);
  });

  startMenu.innerHTML = `
    <div class="sm-side">${esc(profile.handle.toUpperCase())}OS</div>
    <div class="sm-items">
      ${desktopOrder.filter((id) => id !== 'trash').map((id) => `<button data-app="${id}"><img src="${icon(apps[id].icon)}" alt="">${esc(apps[id].title)}</button>`).join('')}
      <hr>
      <button data-shutdown><span class="sm-off">⏻</span>Shut down</button>
    </div>`;
  startMenu.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    startMenu.hidden = true;
    if (b.dataset.app) launch(b.dataset.app);
    else if ('shutdown' in b.dataset) shutdown();
  });
  $('.os-start').addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.hidden = !startMenu.hidden;
    sfx?.('click');
  });
  deskEl.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.os-startmenu, .os-start')) startMenu.hidden = true;
  });

  // ── window manager ───────────────────────────────────────
  function launch(id) {
    const app = apps[id];
    if (!app) return;
    sfx?.('open');
    if (app.launch) return app.launch();
    openWindow(id, app.title, app.icon, app.body(), app);
  }

  function openProject(i) {
    const p = projects[i];
    openWindow(`project-${i}`, `${p.title}.proj`, 'exe', `
      <div class="pj">
        <img class="pix" src="${p.thumb ? esc(p.thumb) : projectThumb(p.title, p.color || '#f2b233')}" alt="">
        <div class="pj-meta">
          <h3>${esc(p.title)} <small>${esc(p.year || '')}</small></h3>
          <div class="pj-tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
          <p>${esc(p.description)}</p>
          <div class="pj-links">${(p.links || []).map((l) => `<a class="os-btn" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>
        </div>
      </div>`, { w: 60, h: 54 });
    sfx?.('open');
  }

  // ── image viewer: full-size paintings ─────────────────────
  let viewing = 0;
  function openViewer(i) {
    sfx?.('open');
    const win = openWindow('viewer', 'Viewer', 'image', `
      <div class="vw">
        <div class="vw-tools">
          <button data-v="prev" title="Previous">◀</button>
          <button data-v="next" title="Next">▶</button>
          <span class="vw-name"></span>
          <button data-v="zoom" title="Fit / actual size">⤢ ZOOM</button>
          <button data-v="wall" title="Hang it on the wall">ON WALL</button>
        </div>
        <div class="vw-stage"><img alt=""></div>
        <div class="vw-caption"></div>
      </div>`, {
      w: 78, h: 84, maximized: true,
      mount: (body) => {
        body.querySelector('.vw-tools').addEventListener('click', (e) => {
          const b = e.target.closest('[data-v]');
          if (!b) return;
          const v = b.dataset.v;
          if (v === 'prev') showArt(viewing - 1);
          if (v === 'next') showArt(viewing + 1);
          if (v === 'zoom') body.querySelector('.vw-stage').classList.toggle('actual');
          if (v === 'wall') shutdown(() => opts.onOpenGallery(viewing));
        });
        body.querySelector('.vw-stage').addEventListener('dblclick', (e) => e.currentTarget.classList.toggle('actual'));
      },
    });
    showArt(i, win);
  }
  function showArt(i, win = windows.get('viewer')) {
    if (!win) return;
    viewing = ((i % art.length) + art.length) % art.length;
    const p = art[viewing];
    const body = win.el.querySelector('.win-body');
    const img = body.querySelector('.vw-stage img');
    img.src = p.full();
    img.classList.toggle('pix', p.pixelated);
    body.querySelector('.vw-name').textContent = `${viewing + 1}/${art.length}  ${p.title}`;
    body.querySelector('.vw-caption').textContent = [p.medium, p.year, p.note].filter(Boolean).join(' · ');
    win.el.querySelector('.win-bar span').textContent = `Viewer — ${p.title}`;
    win.task.lastChild.textContent = `Viewer — ${p.title}`;
  }

  function openWindow(id, title, ico, html, { w = 50, h = 50, mount, maximized } = {}) {
    if (windows.has(id)) {
      const win = windows.get(id);
      win.el.hidden = false;
      focus(win);
      return win;
    }
    const n = windows.size;
    const el = document.createElement('div');
    el.className = 'os-win';
    el.style.width = `${w}%`;
    el.style.height = `${h}%`;
    el.style.left = `${Math.min(100 - w, 18 + n * 4 + Math.random() * 4)}%`;
    el.style.top = `${Math.min(88 - h, 4 + n * 4)}%`;
    el.innerHTML = `
      <div class="win-bar"><img src="${icon(ico)}" alt=""><span>${esc(title)}</span>
        <button class="win-min" aria-label="Minimise">_</button><button class="win-max" aria-label="Maximise">□</button><button class="win-x" aria-label="Close">×</button></div>
      <div class="win-body">${html}</div>`;
    winLayer.appendChild(el);
    const task = document.createElement('button');
    task.className = 'os-task';
    task.innerHTML = `<img src="${icon(ico)}" alt="">${esc(title)}`;
    tasks.appendChild(task);
    const win = { id, el, task };
    windows.set(id, win);

    el.addEventListener('pointerdown', () => focus(win));
    el.querySelector('.win-x').addEventListener('click', () => close(win));
    el.classList.toggle('max', !!maximized);
    const toggleMax = () => el.classList.toggle('max');
    el.querySelector('.win-max').addEventListener('click', toggleMax);
    el.querySelector('.win-bar').addEventListener('dblclick', toggleMax);
    el.querySelector('.win-min').addEventListener('click', (e) => {
      e.stopPropagation();
      el.hidden = true;
      task.classList.remove('active');
    });
    task.addEventListener('click', () => {
      if (el.hidden || !task.classList.contains('active')) {
        el.hidden = false;
        focus(win);
      } else {
        el.hidden = true;
        task.classList.remove('active');
      }
    });
    makeDraggable(el, el.querySelector('.win-bar'));
    mount?.(el.querySelector('.win-body'));
    focus(win);
    return win;
  }

  function focus(win) {
    win.el.style.zIndex = ++zTop;
    windows.forEach((w) => {
      w.el.classList.toggle('focused', w === win);
      w.task.classList.toggle('active', w === win && !w.el.hidden);
    });
    win.el.querySelector('input')?.focus({ preventScroll: true });
  }

  function close(win) {
    win.el.remove();
    win.task.remove();
    windows.delete(win.id);
    sfx?.('close');
  }

  function makeDraggable(el, handle) {
    handle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || el.classList.contains('max')) return;
      const area = winLayer.getBoundingClientRect();
      const start = { x: e.clientX, y: e.clientY, l: el.offsetLeft, t: el.offsetTop };
      handle.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const l = Math.max(-el.offsetWidth + 40, Math.min(area.width - 40, start.l + ev.clientX - start.x));
        const t = Math.max(0, Math.min(area.height - 20, start.t + ev.clientY - start.y));
        el.style.left = `${(l / area.width) * 100}%`;
        el.style.top = `${(t / area.height) * 100}%`;
      };
      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
  }

  // ── terminal ─────────────────────────────────────────────
  function mountTerminal(body) {
    const out = body.querySelector('.tm-out');
    const input = body.querySelector('input');
    const print = (txt, cls = '') => {
      const line = document.createElement('div');
      if (cls) line.className = cls;
      line.textContent = txt;
      out.appendChild(line);
      out.scrollTop = out.scrollHeight;
    };
    const cmds = {
      help: () => 'commands: whoami, ls, cat about_me.txt, education, experience, projects, skills, anime, contact, resume, paint, clear, exit',
      education: () => education.map((e) => `${e.degree} — ${e.school} (${e.years})`).join('\n'),
      experience: () => experience.map((x) => `${x.role} — ${x.org} (${x.years})\n${x.points.map((p) => '  • ' + p).join('\n')}`).join('\n'),
      resume: () => (window.open(profile.resumeUrl, '_blank'), 'opening resume...'),
      whoami: () => `${profile.name} — ${profile.title}\n${profile.tagline || ''}\n${profile.location}`,
      ls: () => 'about_me.txt  experience.txt  projects/  skills.exe  drawings/  anime.lnk  contact.lnk  resume.pdf',
      'cat about_me.txt': () => profile.bio.join('\n'),
      projects: () => projects.map((p) => `• ${p.title} [${(p.tags || []).join(', ')}]`).join('\n'),
      skills: () => skills.map((s) => `${s.name.padEnd(18)} ${'█'.repeat(s.level)}${'░'.repeat(10 - s.level)}`).join('\n'),
      anime: () => anime.filter((a) => a.status !== 'plan').map((a) => `★${a.rating} ${a.title}`).join('\n'),
      contact: () => contact.map((c) => `${c.label}: ${c.value}`).join('\n'),
      paint: () => (shutdown(() => opts.onOpenGallery(0)), 'opening the gallery...'),
      clear: () => ((out.innerHTML = ''), ''),
      exit: () => (close(windows.get('terminal')), ''),
      'sudo rm -rf /': () => 'nice try.',
      batman: () => "I'm not saying I'm Batman. I'm just saying nobody has seen us in the same room.",
      luffy: () => "I'm gonna be King of the Pirates!",
    };
    print(`${profile.handle.toUpperCase()}OS terminal — type "help"`, 'tm-dim');
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key !== 'Enter') return;
      const cmd = input.value.trim();
      input.value = '';
      print(`$ ${cmd}`, 'tm-dim');
      if (!cmd) return;
      const fn = cmds[cmd.toLowerCase()];
      const res = fn ? fn() : `command not found: ${cmd}`;
      if (res) res.split('\n').forEach((l) => print(l));
      sfx?.('key');
    });
  }

  // ── power states ─────────────────────────────────────────
  let clockTimer;
  async function boot() {
    if (state !== 'off') return;
    state = 'booting';
    sfx?.('power');
    opts.onPower?.(true);
    offEl.hidden = true;
    bootEl.hidden = false;
    const pre = bootEl.querySelector('pre');
    const bar = bootEl.querySelector('.os-bar i');
    pre.textContent = '';
    bar.style.width = '0%';
    const lines = [
      'PIXELBIOS (C) 2026  ThinkDesk T-800',
      'CPU: Imagination Core @ 4.2 GHz',
      'Memory test: 16384K OK',
      'Detecting drives... C:\\ found',
      'Loading coffee.sys .......... OK',
      'Loading anime.dll .......... OK',
      `Starting ${profile.handle.toUpperCase()}OS v1.0`,
    ];
    let skip = false;
    const skipper = () => (skip = true);
    bootEl.addEventListener('click', skipper, { once: true });
    for (let i = 0; i < lines.length; i++) {
      pre.textContent += lines[i] + '\n';
      bar.style.width = `${((i + 1) / lines.length) * 100}%`;
      if (!skip) await wait(230);
    }
    if (!skip) await wait(350);
    if (state !== 'booting') return;
    bootEl.hidden = true;
    deskEl.hidden = false;
    state = 'on';
    tick();
    clockTimer = setInterval(tick, 10000);
    sfx?.('chime');
    launch('about');
  }

  function tick() {
    const d = new Date();
    $('.os-clock').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  async function shutdown(after) {
    if (state === 'off') return opts.onShutdown(after);
    state = 'shutting';
    startMenu.hidden = true;
    deskEl.hidden = true;
    bootEl.hidden = false;
    bootEl.querySelector('pre').textContent = 'Saving your session...\nIt is now safe to close the lid.';
    bootEl.querySelector('.os-bar i').style.width = '100%';
    await wait(550);
    reset();
    opts.onShutdown(after);
  }

  function reset() {
    clearInterval(clockTimer);
    windows.forEach((w) => {
      w.el.remove();
      w.task.remove();
    });
    windows.clear();
    state = 'off';
    opts.onPower?.(false);
    offEl.hidden = false;
    bootEl.hidden = true;
    deskEl.hidden = true;
  }

  return {
    boot,
    shutdown,
    reset,
    get state() {
      return state;
    },
    show() {
      root.hidden = false;
      requestAnimationFrame(() => root.classList.add('visible'));
    },
    hide() {
      root.classList.remove('visible');
      root.hidden = true;
    },
    setRect(r) {
      root.style.left = `${r.left}px`;
      root.style.top = `${r.top}px`;
      root.style.width = `${r.width}px`;
      root.style.height = `${r.height}px`;
      root.style.fontSize = `${Math.max(9, Math.min(20, r.width / 52))}px`;
    },
  };
}
