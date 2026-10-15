// ─────────────────────────────────────────────────────────────
//  EDIT ME — everything shown on the site comes from this file.
//  Markers like <YYYY>, <github-username>, <linkedin-url> still need filling in.
// ─────────────────────────────────────────────────────────────

const GITHUB = 'https://github.com/<github-username>';

export const profile = {
  name: 'Shamit Patel',
  handle: 'shamit',
  title: 'Python / Django developer · Artist · B.Tech CSE student',
  location: 'Ahmedabad, India',
  tagline: 'I build practical web apps by day and sketch characters by night.',
  bio: [
    "Hey, I'm Shamit, a B.Tech CSE student at GLS University (Ahmedabad) who came in through lateral entry after a Diploma in Computer Engineering. I build full-stack web apps with Python, Django and SQL, and I use AI tools like Claude and Gemini as power tools: they help me ship fast, while I own the design, the testing and the deployment.",
    'Right now I am building a workflow app for a real company team that cuts out repetitive verification work. Its first module, an inventory manager, has already been demoed to them. My diploma teachers called me the best in my class for actually understanding code instead of memorising it.',
    "Off the keyboard I sketch in pencil and ink, paint (that Bat-signal above the desk is mine), fix broken things around the house and collect crazy ideas. I do my best work in deep-focus mode, and I'm always honest and happy to help a teammate.",
  ],
  resumeUrl: './resume.html',
};

export const contact = [
  { label: 'Email', value: 'patelshamit1911@gmail.com', href: 'mailto:patelshamit1911@gmail.com' },
  { label: 'GitHub', value: 'github.com/<github-username>', href: GITHUB },
  { label: 'LinkedIn', value: 'linkedin.com/in/<linkedin-url>', href: 'https://linkedin.com/in/<linkedin-url>' },
  { label: 'Instagram (art)', value: '@shamit19.11', href: 'https://instagram.com/shamit19.11' },
];

export const education = [
  {
    degree: 'B.Tech, Computer Science & Engineering (lateral entry)',
    school: 'GLS University, Ahmedabad',
    years: '<YYYY> – <YYYY>',
    notes: 'Currently in 2nd year. Building Snap-n-Build for an investor pitch, plus two capstone projects.',
  },
  {
    degree: 'Diploma in Computer Engineering',
    school: 'VPMP Polytechnic, Gandhinagar',
    years: '<YYYY> – <YYYY>',
    notes: 'Called best in class by faculty for focus and real understanding of code. Final-year project: Talk2Anyone, an AI ASL translator.',
  },
];

export const experience = [
  {
    role: 'Freelance Web Developer',
    org: 'Internal tool for a company team (details under NDA)',
    years: '<YYYY> – present',
    points: [
      "Building a deployable web app that streamlines a team's repetitive cross-checking and verification work.",
      'Delivered and demoed the first module, an inventory management app on SQLite.',
      'Used AI-assisted development (Claude) to go from requirements to a working app quickly, then handled testing and rollout.',
    ],
  },
];

export const skills = [
  { name: 'Python', level: 7 },
  { name: 'Django', level: 6 },
  { name: 'SQL (MySQL, SQLite)', level: 6 },
  { name: 'HTML / CSS / JS', level: 6 },
  { name: 'AI-assisted dev', level: 8 },
  { name: 'Git & GitHub', level: 6 },
  { name: 'Three.js', level: 4 },
  { name: 'Sketching / painting', level: 8 },
];

// Used by the resume page (resume.html).
export const resume = {
  summary:
    'Second-year B.Tech CSE student (lateral entry after a Diploma in Computer Engineering) who builds practical full-stack web apps with Python, Django and SQL. I use AI-assisted development (Claude, Gemini) to ship quickly while owning the design, testing and deployment. Currently building a workflow tool for a company team. Looking for software development internships.',
  skillGroups: [
    { name: 'Languages', items: ['Python', 'SQL', 'JavaScript', 'HTML / CSS'] },
    { name: 'Frameworks & data', items: ['Django', 'MySQL', 'SQLite', 'Three.js'] },
    { name: 'Tools', items: ['Git & GitHub', 'Claude', 'Gemini API', 'VS Code'] },
    { name: 'Strengths', items: ['Deep focus', 'Problem solving', 'Honest communication', 'Supportive teammate'] },
  ],
  interests: 'Pencil & ink sketching, acrylic painting and digital character design (Instagram @shamit19.11) · anime · DIY repairs and tinkering',
};

// thumb: optional image path in /public (e.g. './projects/foo.png'). Without one, a pixel thumbnail is generated.
export const projects = [
  {
    title: 'Workflow & Inventory App',
    year: '2026',
    tags: ['Python', 'SQLite', 'AI-assisted'],
    description: "A real-world web app for a company team that replaces repetitive verification steps. The first module, inventory management, is done and has been demoed. It's private (NDA), so no link.",
    links: [],
    color: '#6bbf59',
    onResume: false, // already listed under Experience
  },
  {
    title: 'Talk2Anyone',
    year: 'Diploma',
    tags: ['AI', 'Computer vision', 'Web app'],
    description: 'An AI-powered American Sign Language translator that turns signs into text so deaf and hearing people can talk more easily. My diploma final-year project.',
    links: [{ label: 'GitHub', href: GITHUB }],
    color: '#3a6ea5',
  },
  {
    title: 'Snap-n-Build',
    year: '2026',
    tags: ['Web app', 'Startup', 'Pitch'],
    description: 'My current college project, being prepared for a pitch to investors. More soon.',
    links: [],
    color: '#f2b233',
  },
  {
    title: 'DevCompass',
    year: '',
    tags: ['Gemini API', 'Frontend'],
    description: 'Tell it what you want to build and it recommends the languages and frameworks to use, powered by Google Gemini.',
    links: [{ label: 'GitHub', href: GITHUB }],
    color: '#8a5cd6',
  },
  {
    title: 'AI Ad Blocker',
    year: '',
    tags: ['Browser extension', 'AI'],
    description: 'A browser extension that uses AI to spot and hide ads that ordinary filter lists miss.',
    links: [{ label: 'GitHub', href: GITHUB }],
    color: '#d0343a',
  },
  {
    title: 'Practical Formatter',
    year: '',
    tags: ['Web app', 'Productivity'],
    description: 'A web interface that formats college practicals and assignments into clean, submission-ready documents in seconds.',
    links: [{ label: 'GitHub', href: GITHUB }],
    color: '#2aa198',
  },
  {
    title: 'Pixel Desk',
    year: '2026',
    tags: ['Three.js', 'GLSL', 'Vite'],
    description: 'This very portfolio: my real desk rebuilt as a pixel-art 3D scene, with a working mini OS on the laptop.',
    links: [{ label: 'GitHub', href: GITHUB }],
    color: '#e0302f',
  },
];

// Paintings shown on the wall frames (three panels).
//   layout: 'triptych' → one painting stretched across all three panels
//   layout: 'single'   → one painting per panel; consecutive singles are hung three at a time
// Source, either:
//   { src: './paintings/my-drawing.jpg' }  → your real artwork (put files in /public/paintings). Defaults to 'single'.
//   { procedural: ... }                    → placeholder drawn in code:
//        triptych: 'batsignal' | 'sunset' | 'sakura' | 'starry' | 'rain'    single: 'strawhat' | 'moon' | 'koi'
export const paintings = [
  { title: 'Gotham Calling', year: 2023, medium: 'Acrylic on 3 canvas boards', procedural: 'batsignal', layout: 'triptych',
    note: 'The triptych that actually hangs above my desk.' },
  { title: 'Merry at Dusk', year: 2024, medium: 'Acrylic', procedural: 'sunset', layout: 'triptych',
    note: 'A tiny ship sailing toward the Grand Line.' },
  { title: 'The Hat', year: 2025, medium: 'Acrylic on canvas board', procedural: 'strawhat', layout: 'single',
    note: 'A tribute to a certain rubber captain.' },
  { title: 'Paper Moon', year: 2024, medium: 'Gouache', procedural: 'moon', layout: 'single',
    note: 'Quiet night, one small boat.' },
  { title: 'Koi Pond', year: 2023, medium: 'Watercolour', procedural: 'koi', layout: 'single',
    note: 'Painted from a temple garden visit.' },
  { title: 'Sakura Peak', year: 2024, medium: 'Gouache', procedural: 'sakura', layout: 'triptych',
    note: 'Spring in the mountains.' },
  { title: 'Night Swirl', year: 2022, medium: 'Oil pastel', procedural: 'starry', layout: 'triptych',
    note: 'Studying Van Gogh, badly and happily.' },
  { title: 'Neon Rain', year: 2025, medium: 'Digital', procedural: 'rain', layout: 'triptych',
    note: 'Lo-fi city nights.' },
];

// status: 'watching' | 'completed' | 'plan' | 'dropped'   rating: 0-10
export const anime = [
  { title: 'One Piece', status: 'watching', rating: 10, fav: 'Monkey D. Luffy', note: 'The hat on my wall says it all.' },
  { title: 'Fullmetal Alchemist: Brotherhood', status: 'completed', rating: 10, fav: 'Roy Mustang' },
  { title: 'Attack on Titan', status: 'completed', rating: 9, fav: 'Levi Ackerman' },
  { title: 'Vinland Saga', status: 'completed', rating: 9, fav: 'Thorfinn' },
  { title: 'Jujutsu Kaisen', status: 'watching', rating: 8, fav: 'Gojo Satoru' },
  { title: 'Frieren: Beyond Journey\'s End', status: 'completed', rating: 10, fav: 'Frieren' },
  { title: 'Death Note', status: 'completed', rating: 9, fav: 'L' },
  { title: 'Naruto Shippuden', status: 'completed', rating: 8, fav: 'Itachi Uchiha' },
  { title: 'Demon Slayer', status: 'completed', rating: 8, fav: 'Tanjiro Kamado' },
  { title: 'Chainsaw Man', status: 'watching', rating: 8, fav: 'Power' },
  { title: 'Spy x Family', status: 'plan', rating: 0, fav: 'Anya' },
  { title: 'Monster', status: 'plan', rating: 0, fav: '—' },
];

// The notebook on the desk: a "/now" page.
export const now = {
  heading: 'Now — Oct 2026',
  items: [
    'Getting Snap-n-Build ready for the investor pitch',
    'Shipping the next module of the workflow app',
    'Two capstone projects in progress',
    'Exploring colour + digital character design',
    'Open to internships, art commissions & hackathon teams',
  ],
};
