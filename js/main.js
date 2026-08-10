// ─────────────────────────────────────────────────────────────────────────────
// Orchestration: lays the content out on one big 2D map, pans a CSS "camera"
// over it, and lets the robot path-plan its way between sections.
// ─────────────────────────────────────────────────────────────────────────────
import { PAPERS, BLOGS, ABOUT_STORY, COLLABS, MORE_COAUTHORSHIPS } from './data.js';
import { PathGrid } from './pathfind.js';
import { Driver } from './driver.js';

const $ = s => document.querySelector(s);
const world = $('#world');
const viewport = $('#viewport');
const navbar = $('#navbar');
const bubble = $('#bubble');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  cam: { x: 0, y: 0, zoom: 1 },
  target: { x: 0, y: 0, zoom: 1 },
  camMode: 'section',        // 'section' | 'follow' | 'free'
  section: 'home',
  layout: null,
  grid: null,
  hoverCard: null,
  hoverTimer: null,
  gazePoint: null,           // map point the robot should look at
  cursor: { x: -1e4, y: -1e4 },
  lastInteraction: performance.now(),
  sleeping: false,
  introDone: false,
};

let scene = null, driver = null, robotApi = null, dioramas = null, factAssetEls = [], collabItems = [], paperSlugs = [];

// ══════════════════════════ content ══════════════════════════

function paperCard(p, featured = false) {
  return `
    <article class="card paper-card${featured ? ' featured' : ''}" data-id="${p.id}">
      <a class="thumb" href="${p.links.arXiv}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
        <span class="thumb-fallback">📄</span>
        <img loading="lazy" src="assets/papers/${p.id}.webp" alt="" onerror="this.remove()">
      </a>
      <div class="body">
        <h3><a href="${p.links.arXiv}" target="_blank" rel="noopener">${p.title}</a></h3>
        <div class="meta">
          <span class="badge">${p.venue} ${p.year}</span>
          ${p.award ? `<span class="badge award">★ ${p.award}</span>` : ''}
          ${p.selected ? `<span class="badge star">selected</span>` : ''}
        </div>
        <div class="authors">${p.authors}</div>
        <p class="desc">${p.desc}</p>
        <div class="links">
          ${Object.entries(p.links).map(([k, v]) => `<a href="${v}" target="_blank" rel="noopener">${k}</a>`).join('')}
        </div>
      </div>
    </article>`;
}

function buildCards() {
  const papersList = $('#papers-list');
  const psi = PAPERS.find(p => p.id === '2509.09737');
  const rest = PAPERS.filter(p => p !== psi);
  papersList.innerHTML = `
    <div class="fact-group">PSI</div>
    ${paperCard(psi, true)}
    <div class="fact-group">Selected publications</div>
    ${rest.map(p => paperCard(p)).join('')}`;
  $('#papers-count').textContent = PAPERS.length;

  const aboutList = $('#about-list');
  aboutList.innerHTML = `<article class="card about-card">${ABOUT_STORY.map(p => `<p>${p}</p>`).join('')}</article>`;
  factAssetEls = [...document.querySelectorAll('.fact-asset')];

  const blogList = $('#blog-list');
  blogList.innerHTML = BLOGS.map(b => `
    <article class="card blog-card">
      <span class="tag">${b.tag}</span>
      <h3><a href="${b.url}" target="_blank" rel="noopener">${b.title}</a></h3>
      <span class="date">${b.date}</span>
      <p class="teaser">${b.teaser}</p>
      <a class="read" href="${b.url}" target="_blank" rel="noopener">Read post →</a>
    </article>`).join('');
  $('#blog-count').textContent = BLOGS.length;

  // collaborators: count shared papers per person (bubble sizes come from this).
  // MORE_COAUTHORSHIPS folds in works that aren't shown in the Papers list
  // (CCN abstracts, workshop papers) so the universe stays complete.
  const plain = [
    ...PAPERS.map(p => p.authors.replace(/<[^>]+>/g, '').replace(/\*/g, '')),
    ...MORE_COAUTHORSHIPS,
  ];
  collabItems = COLLABS.map(c => ({
    ...c,
    count: plain.filter(a => c.aliases.some(al => a.includes(al))).length,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
  // per-paper membership, for drawing co-authorship edges in the figure
  paperSlugs = plain.map(a => collabItems.filter(c => c.aliases.some(al => a.includes(al))).map(c => c.slug));
}

// ── watchOS-style bubble clump: seeded force packing with cluster hubs ──
function renderCollabClump(w) {
  const list = $('#collabs-list');
  if (!collabItems.length) return;
  const LEGEND_H = 52;

  const pack = rScale => {
    let s = 1337;
    const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    // hubs stretched wide so the clump spreads horizontally rather than tall;
    // Dan anchors the center, trainees gather along the bottom edge
    const hubs = {
      neuroai: [0, -30], ai2uw: [330, -20], mitlang: [-330, 0],
      cogsci: [-160, -110], cogai: [290, 55],
    };
    // phones: pull the hubs back in — the wide layout would shrink bubbles too much
    const hx2 = state.layout?.compact ? 0.4 : 1;
    const targetOf = it =>
      it.slug === 'yamins' ? [0, 0] :
      it.trainee ? [(rng() - 0.5) * 320 * hx2, 165] :
      [hubs[it.cluster][0] * hx2, hubs[it.cluster][1]];
    const items = collabItems.map(c => ({ ...c, r: (19 + 13 * Math.sqrt(c.count)) * rScale }));
    for (const it of items) {
      // scale the whole hub layout with the bubbles, or a small panel could
      // never contain the clump no matter how small the bubbles get
      const [hx, hy] = targetOf(it).map(v => v * rScale);
      it.x = hx + (rng() - 0.5) * 150 * rScale;
      it.y = hy + (rng() - 0.5) * (it.trainee ? 40 : 90) * rScale;
      it.pull = it.slug === 'yamins' ? 0.06 : it.trainee ? 0.03 : 0.016;
      it.tx = hx; it.ty = hy;
    }
    for (let k = 0; k < 320; k++) {
      for (const it of items) {
        it.x += (it.tx - it.x) * it.pull;
        it.y += (it.ty - it.y) * it.pull;
      }
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const A = items[i], B = items[j];
        let dx = B.x - A.x, dy = B.y - A.y;
        const d = Math.hypot(dx, dy) || 0.001;
        const min = A.r + B.r + 3.5;
        if (d < min) {
          const push = (min - d) / 2 / d;
          A.x -= dx * push; A.y -= dy * push;
          B.x += dx * push; B.y += dy * push;
        }
      }
    }
    const minX = Math.min(...items.map(i => i.x - i.r)), maxX = Math.max(...items.map(i => i.x + i.r));
    const minY = Math.min(...items.map(i => i.y - i.r)), maxY = Math.max(...items.map(i => i.y + i.r));
    return { items, minX, minY, cw: maxX - minX, chh: maxY - minY };
  };

  const compact = state.layout?.compact;
  const PAD = compact ? 14 : 28;
  let P = pack(1), scale = 1;
  for (let t = 0; t < 5 && P.cw > w - PAD * 2; t++) {   // shrink until the panel truly contains it
    scale *= ((w - PAD * 2) / P.cw) * 0.97;
    P = pack(scale);
  }

  const panelH = Math.round(P.chh + PAD * 2);
  const ox = (w - P.cw) / 2 - P.minX;          // center the clump inside the panel
  const cx = s => Math.round(s.x + ox), cy = s => Math.round(s.y - P.minY + PAD);
  const initialsOf = n => n.split(' ').map(x => x[0]).join('').slice(0, 2);

  list.innerHTML = `
    <figure class="collab-figure">
      <div class="figure-panel" style="height:${panelH}px">
        ${P.items.map(c => {
          const d2 = Math.round(c.r * 2);
          const tag = c.url ? 'a' : 'span';
          const href = c.url ? ` href="${c.url}" target="_blank" rel="noopener"` : '';
          return `<${tag} class="bubble${c.trainee ? ' trainee' : ''}"${href} title="${c.name}" data-bx="${cx(c)}" data-by="${cy(c)}" style="left:${cx(c) - Math.round(d2 / 2)}px;top:${cy(c) - Math.round(d2 / 2)}px;width:${d2}px;height:${d2}px">
            <span class="face"><img loading="lazy" src="assets/collabs/${c.slug}.jpg" alt="" onerror="this.parentNode.classList.add('noimg');this.remove()"><span class="initials" style="font-size:${Math.round(d2 * 0.3)}px">${initialsOf(c.name)}</span></span>
            <span class="tip">${c.name} · ${c.count} paper${c.count > 1 ? 's' : ''}${c.trainee ? ' · trainee' : ''}</span>
          </${tag}>`;
        }).join('')}
      </div>
      <figcaption class="fig-caption"><b>Figure 1.</b> My collaboration universe. Each bubble is a co-author and links to their page; bubble area grows with the number of papers we share, and black outlines mark my trainees.</figcaption>
    </figure>`;
  list.style.height = '';                            // natural flow height (panel + caption)
}

// bubbles gently drift away from the cursor inside the figure
function setupBubbleRepel() {
  const list = $('#collabs-list');
  let point = null, raf = 0;
  const apply = () => {
    raf = 0;
    const panel = list.querySelector('.figure-panel');
    if (!panel) return;
    let px = null, py = null;
    if (point) {
      const pr = panel.getBoundingClientRect();
      const k = pr.width / panel.offsetWidth;        // map-px <-> screen-px scale
      px = (point.x - pr.left) / k;
      py = (point.y - pr.top) / k;
    }
    for (const b of list.querySelectorAll('.bubble')) {
      let t = '';
      if (px !== null) {
        const dx = +b.dataset.bx - px, dy = +b.dataset.by - py;
        const d = Math.hypot(dx, dy);
        if (d < 170 && d > 0.5) {
          const f = (1 - d / 170) * 16;
          t = `translate(${(dx / d * f).toFixed(1)}px, ${(dy / d * f).toFixed(1)}px)`;
        }
      }
      b.style.transform = t;
    }
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };
  list.addEventListener('mousemove', e => {
    if (reducedMotion) return;
    point = { x: e.clientX, y: e.clientY };
    schedule();
  });
  list.addEventListener('mouseleave', () => { point = null; schedule(); });
}

// ══════════════════════════ layout ══════════════════════════

function mapRect(el) {
  // element rect in map coordinates (offsets accumulate; #world is the root)
  let x = 0, y = 0, n = el;
  while (n && n !== world) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

function layout() {
  const vw = innerWidth, vh = innerHeight;
  const compact = vw < 780;
  document.body.classList.toggle('compact', compact);

  const L = {};
  L.compact = compact;
  if (compact) {
    // five columns: [about][blog][home][papers][collabs]
    L.heroW = Math.min(vw - 28, 560);
    L.worldW = Math.round(vw * 5);
    L.homeX = Math.round(vw * 2.5);
    L.lane = 100;                                 // robot lane to the left of the lists
    L.papersW = Math.min(vw - 32 - L.lane, 560);
    L.papersLeft = Math.round(vw * 3 + 14 + L.lane);
    L.blogW = Math.min(vw - 32 - L.lane, 560);
    L.blogLeft = Math.round(vw + 14 + L.lane);
    L.aboutW = Math.min(vw - 32 - L.lane, 560);
    L.aboutLeft = 14 + L.lane;
    L.collabsW = Math.min(vw - 32 - L.lane, 560);
    L.collabsLeft = Math.round(vw * 4 + 14 + L.lane);
  } else {
    L.heroW = 920;
    L.worldW = 5700;
    L.homeX = 2300;
    L.papersW = 860;
    L.papersLeft = 2620;
    L.blogW = 780;
    L.blogLeft = 1080;
    L.aboutW = 760;
    L.aboutLeft = 440;     // a remote clearing in the top-left, margins on both sides for the models
    L.collabsW = 950;
    L.collabsLeft = 4560;  // a far outpost in the top-right
  }
  L.heroY = compact ? 76 : 680;   // desktop home sits well below About so the trip feels like a journey

  const hero = $('#hero');
  hero.style.left = (L.homeX - L.heroW / 2) + 'px';
  hero.style.top = L.heroY + 'px';
  hero.style.width = L.heroW + 'px';
  const heroH = hero.offsetHeight;

  L.robotHome = { x: L.homeX, y: L.heroY + heroH + (compact ? 118 : 165) };
  const hint = $('#hero-hint');
  hint.style.left = (L.homeX - 160) + 'px';
  hint.style.top = (L.robotHome.y + (compact ? 68 : 92)) + 'px';

  const ph = $('#papers-header'), bh = $('#blog-header'), ah = $('#about-header');
  const aboutList = $('#about-list');

  // About goes first: high on the map (desktop), so we can measure it and keep
  // the papers/blog band safely below it
  let aboutHeaderY = compact ? 0 : 30;      // compact value set below
  let aboutTop = aboutHeaderY + (compact ? 96 : 110);
  const placeAbout = () => {
    ah.style.left = L.aboutLeft + 'px';
    ah.style.top = aboutHeaderY + 'px';
    aboutList.style.left = L.aboutLeft + 'px';
    aboutList.style.top = aboutTop + 'px';
    aboutList.style.width = L.aboutW + 'px';
  };
  if (!compact) placeAbout();
  const aboutBottom = compact ? 0 : aboutTop + aboutList.offsetHeight;

  const headerY = compact
    ? L.robotHome.y + 240
    : Math.max(L.robotHome.y + 420, aboutBottom + 180);
  ph.style.left = L.papersLeft + 'px';
  ph.style.top = headerY + 'px';
  bh.style.left = L.blogLeft + 'px';
  bh.style.top = headerY + 'px';

  const cardsTop = headerY + (compact ? 96 : 110);
  if (compact) {
    aboutHeaderY = headerY;
    aboutTop = cardsTop;
    placeAbout();
  }
  const papersList = $('#papers-list');
  papersList.style.left = L.papersLeft + 'px';
  papersList.style.top = cardsTop + 'px';
  papersList.style.width = L.papersW + 'px';
  const blogList = $('#blog-list');
  blogList.style.left = L.blogLeft + 'px';
  blogList.style.top = cardsTop + 'px';
  blogList.style.width = L.blogW + 'px';

  // Collaborators: a far outpost up-and-right (desktop), own column on phones
  const ch = $('#collabs-header'), collabsList = $('#collabs-list');
  const collabsHeaderY = compact ? headerY : 60;
  const collabsTop = collabsHeaderY + (compact ? 96 : 110);
  ch.style.left = L.collabsLeft + 'px';
  ch.style.top = collabsHeaderY + 'px';
  collabsList.style.left = L.collabsLeft + 'px';
  collabsList.style.top = collabsTop + 'px';
  collabsList.style.width = L.collabsW + 'px';
  renderCollabClump(L.collabsW);

  const papersRect = mapRect(papersList);
  const blogRect = mapRect(blogList);
  const aboutRect = mapRect(aboutList);
  const collabsRect = mapRect(collabsList);
  const bottom = Math.max(papersRect.y + papersRect.h, blogRect.y + blogRect.h, aboutRect.y + aboutRect.h, collabsRect.y + collabsRect.h);
  L.worldH = bottom + 420;

  const footer = $('#world-footer');
  footer.style.left = (L.homeX - 260) + 'px';
  footer.style.top = (L.worldH - 120) + 'px';

  world.style.width = L.worldW + 'px';
  world.style.height = L.worldH + 'px';

  // ── docks: where the robot parks per section (always left of the lists) ──
  L.docks = {
    home: { ...L.robotHome, face: Math.PI / 2 },
    papers: compact
      ? { x: L.papersLeft - L.lane / 2 - 6, y: cardsTop + 64, face: 0.5 }
      : { x: L.papersLeft - 110, y: cardsTop + 90, face: 0.5 },   // 3/4 view: face the cards AND the visitor
    blog: compact
      ? { x: L.blogLeft - L.lane / 2 - 6, y: cardsTop + 64, face: 0.5 }
      : { x: L.blogLeft - 110, y: cardsTop + 90, face: 0.5 },
    about: compact
      ? { x: L.aboutLeft - L.lane / 2 - 6, y: aboutTop + 64, face: 0.5 }
      : { x: L.aboutLeft - 250, y: aboutTop + 70, face: 0.5 },   // clear of the left marginalia models
    collabs: compact
      ? { x: L.collabsLeft - L.lane / 2 - 6, y: collabsTop + 64, face: 0.5 }
      : { x: L.collabsLeft - 110, y: collabsTop + 70, face: 0.5 },
  };

  // ── camera frames per section ──
  L.frames = {
    home: { x: L.homeX, y: frameY(L.heroY - 60, L.robotHome.y + 110, vh) },
    papers: { x: compact ? Math.round(vw * 3.5) : L.papersLeft + (L.papersW - 130) / 2, y: frameY(headerY - 70, headerY + vh, vh) },
    blog: { x: compact ? Math.round(vw * 1.5) : L.blogLeft + (L.blogW - 130) / 2, y: frameY(headerY - 70, headerY + vh, vh) },
    about: { x: compact ? Math.round(vw * 0.5) : L.aboutLeft + (L.aboutW - 130) / 2, y: frameY(aboutHeaderY - 70, aboutHeaderY + vh, vh) },
    collabs: { x: compact ? Math.round(vw * 4.5) : L.collabsLeft + (L.collabsW - 130) / 2, y: frameY(collabsHeaderY - 70, collabsHeaderY + vh, vh) },
  };

  // ── rubber-band bounds: the camera hovers back to the list column ──
  L.snap = {
    papers: { x: L.frames.papers.x, yMin: L.frames.papers.y, yMax: Math.max(L.frames.papers.y, papersRect.y + papersRect.h - vh * 0.55) },
    blog: { x: L.frames.blog.x, yMin: L.frames.blog.y, yMax: Math.max(L.frames.blog.y, blogRect.y + blogRect.h - vh * 0.55) },
    about: { x: L.frames.about.x, yMin: L.frames.about.y, yMax: Math.max(L.frames.about.y, aboutRect.y + aboutRect.h - vh * 0.55) },
    collabs: { x: L.frames.collabs.x, yMin: L.frames.collabs.y, yMax: Math.max(L.frames.collabs.y, collabsRect.y + collabsRect.h - vh * 0.55) },
  };

  state.layout = L;
  buildGrid();
  drawRoadsAndProps();
  resizeTreads();
}

// pick a camera y so the range [top, bottom] is visible, prioritizing `top`
function frameY(top, bottom, vh) {
  const mid = (top + bottom) / 2;
  const yMax = top + vh / 2;              // viewport top edge at `top`
  const yMin = bottom - vh / 2;           // viewport bottom edge at `bottom`
  return yMin <= yMax ? Math.min(Math.max(mid, yMin), yMax) : yMax;
}

function buildGrid() {
  const L = state.layout;
  // finer grid + slimmer inflation on phones: the robot is smaller and the
  // lane beside the lists is narrow
  const pad = L.compact ? 26 : 45;
  const grid = new PathGrid(L.worldW, L.worldH, L.compact ? 30 : 40);
  grid.blockRect(...rectOf('#hero'), L.compact ? 30 : 55);
  grid.blockRect(...rectOf('#papers-header'), pad);
  grid.blockRect(...rectOf('#blog-header'), pad);
  grid.blockRect(...rectOf('#collabs-header'), pad);
  grid.blockRect(...rectOf('#collabs-list'), pad);
  grid.blockRect(...rectOf('#world-footer'), 35);
  for (const card of document.querySelectorAll('.card')) {
    const r = mapRect(card);
    grid.blockRect(r.x, r.y, r.w, r.h, pad);
  }
  // the About models stand outside the text column — route around them too
  for (const el of factAssetEls) {
    const r = mapRect(el);
    grid.blockRect(r.x, r.y, r.w, r.h, 26);
  }
  state.grid = grid;
}

function rectOf(sel) {
  const r = mapRect($(sel));
  return [r.x, r.y, r.w, r.h];
}

// ══════════════════════════ roads & props ══════════════════════════

function drawRoadsAndProps() {
  const L = state.layout;
  const svg = $('#roads');
  svg.setAttribute('width', L.worldW);
  svg.setAttribute('height', L.worldH);
  svg.setAttribute('viewBox', `0 0 ${L.worldW} ${L.worldH}`);

  const h = L.robotHome, dp = L.docks.papers, db = L.docks.blog, da = L.docks.about, dc = L.docks.collabs;
  const road = (a, b) => {
    const my = (a.y + b.y) / 2;
    return `M ${a.x} ${a.y} C ${a.x} ${my}, ${b.x} ${my - 80}, ${b.x} ${b.y}`;
  };

  document.querySelectorAll('.prop').forEach(p => p.remove());

  // the about road swings wide to the left so it never crosses the story text
  const aboutRoad = L.compact
    ? road(h, da)
    : `M ${h.x} ${h.y} C ${h.x - 1100} ${h.y + 60}, ${da.x} ${da.y + 640}, ${da.x} ${da.y}`;

  svg.innerHTML = `
    <g fill="none" stroke="#c6bba1" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 16">
      <path d="${road(h, dp)}"/>
      <path d="${road(h, db)}"/>
      <path d="${aboutRoad}"/>
      <path d="${L.compact ? road(h, dc) : `M ${h.x} ${h.y} C ${h.x + 1300} ${h.y + 40}, ${dc.x} ${dc.y + 700}, ${dc.x} ${dc.y}`}"/>
    </g>
    <g>
      <rect x="${h.x - 80}" y="${h.y - 58}" width="160" height="116" rx="18"
            fill="rgba(255,171,73,0.13)" stroke="#d9c9a4" stroke-width="2" stroke-dasharray="6 6"/>
      <path d="M ${h.x + 52} ${h.y - 44} l -7 12 h 5 l -6 11 l 13 -14 h -5 l 6 -9 z" fill="#ffab49"/>
    </g>`;

}

// ══════════════════════════ tread marks ══════════════════════════

const treads = { canvas: $('#treads'), ctx: null, scale: 0.22, lastMark: { x: 0, y: 0 }, fadeAcc: 0 };

function resizeTreads() {
  const L = state.layout;
  treads.canvas.width = Math.round(L.worldW * treads.scale);
  treads.canvas.height = Math.round(L.worldH * treads.scale);
  treads.canvas.style.width = L.worldW + 'px';
  treads.canvas.style.height = L.worldH + 'px';
  treads.ctx = treads.canvas.getContext('2d');
}

function updateTreads(dt) {
  const ctx = treads.ctx;
  if (!ctx || !driver) return;
  treads.fadeAcc += dt;
  if (treads.fadeAcc > 0.12) {                       // fade the trail gradually
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.055)';
    ctx.fillRect(0, 0, treads.canvas.width, treads.canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    treads.fadeAcc = 0;
  }
  if (driver.speed > 50) {
    const d = Math.hypot(driver.pos.x - treads.lastMark.x, driver.pos.y - treads.lastMark.y);
    if (d > 22) {
      treads.lastMark = { ...driver.pos };
      const s = treads.scale;
      const px = Math.cos(driver.heading + Math.PI / 2), py = Math.sin(driver.heading + Math.PI / 2);
      ctx.fillStyle = 'rgba(105, 96, 74, 0.22)';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc((driver.pos.x + px * 34 * side) * s, (driver.pos.y + py * 34 * side) * s, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// ══════════════════════════ camera ══════════════════════════

function clampTarget(t) {
  const L = state.layout;
  if (!L) return t;
  const vw = innerWidth, vh = innerHeight, z = state.cam.zoom;
  t.x = Math.max(Math.min(t.x, L.worldW - vw / (2 * z) + 100), vw / (2 * z) - 100);
  t.y = Math.max(Math.min(t.y, L.worldH - vh / (2 * z) + 100), vh / (2 * z) - 160);
  return t;
}

function applyCamera() {
  const { x, y, zoom } = state.cam;
  const tx = innerWidth / 2 - x * zoom;
  const ty = innerHeight / 2 - y * zoom;
  world.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${zoom.toFixed(4)})`;
}

// ══════════════════════════ navigation ══════════════════════════

function goTo(name, { instant = false } = {}) {
  const L = state.layout;
  if (!L || !L.docks[name]) return;
  state.section = name;
  poke();
  history.replaceState(null, '', name === 'home' ? location.pathname : '#' + name);
  navbar.querySelectorAll('button[data-goto]').forEach(b => b.classList.toggle('active', b.dataset.goto === name));

  const dock = L.docks[name];
  state.snapTo = name === 'home' ? null : name;
  const arrive = () => {
    // don't hijack the camera if the user already started scrolling on their own
    if (state.camMode === 'follow') {
      state.camMode = 'section';
      state.target = clampTarget({ ...L.frames[name], zoom: 1 });
    } else {
      state.target.zoom = 1;
    }
    if (robotApi) {
      robotApi.bounce(0.9);
      robotApi.setMood('happy');
      showBubble({ home: '⚡', papers: '📄', blog: '✍️', about: '🏔️', collabs: '🤝' }[name]);
      if (name === 'home') robotApi.wave();
    }
  };

  if (instant || reducedMotion || !driver) {
    if (driver) { driver.teleport(dock.x, dock.y); driver.heading = dock.face; }
    state.camMode = 'section';
    state.target = clampTarget({ ...L.frames[name], zoom: 1 });
    state.cam = { ...state.target };                 // snap — no multi-second pan
    applyCamera();
    return;
  }

  const path = state.grid.findPath({ ...driver.pos }, { x: dock.x, y: dock.y });
  driver.follow(path, { onArrive: arrive, faceAfter: dock.face });
  state.camMode = 'follow';
}

// hover a paper/blog card → robot drives to its side (desktop only)
function setupHover() {
  for (const listSel of ['#papers-list', '#blog-list', '#about-list']) {
    const list = $(listSel);
    list.addEventListener('mouseover', e => {
      const card = e.target.closest('.card');
      if (!card || card === state.hoverCard) return;
      state.hoverCard = card;
      clearTimeout(state.hoverTimer);
      state.hoverTimer = setTimeout(() => driveToCard(card), 150);
    });
    list.addEventListener('mouseleave', () => {
      state.hoverCard = null;
      clearTimeout(state.hoverTimer);
    });
  }
}

function driveToCard(card) {
  if (!driver || state.layout.compact || reducedMotion) return;
  if (state.camMode === 'follow') return;             // don't hijack a section trip
  poke();
  const r = mapRect(card);
  // the About story has models standing in its left margin — park further out
  const gap = card.closest('#about-list') ? 250 : 110;
  const dock = { x: r.x - gap, y: r.y + Math.min(r.h / 2, 110) };
  const face = 0.5;                                   // 3/4 view beside the card
  const dist = Math.hypot(dock.x - driver.pos.x, dock.y - driver.pos.y);
  if (dist < 30) return;
  const path = state.grid.findPath({ ...driver.pos }, dock);
  driver.follow(path, {
    maxSpeed: Math.min(2000, Math.max(800, dist / 0.9)),
    faceAfter: face,
    onArrive: () => { if (robotApi) { robotApi.setMood('happy'); robotApi.bounce(0.5); } },
  });
}

// ══════════════════════════ speech bubble ══════════════════════════

let bubbleTimer = null;
function showBubble(text, ms = 1500) {
  if (!text) return;
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
}

function positionBubble(sx, sy) {
  bubble.style.left = (sx + 26) + 'px';
  bubble.style.top = (sy - (scene?.robotPx ?? 148) * state.cam.zoom - 44) + 'px';
}

// ══════════════════════════ input ══════════════════════════

function poke() {
  state.lastInteraction = performance.now();
  if (state.sleeping && robotApi) {
    state.sleeping = false;
    robotApi.setMood('normal');
    robotApi.bounce(0.6);
    showBubble('!', 900);
  }
}

// ══════════════════════════ theme ══════════════════════════

function setupTheme() {
  const root = document.documentElement;
  const btn = $('#theme-toggle');
  const apply = (t, persist) => {
    root.setAttribute('data-theme', t);
    if (persist) { try { localStorage.setItem('theme', t); } catch {} }
  };
  btn?.addEventListener('click', () => {
    apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });
  // follow the OS setting until the visitor makes an explicit choice
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', e => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch {}
    if (!saved) apply(e.matches ? 'dark' : 'light', false);
  });
}

function setupInput() {
  document.querySelectorAll('[data-goto]').forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); goTo(el.dataset.goto); }));

  viewport.addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) return;              // let browser zoom gestures through
    e.preventDefault();
    if (!state.layout) return;
    poke();
    const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
    state.camMode = 'free';
    if (!state.layout.compact) state.target.x += e.deltaX * k / state.cam.zoom;   // phones scroll vertically only
    state.target.y += e.deltaY * k / state.cam.zoom;
    clampTarget(state.target);
  }, { passive: false });

  // drag / touch pan. Touch may start a pan anywhere (cards fill the whole
  // screen on phones); mouse drags skip content so text stays selectable.
  let drag = null, suppressClick = false;
  viewport.addEventListener('pointerdown', e => {
    if (drag) return;                                // first pointer owns the pan
    // mouse: leave content alone (text selection, link clicks). touch: a pan
    // may start anywhere, like native scrolling — taps stay intact via the
    // movement threshold, and suppressClick swallows post-pan activations.
    if (e.pointerType === 'mouse' && e.target.closest('a, button, .card, .hero, .section-header')) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    try { viewport.setPointerCapture(e.pointerId); } catch {}
  });
  viewport.addEventListener('pointermove', e => {
    state.cursor.x = e.clientX; state.cursor.y = e.clientY;
    if (!drag || e.pointerId !== drag.id || !state.layout) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 7) return;
    drag.moved = true;
    poke();
    viewport.classList.add('dragging');
    state.camMode = 'free';
    if (!state.layout.compact) state.target.x -= dx / state.cam.zoom;   // phones scroll vertically only
    state.target.y -= dy / state.cam.zoom;
    clampTarget(state.target);
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const endDrag = e => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    if (drag.moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 120); }
    drag = null;
    viewport.classList.remove('dragging');
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  // a pan that ends over a link must not activate it
  viewport.addEventListener('click', e => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // clicking the robot = wave hello (background clicks only)
  viewport.addEventListener('click', e => {
    if (e.target.closest('a, button, .card')) return;
    if (!driver) return;
    const s = mapToScreen(driver.pos.x, driver.pos.y);
    const z = state.cam.zoom;
    if (Math.abs(e.clientX - s.x) < 80 * z && e.clientY > s.y - 170 * z && e.clientY < s.y + 30 * z) {
      poke();
      const acts = ['wave', 'spin', 'happy'];
      const act = acts[Math.floor(Math.random() * acts.length)];
      if (act === 'wave' && robotApi) { robotApi.wave(); showBubble('👋'); }
      if (act === 'spin' && driver) { driver.spin(); showBubble('🌀'); }
      if (act === 'happy' && robotApi) { robotApi.setMood('happy'); robotApi.bounce(1); showBubble('♥'); }
    }
  });

  addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    const k = e.key.toLowerCase();
    if (k === 'h' || k === '1') goTo('home');
    if (k === 'p' || k === '2') goTo('papers');
    if (k === 'b' || k === '3') goTo('blog');
    if (k === 'c' || k === '4') goTo('collabs');
    if (k === 'a' || k === '5') goTo('about');
  });

  // keyboard navigation: when focus moves into the map, the browser scrolls
  // the (overflow:hidden) viewport to reveal it — undo that and pan the
  // camera there instead, so Tab actually works.
  viewport.addEventListener('scroll', () => { viewport.scrollLeft = 0; viewport.scrollTop = 0; });
  document.addEventListener('focusin', e => {
    if (!world.contains(e.target)) return;
    viewport.scrollLeft = 0; viewport.scrollTop = 0;
    const el = e.target.closest('.card') || e.target;
    const r = mapRect(el);
    state.camMode = 'free';
    state.target.x = r.x + r.w / 2;
    state.target.y = r.y + r.h / 2;
    clampTarget(state.target);
  });

  let resizeTimer = null;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      layout();
      if (scene) scene.resize();
      goTo(state.section, { instant: true });
    }, 200);
  });
}

// ══════════════════════════ helpers ══════════════════════════

function mapToScreen(mx, my) {
  return {
    x: (mx - state.cam.x) * state.cam.zoom + innerWidth / 2,
    y: (my - state.cam.y) * state.cam.zoom + innerHeight / 2,
  };
}

function updateGaze() {
  if (!robotApi || !driver) return;
  let target = null;
  if (state.hoverCard) {
    const r = mapRect(state.hoverCard);
    target = { x: r.x + r.w / 2, y: r.y + r.h / 2, up: 0.25 };
  } else {
    // glance at the cursor when it wanders near
    const s = mapToScreen(driver.pos.x, driver.pos.y);
    const d = Math.hypot(state.cursor.x - s.x, state.cursor.y - (s.y - 74));
    if (d < 260 && d > 10) {
      const m = screenToMap(state.cursor.x, state.cursor.y);
      target = { x: m.x, y: m.y, up: 0 };
    }
  }
  if (target && !driver.moving) {
    const ang = Math.atan2(target.y - driver.pos.y, target.x - driver.pos.x);
    let off = ang - driver.heading;
    while (off > Math.PI) off -= 2 * Math.PI;
    while (off < -Math.PI) off += 2 * Math.PI;
    if (Math.abs(off) < 1.9) {
      robotApi.lookToward({ x: Math.max(-1, Math.min(1, off / 1.1)), y: target.up });
      return;
    }
  }
  robotApi.lookToward(null);
}

function screenToMap(sx, sy) {
  return {
    x: (sx - innerWidth / 2) / state.cam.zoom + state.cam.x,
    y: (sy - innerHeight / 2) / state.cam.zoom + state.cam.y,
  };
}

// ══════════════════════════ main loop ══════════════════════════

let lastT = performance.now();
function loop(now) {
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now;

  const motion = driver ? driver.update(dt) : { speed: 0, maxSpeed: 1, accel: 0, turn: 0 };

  // camera target logic
  if (state.camMode === 'follow' && driver) {
    const L = state.layout;
    const frame = L.frames[state.section];
    const rem = driver.remaining();
    const k = Math.max(0, Math.min(1, 1 - rem / 700));
    state.target.x = driver.pos.x + (frame.x - driver.pos.x) * k;
    state.target.y = driver.pos.y + (frame.y - driver.pos.y) * k;
    state.target.zoom = 1 - 0.07 * Math.sin(Math.PI * Math.min(1, k + (driver.moving ? 0.001 : 1)));
    state.target.zoom = driver.moving ? 0.93 + 0.07 * k : 1;
    clampTarget(state.target);
  }

  // camera discipline while free-scrolling
  if (state.camMode === 'free' && state.layout) {
    const Lf = state.layout;
    if (Lf.compact) {
      // phones: a strict vertical rail — x is pinned to the current section's
      // column, y clamped to that column's content
      state.target.x = Lf.frames[state.section].x;
      const sn = Lf.snap[state.section];
      const lo = sn ? sn.yMin : Lf.frames.home.y - innerHeight * 0.15;
      const hi = sn ? sn.yMax : Lf.frames.home.y + innerHeight * 0.55;
      const k = 1 - Math.exp(-dt * 5);
      const cy = Math.min(Math.max(state.target.y, lo), hi);
      state.target.y += (cy - state.target.y) * k;
    } else if (state.snapTo && Lf.snap?.[state.snapTo]) {
      // desktop: rubber-band back to the list column
      const sn = Lf.snap[state.snapTo];
      if (Math.abs(state.target.x - sn.x) > innerWidth * 0.7) {
        state.snapTo = null;                  // dragged far off on purpose — let the camera roam
      } else {
        const k = 1 - Math.exp(-dt * 3.5);
        state.target.x += (sn.x - state.target.x) * k;
        const cy = Math.min(Math.max(state.target.y, sn.yMin), sn.yMax);
        state.target.y += (cy - state.target.y) * k;
      }
    }
  }

  // phones: the robot tags along in its lane as you scroll the list
  const Lc = state.layout;
  if (Lc?.compact && state.snapTo && driver && scene && !driver.moving && state.camMode === 'free' && !reducedMotion) {
    state.laneT = (state.laneT || 0) + dt;
    const dock = Lc.docks[state.snapTo];
    const sn = Lc.snap[state.snapTo];
    const wantY = Math.min(Math.max(state.cam.y, dock.y), sn.yMax + innerHeight * 0.25);
    if (state.laneT > 0.5 && Math.abs(driver.pos.y - wantY) > innerHeight * 0.45) {
      state.laneT = 0;
      driver.follow(state.grid.findPath({ ...driver.pos }, { x: dock.x, y: wantY }), { maxSpeed: 1500, faceAfter: dock.face });
    }
  }

  // smooth camera
  const s = 1 - Math.exp(-dt * (state.camMode === 'follow' ? 3.2 : 4.5));
  state.cam.x += (state.target.x - state.cam.x) * s;
  state.cam.y += (state.target.y - state.cam.y) * s;
  state.cam.zoom += ((state.target.zoom ?? 1) - state.cam.zoom) * s * 0.8;
  applyCamera();

  // navbar visibility: hidden only while actually "at home"
  const L = state.layout;
  const nearHome = Math.abs(state.cam.x - L.frames.home.x) < innerWidth * 0.45 &&
                   Math.abs(state.cam.y - L.frames.home.y) < innerHeight * 0.55;
  navbar.classList.toggle('hidden', state.section === 'home' && nearHome);

  // sleepy after a while
  if (!state.sleeping && robotApi && performance.now() - state.lastInteraction > 50000 && !driver.moving) {
    state.sleeping = true;
    robotApi.setMood('sleepy');
  }
  if (state.sleeping && Math.random() < dt / 7) showBubble('💤', 2200);

  updateGaze();
  updateTreads(dt);

  if (scene && driver) {
    // consume the robot's own "spin" idle wish
    if (robotApi.idle === 'spin' && robotApi.idleT === 0 && !driver.moving) driver.spin();
    const sp = mapToScreen(driver.pos.x, driver.pos.y);
    positionBubble(sp.x, sp.y);
    scene.render(sp.x, sp.y, state.cam.zoom, driver.heading, dt, motion);

    // dioramas: render any About-section asset tiles currently on screen
    if (dioramas) {
      const z = state.cam.zoom, vw = innerWidth, vh = innerHeight;
      const items = [];
      for (const el of factAssetEls) {
        const r = mapRect(el);
        const x = (r.x - state.cam.x) * z + vw / 2;
        const y = (r.y - state.cam.y) * z + vh / 2;
        const w = r.w * z, h = r.h * z;
        if (x + w < -40 || y + h < -40 || x > vw + 40 || y > vh + 40 || w < 4) continue;
        items.push({ key: el.dataset.asset, x, y, w, h });
      }
      dioramas.render(items);
    }
  }

  requestAnimationFrame(loop);
}

// ══════════════════════════ boot ══════════════════════════

async function boot() {
  const scenePromise = import('./scene.js');        // fetch the robot in parallel with everything else
  buildCards();
  setupHover();
  setupInput();
  setupTheme();
  setupBubbleRepel();

  // first paint immediately with fallback fonts, re-measure when fonts land
  layout();
  state.cam = { x: state.layout.frames.home.x, y: state.layout.frames.home.y, zoom: 1 };
  state.target = { ...state.cam, zoom: 1 };
  applyCamera();
  requestAnimationFrame(loop);

  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1800))]); } catch {}
  layout();
  const L = state.layout;
  state.cam = { x: L.frames.home.x, y: L.frames.home.y, zoom: 1 };
  state.target = { ...state.cam, zoom: 1 };
  applyCamera();

  driver = new Driver(L.robotHome.x, L.robotHome.y);

  try {
    const { RobotScene } = await scenePromise;
    scene = new RobotScene($('#robot-canvas'));
    robotApi = scene.robot;
    robotApi.onEmote = name => { if (name === 'wave') showBubble('👋'); };
    const { Dioramas } = await import('./dioramas.js');
    dioramas = new Dioramas(scene.renderer);
  } catch (err) {
    console.warn('Robot disabled (WebGL unavailable?):', err);
    document.body.classList.add('no-robot');
  }

  document.body.classList.add('ready');

  // entrance: roll in from off-screen, park on the pad
  if (scene && !reducedMotion) {
    const from = { x: L.homeX - Math.max(innerWidth * 0.62, 560), y: L.robotHome.y };
    driver.teleport(from.x, from.y);
    driver.heading = 0;
    setTimeout(() => {
      const path = state.grid.findPath({ ...driver.pos }, L.robotHome);
      driver.follow(path, {
        maxSpeed: 750,
        faceAfter: Math.PI / 2,
        onArrive: () => { robotApi.wave(); robotApi.bounce(0.8); state.introDone = true; },
      });
    }, 650);
  }

  // deep link
  const hash = location.hash.replace('#', '');
  if (hash === 'papers' || hash === 'blog' || hash === 'about' || hash === 'collabs') {
    setTimeout(() => goTo(hash), reducedMotion ? 0 : 1600);
  }
}

boot();

// debug/testing handle (harmless in production)
window.__site = { state, get driver() { return driver; }, get robot() { return robotApi; }, goTo };
