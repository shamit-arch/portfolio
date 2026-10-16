// ─────────────────────────────────────────────────────────────
//  EDIT ME — everything shown on the site comes from this file.
//  Markers like <YYYY>, <github-username>, <linkedin-url> still need filling in.
// ─────────────────────────────────────────────────────────────

const GITHUB = 'https://github.com/shamit-arch';

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
  { label: 'GitHub', value: 'github.com/shamit-arch', href: GITHUB },
  { label: 'LinkedIn', value: 'linkedin.com/in/shamit-patel-683366387 ', href: 'https://linkedin.com/in/shamit-patel-683366387' },
  { label: 'Instagram (art)', value: '@shamit.1911', href: 'https://instagram.com/shamit.1911' },
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
    years: '2025 – present',
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
  interests: 'Pencil & ink sketching, acrylic painting and digital character design (Instagram @shamit.1911) · anime · DIY repairs and tinkering',
};

export const projects = [
  {
    title: 'Workflow & Inventory App',
    year: '2026',
    tags: ['Python', 'SQLite', 'AI-assisted'],
    description: "A real-world web app for a company team that replaces repetitive verification steps. The first module, inventory management, is done and has been demoed. It's private (NDA), so no link.",
    links: [],
    color: '#6bbf59',
    onResume: false, 
  },
  {
    title: 'Talk2Anyone',
    year: 'Diploma',
    tags: ['AI', 'Computer vision', 'Web app'],
    description: 'An AI-powered American Sign Language translator that turns signs into text so deaf and hearing people can talk more easily. My diploma final-year project.',
    links: [{ label: 'GitHub', href:"https://github.com/shamit-arch/talk2anyone" }],
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
    links: [{ label: 'GitHub', href: "https://github.com/shamit-arch/devcompass" }],
    color: '#8a5cd6',
  },
  {
    title: 'A Blocker',
    year: '',
    tags: ['Browser extension', 'AI'],
    description: 'A browser extension that spots and hides AI Content that ordinary filter lists miss.',
    links: [{ label: 'GitHub', href: GITHUB }],
    color: '#d0343a',
  },
  {
    title: 'Practical Formatter',
    year: '',
    tags: ['Web app', 'Productivity'],
    description: 'A web interface that formats college practicals and assignments into clean, submission-ready documents in seconds.',
    links: [{ label: 'GitHub', href: "https://github.com/shamit-arch/practical-submiter" }],
    color: '#2aa198',
  },
  {
    title: 'Pixel Desk',
    year: '2026',
    tags: ['Three.js', 'GLSL', 'Vite'],
    description: 'This very portfolio: my real desk rebuilt as a pixel-art 3D scene, with a working mini OS on the laptop.',
    color: '#e0302f',
  },
];

// What hangs on the wall frames (shown pixelated, like the rest of the room).
//   layout: 'triptych' → one image split across all three panels
//   layout: 'single'   → one image per panel; consecutive singles are hung three at a time
export const paintings = [
  { title: 'Gotham Calling', year: 2023, medium: 'Acrylic on 3 canvas boards', src: './paintings/gotham-calling.jpg', layout: 'triptych',
    note: 'The triptych that actually hangs above my desk.' },
];

// The laptop's drawings/ folder, shown at full resolution.
// To add one: put the image in /public/paintings and add a line here.
export const drawings = [
  { title: 'Gotham Calling', medium: 'Acrylic on 3 canvas boards', year: 2023, src: './paintings/gotham-calling.jpg' },
  { title: 'Sketch 01', src: './paintings/sketch-01.jpg' },
  { title: 'Sketch 02', src: './paintings/sketch-02.jpg' },
  { title: 'Sketch 03', src: './paintings/sketch-03.jpg' },
  { title: 'Sketch 04', src: './paintings/sketch-04.jpg' },
  { title: 'Sketch 05', src: './paintings/sketch-05.jpg' },
  { title: 'Sketch 06', src: './paintings/sketch-06.jpg' },
  { title: 'Sketch 07', src: './paintings/sketch-07.jpg' },
  { title: 'Sketch 08', src: './paintings/sketch-08.jpg' },
];

// status: 'watching' | 'completed' | 'plan' | 'dropped'   rating: 0-10
export const anime = [
  { title: 'One Piece', status: 'watching', rating: 10, fav: 'Monkey D. Luffy', 
    note: 'The hat on my wall says it all.' },
  { title: 'Naruto Shippuden', status: 'completed', rating: 10, fav: 'Jiraya Sensei' },
  { title: 'Vinland Saga', status: 'completed', rating: 9, fav: 'Thorfinn' },
  { title: 'Jujutsu Kaisen', status: 'completed', rating: 6, fav: 'Gojo Satoru' },
  { title: 'Death Note', status: 'completed', rating: 9, fav: 'L' },
  { title: 'Demon Slayer', status: 'completed', rating: 10, fav: 'Gyomei Himejima' },
  { title: 'Chainsaw Man', status: 'completed', rating: 8, fav: 'Kishibe' },
  { title: 'Monster', status: 'completed', rating: 10, fav: 'Johan Libert' },
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
