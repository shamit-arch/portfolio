import './resume.css';
import { profile, contact, education, experience, projects, resume } from './content.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const role = profile.title.split('·').filter((t) => !/student/i.test(t)).join('·').trim();
document.title = `${profile.name} — Resume`;

document.getElementById('resume').innerHTML = `
  <header>
    <div>
      <h1>${esc(profile.name)}</h1>
      <p class="role">${esc(role)}</p>
    </div>
    <ul class="links">
      <li>${esc(profile.location)}</li>
      ${contact.map((c) => `<li><a href="${esc(c.href)}">${esc(c.value)}</a></li>`).join('')}
    </ul>
  </header>

  <section>
    <h2>Summary</h2>
    <p>${esc(resume.summary)}</p>
  </section>

  <section>
    <h2>Experience</h2>
    ${experience.map((x) => `
      <div class="item">
        <div class="row"><h3>${esc(x.role)}</h3><span class="when">${esc(x.years)}</span></div>
        <div class="sub">${esc(x.org)}</div>
        <ul>${x.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      </div>`).join('')}
  </section>

  <section>
    <h2>Projects</h2>
    ${projects.filter((p) => p.onResume !== false).map((p) => `
      <div class="item compact">
        <div class="row"><h3>${esc(p.title)} <span class="tags">${esc((p.tags || []).join(' · '))}</span></h3><span class="when">${esc(p.year)}</span></div>
        <p>${esc(p.description)}</p>
      </div>`).join('')}
  </section>

  <section>
    <h2>Education</h2>
    ${education.map((e) => `
      <div class="item compact">
        <div class="row"><h3>${esc(e.degree)}</h3><span class="when">${esc(e.years)}</span></div>
        <div class="sub">${esc(e.school)}</div>
        ${e.notes ? `<p>${esc(e.notes)}</p>` : ''}
      </div>`).join('')}
  </section>

  <section class="grid">
    <div>
      <h2>Skills</h2>
      <dl>${resume.skillGroups.map((g) => `<dt>${esc(g.name)}</dt><dd>${esc(g.items.join(', '))}</dd>`).join('')}</dl>
    </div>
    <div>
      <h2>Beyond code</h2>
      <p>${esc(resume.interests)}</p>
    </div>
  </section>`;

document.getElementById('print').addEventListener('click', () => window.print());
