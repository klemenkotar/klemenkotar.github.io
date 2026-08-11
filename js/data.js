// ─────────────────────────────────────────────────────────────────────────────
// Site content. Edit this file to add papers / blog posts.
// Thumbnails live in assets/papers/<id>.png (id = arXiv id).
// ─────────────────────────────────────────────────────────────────────────────

export const BIO = {
  name: 'Klemen Kotar',
  tagline: 'PhD student @ Stanford · world models & robotics',
  short: `I'm a Computer Science PhD student in the <a href="https://neuroailab.stanford.edu" target="_blank" rel="noopener">Stanford NeuroAI Lab</a>, advised by <a href="https://stanford.edu/~yamins/" target="_blank" rel="noopener">Dan Yamins</a>. I build large <b>world models</b> that learn the physical structure of the world from raw video and can be prompted to perceive, predict, and act, with an eye toward <b>robotics</b> and embodied intelligence.`,
  more: `I'm a lead author of <a href="https://neuroailab.github.io/psi-website/" target="_blank" rel="noopener">PSI</a>, a richly controllable physical world model. Before Stanford I was a Predoctoral Young Investigator on the PRIOR team at the <a href="https://prior.allenai.org/" target="_blank" rel="noopener">Allen Institute for AI</a> with Roozbeh Mottaghi, where I co-created <a href="https://allenact.org/" target="_blank" rel="noopener">AllenAct</a>. Earlier still: CS at the University of Washington, an internship at Tesla, and leading the Washington Hyperloop controls team to a 1st-place US finish at the SpaceX Hyperloop competition.`,
};

export const LINKS = [
  { label: 'Email',   url: 'mailto:klemenk@stanford.edu',                                   icon: 'mail' },
  { label: 'Twitter', url: 'https://x.com/KlemenKotar',                                     icon: 'twitter' },
  { label: 'Scholar', url: 'https://scholar.google.com/citations?user=yIuzOOMAAAAJ',        icon: 'scholar' },
  { label: 'GitHub',  url: 'https://github.com/klemenkotar',                                icon: 'github' },
  { label: 'LinkedIn',url: 'https://www.linkedin.com/in/klemen-kotar-06028ba8/',            icon: 'linkedin' },
];

// me() marks Klemen in author strings; * = equal contribution
export const PAPERS = [
  {
    id: '2606.27575',
    title: 'Perceptual 3D Simulation With Physical World Modeling',
    authors: 'Wanhee Lee*, <b>Klemen Kotar</b>*, Rahul Venkatesh*, Jared Watrous*, Daniel L. K. Yamins',
    venue: 'arXiv', year: 2026,
    desc: 'P3Sim: a world-model-based perceptual simulator that predicts how a scene evolves under desired 3D transformations, straight from images.',
    links: { arXiv: 'https://arxiv.org/abs/2606.27575', PDF: 'https://arxiv.org/pdf/2606.27575' },
  },
  {
    id: '2606.00439',
    title: 'Physical Object Understanding with a Physically Controllable World Model',
    authors: 'Rahul Venkatesh*, <b>Klemen Kotar</b>*, Liliang Chen*, Wanhee Lee*, Gia Ancone, Seung Wook Kim, Luca Thomas Wheeler, Jared Watrous, Honglin Chen, Daniel Bear, Stefan Stojanov, Daniel L. K. Yamins',
    venue: 'CVPR', year: 2026, award: 'Highlight',
    desc: 'One probabilistic world model, learned from raw video, zero-shot discovers objects from their physics, segments articulated parts, moves objects in 3D, and reasons about support.',
    links: { arXiv: 'https://arxiv.org/abs/2606.00439', PDF: 'https://arxiv.org/pdf/2606.00439', Blog: 'https://neuroailab.github.io/psi-website/blog/physical-object-understanding.html' },
  },
  {
    id: '2605.24321',
    title: 'Unified 3D Scene Understanding Through Physical World Modeling',
    authors: 'Wanhee Lee*, <b>Klemen Kotar</b>*, Rahul Venkatesh*, Jared Watrous*, Honglin Chen*, Khai Loong Aw, Daniel L. K. Yamins',
    venue: 'ICLR', year: 2026,
    desc: 'Depth estimation, novel view synthesis, and 3D object manipulation as different prompts to one shared physical world model.',
    links: { arXiv: 'https://arxiv.org/abs/2605.24321', PDF: 'https://arxiv.org/pdf/2605.24321' },
  },
  {
    id: '2604.10333',
    title: 'Zero-shot World Models Are Developmentally Efficient Learners',
    authors: 'Khai Loong Aw, <b>Klemen Kotar</b>, Wanhee Lee, Seungwoo Kim, Khaled Jedoui, Rahul Venkatesh, Liliang Chen, Michael C. Frank, Daniel L. K. Yamins',
    venue: 'arXiv', year: 2026,
    desc: 'World models trained on limited, developmentally realistic video generalize zero-shot to physical-understanding tasks, a link to how children learn from little data.',
    links: { arXiv: 'https://arxiv.org/abs/2604.10333', PDF: 'https://arxiv.org/pdf/2604.10333' },
  },
  {
    id: '2509.09737',
    title: 'World Modeling with Probabilistic Structure Integration',
    authors: '<b>Klemen Kotar</b>, Wanhee Lee, Rahul Venkatesh, Honglin Chen, Daniel Bear, Jared Watrous, Simon Kim, Khai Loong Aw, Liliang Chen, Stefan Stojanov, Kevin T. Feigelis, Imran Thobani, Alex Durango, Khaled Jedoui, Atlas Kazemian, Daniel L. K. Yamins',
    venue: 'arXiv', year: 2025, selected: true,
    desc: 'PSI: an autoregressive world model that extracts flow, depth, and object structure from its own predictions and integrates them back as tokens, yielding a richly promptable, physically controllable video model.',
    links: { arXiv: 'https://arxiv.org/abs/2509.09737', PDF: 'https://arxiv.org/pdf/2509.09737', Project: 'https://neuroailab.github.io/psi-website/', Model: 'https://huggingface.co/StanfordNeuroAILab/psi0_5', Code: 'https://github.com/neuroailab/psi-demos' },
  },
  {
    id: '2508.11598',
    title: 'Representing Speech Through Autoregressive Prediction of Cochlear Tokens',
    authors: 'Greta Tuckute, <b>Klemen Kotar</b>, Evelina Fedorenko, Daniel L. K. Yamins',
    venue: 'Interspeech', year: 2025,
    desc: 'AuriStream: tokenize audio the way the human ear does, then learn phonemes, words, and semantics by autoregressive prediction.',
    links: { arXiv: 'https://arxiv.org/abs/2508.11598', PDF: 'https://arxiv.org/pdf/2508.11598' },
  },
  {
    id: '2507.16038',
    title: 'Discovering and Using Spelke Segments',
    authors: 'Rahul Venkatesh, <b>Klemen Kotar</b>, Liliang Chen, Seungwoo Kim, Luca Thomas Wheeler, Jared Watrous, Ashley Xu, Gia Ancone, Wanhee Lee, Honglin Chen, Daniel Bear, Stefan Stojanov, Daniel L. K. Yamins',
    venue: 'arXiv', year: 2025,
    desc: 'Segmentation redefined around Spelke objects (things that move together when pushed) with SpelkeBench and SpelkeNet to find and use them.',
    links: { arXiv: 'https://arxiv.org/abs/2507.16038', PDF: 'https://arxiv.org/pdf/2507.16038' },
  },
  {
    id: '2507.09082',
    title: 'Taming Generative Video Models for Zero-shot Optical Flow Extraction',
    authors: 'Seungwoo Kim, Khai Loong Aw, <b>Klemen Kotar</b>, Cristobal Eyzaguirre, Wanhee Lee, Yunong Liu, Jared Watrous, Stefan Stojanov, Juan Carlos Niebles, Jiajun Wu, Daniel L. K. Yamins',
    venue: 'NeurIPS', year: 2025,
    desc: 'Optical flow from a frozen self-supervised video model via counterfactual prompting: no fine-tuning, no labeled flow.',
    links: { arXiv: 'https://arxiv.org/abs/2507.09082', PDF: 'https://arxiv.org/pdf/2507.09082' },
  },
  {
    id: '2504.21047',
    title: 'Model Connectomes: A Generational Approach to Data-Efficient Language Models',
    authors: '<b>Klemen Kotar</b>, Greta Tuckute',
    venue: 'arXiv', year: 2025,
    desc: 'An evolution-like outer loop distills a sparse inherited "connectome", letting the next model generation learn from human-scale (100M-word) data.',
    links: { arXiv: 'https://arxiv.org/abs/2504.21047', PDF: 'https://arxiv.org/pdf/2504.21047' },
  },
  {
    id: '2504.03875',
    title: '3D Scene Understanding Through Local Random Access Sequence Modeling',
    authors: 'Wanhee Lee*, <b>Klemen Kotar</b>*, Rahul Venkatesh*, Jared Watrous*, Honglin Chen*, Khai Loong Aw, Daniel L. K. Yamins',
    venue: 'arXiv', year: 2025,
    desc: 'LRAS decodes image patches in arbitrary order, enabling state-of-the-art novel view synthesis and 3D object manipulation from a single image.',
    links: { arXiv: 'https://arxiv.org/abs/2504.03875', PDF: 'https://arxiv.org/pdf/2504.03875' },
  },
  {
    id: '2312.06721',
    title: 'Understanding Physical Dynamics with Counterfactual World Modeling',
    authors: 'Rahul Venkatesh, Honglin Chen, Kevin T. Feigelis, Khaled Jedoui, <b>Klemen Kotar</b>, Felix Binder, Wanhee Lee, Sherry Liu, Kevin A. Smith, Judith E. Fan, Daniel L. K. Yamins',
    venue: 'ECCV', year: 2024,
    desc: 'Counterfactual prompting of a masked video predictor extracts keypoints, flow, and occlusions that sharply improve physical-dynamics understanding.',
    links: { arXiv: 'https://arxiv.org/abs/2312.06721', PDF: 'https://arxiv.org/pdf/2312.06721' },
  },
  {
    id: '2311.00750',
    title: 'Are These the Same Apple? Comparing Images Based on Object Intrinsics',
    authors: '<b>Klemen Kotar</b>*, Stephen Tian*, Hong-Xing Yu, Daniel L. K. Yamins, Jiajun Wu',
    venue: 'NeurIPS D&B', year: 2023, selected: true,
    desc: 'The CUTE dataset: 180 objects to test whether vision models recognize the same object across pose, lighting, and background changes.',
    links: { arXiv: 'https://arxiv.org/abs/2311.00750', PDF: 'https://arxiv.org/pdf/2311.00750' },
  },
  {
    id: '2312.02931',
    title: 'WhisBERT: Multimodal Text-Audio Language Modeling on 100M Words',
    authors: 'Lukas Wolf, <b>Klemen Kotar</b>, Greta Tuckute, Eghbal Hosseini, Tamar I. Regev, Ethan Wilcox, Alex Warstadt',
    venue: 'BabyLM @ CoNLL', year: 2023,
    desc: 'Does audio grounding make language learning more data-efficient? A multimodal text+audio LM trained on a developmentally plausible budget.',
    links: { arXiv: 'https://arxiv.org/abs/2312.02931', PDF: 'https://arxiv.org/pdf/2312.02931' },
  },
  {
    id: '2306.01828',
    title: 'Unifying (Machine) Vision via Counterfactual World Modeling',
    authors: 'Daniel M. Bear, Kevin T. Feigelis, Honglin Chen, Wanhee Lee, Rahul Venkatesh, <b>Klemen Kotar</b>, Alex Durango, Daniel L. K. Yamins',
    venue: 'arXiv', year: 2023,
    desc: 'One pretrained masked video predictor, prompted to produce keypoints, flow, depth, and segments: vision tasks unified without task-specific supervision.',
    links: { arXiv: 'https://arxiv.org/abs/2306.01828', PDF: 'https://arxiv.org/pdf/2306.01828' },
  },
  {
    id: '2304.02639',
    title: 'ENTL: Embodied Navigation Trajectory Learner',
    authors: '<b>Klemen Kotar</b>, Aaron Walsman, Roozbeh Mottaghi',
    venue: 'ICCV', year: 2023,
    desc: 'A single sequence model over embodied trajectories that is simultaneously a world model, a localizer, and a navigation policy.',
    links: { arXiv: 'https://arxiv.org/abs/2304.02639', PDF: 'https://arxiv.org/pdf/2304.02639' },
  },
  {
    id: '2207.13738',
    title: 'Break and Make: Interactive Structural Understanding Using LEGO Bricks',
    authors: 'Aaron Walsman, Muru Zhang, <b>Klemen Kotar</b>, Karthik Desingh, Ali Farhadi, Dieter Fox',
    venue: 'ECCV', year: 2022,
    desc: 'Agents take LEGO assemblies apart and rebuild them from memory, a benchmark for long-horizon structural understanding.',
    links: { arXiv: 'https://arxiv.org/abs/2207.13738', PDF: 'https://arxiv.org/pdf/2207.13738' },
  },
  {
    id: '2202.00660',
    title: 'Interactron: Embodied Adaptive Object Detection',
    authors: '<b>Klemen Kotar</b>, Roozbeh Mottaghi',
    venue: 'CVPR', year: 2022, selected: true,
    desc: 'An object detector that keeps adapting at test time by moving through its environment and learning from its own observations.',
    links: { arXiv: 'https://arxiv.org/abs/2202.00660', PDF: 'https://arxiv.org/pdf/2202.00660' },
  },
  {
    id: '2103.14005',
    title: 'Contrasting Contrastive Self-Supervised Representation Learning Pipelines',
    authors: '<b>Klemen Kotar</b>, Gabriel Ilharco, Ludwig Schmidt, Kiana Ehsani, Roozbeh Mottaghi',
    venue: 'ICCV', year: 2021, selected: true,
    desc: '700+ controlled experiments across contrastive methods, pretraining data, and downstream tasks: what actually drives transfer?',
    links: { arXiv: 'https://arxiv.org/abs/2103.14005', PDF: 'https://arxiv.org/pdf/2103.14005', Code: 'https://github.com/allenai/ViRB' },
  },
  {
    id: '2008.12760',
    title: 'AllenAct: A Framework for Embodied AI Research',
    authors: 'Luca Weihs*, Jordi Salvador*, <b>Klemen Kotar</b>*, Unnat Jain, Kuo-Hao Zeng, Roozbeh Mottaghi, Aniruddha Kembhavi <i>(*equal contribution)</i>',
    venue: 'arXiv', year: 2020,
    desc: 'A modular PyTorch framework for reproducible embodied-AI research: many simulators, tasks, and algorithms under one roof.',
    links: { arXiv: 'https://arxiv.org/abs/2008.12760', PDF: 'https://arxiv.org/pdf/2008.12760', Project: 'https://allenact.org/', Code: 'https://github.com/allenai/allenact' },
  },
];

// The About story: flowing paragraphs with tiny 3D dioramas standing in the
// margins beside the text. Each <span class="fact-asset"> is a live render
// slot for js/dioramas.js (side-l floats left of the column, side-r right).
const tile = (asset, fallback, side) => `<span class="fact-asset ${side}" data-asset="${asset}"><span class="asset-fallback">${fallback}</span></span>`;

export const ABOUT_STORY = [
  // childhood — Slovenia
  `${tile('triglav', '🏔️', 'side-r')}I'm originally from <a href="https://en.wikipedia.org/wiki/Slovenia" target="_blank" rel="noopener">Slovenia</a>, a small European country where I lived for the first 13 years of my life. As a kid I played a character in <a href="https://www.imdb.com/name/nm5713761/" target="_blank" rel="noopener">the most-watched movie franchise in Slovenian history</a>, a comedy about camping in the beautiful Alps!`,

  // high school
  `${tile('rocket', '🚀', 'side-l')}In high school I was part of a rocketry club, where we designed and manufactured hobby rockets up to M-class. That's where I found my passion for building things and programming. My first high school job was making websites for local businesses.`,

  // college
  `${tile('hyperloop', '🚄', 'side-r')}As a freshman I led the controls group of Washington Hyperloop, where we <a href="https://www.aa.washington.edu/news/article/2018-09-18/uw-hyperloop-team-wins-innovation-prize-spacex-competition" target="_blank" rel="noopener">won an Innovation Award as the top-ranking US team</a> at the SpaceX Hyperloop competition. That summer I interned at Tesla. ${tile('franka', '🦾', 'side-l')}In my second year I joined <a href="https://homes.cs.washington.edu/~fox/" target="_blank" rel="noopener">Dieter Fox</a>'s lab at UW, where I fell in love with AI research under the guidance of <a href="https://aaronwalsman.com" target="_blank" rel="noopener">Aaron Walsman</a>.`,

  // post-college — now
  `${tile('hoover', '🗼', 'side-r')}After two years as a Predoctoral Young Investigator with <a href="https://roozbehm.info" target="_blank" rel="noopener">Roozbeh Mottaghi</a> on the <a href="https://prior.allenai.org" target="_blank" rel="noopener">PRIOR</a> team at the Allen Institute for AI, I'm now a PhD candidate at <b>Stanford</b>, studying various implementations of intelligence, to build better robot brains.`,

  // what I love
  `I love making things, which to me means understanding the substrate of the world around us and recombining it in new ways. This ranges from cooking to tinkering and science, all of which I see as different expressions of the same underlying process. I also enjoy the stunning and inspiring nature of California.`,
];

export const BLOGS = [
  {
    title: 'Releasing PSIv0.5',
    url: 'https://neuroailab.github.io/psi-website/blog/releasing-psiv0-5.html',
    date: 'May 2026', tag: 'Ψ-talk',
    teaser: 'PSIv0.5: an 8B-parameter model that unifies RGB, camera motion, optical flow, and depth tokens in one autoregressive world model: prediction, interpolation, motion estimation, and controlled generation all become sequence-completion queries. Weights on Hugging Face.',
  },
  {
    title: 'Physical Object Understanding with a Physically Controllable World Model',
    url: 'https://neuroailab.github.io/psi-website/blog/physical-object-understanding.html',
    date: '2026', tag: 'Ψ-talk · CVPR 2026 Highlight',
    teaser: 'A single world model, natively promptable with physical interactions, zero-shot discovers objects from their physics, segments articulated parts, manipulates objects in 3D, and reasons about support relationships.',
  },
  {
    title: 'PSI: Richly Controllable Physical World Modeling',
    url: 'https://neuroailab.github.io/psi-website/blog/psi-generations.html',
    date: '2026', tag: 'Ψ-talk · gallery',
    teaser: 'A gallery of PSIv0.5 rollouts showing that precise physical controls are just different prompt strings: intuitive physics, cause and effect, articulated mechanisms, deformables, fluids, novel views.',
  },
];

// Co-authorships from works NOT shown in the Papers list (CCN abstracts,
// workshop papers). Plain author strings only — these feed the collaborator
// universe (bubble sizes + who appears) without cluttering the curated list.
export const MORE_COAUTHORSHIPS = [
  // filled in from Google Scholar (2026-08); see COLLABS for the people.
  // NeurIPS 2025 — Self-Supervised Learning of Motion Concepts by Optimizing Counterfactuals
  'Stefan Stojanov, David Wendt, Seungwoo Kim, Rahul Venkatesh, Kevin T. Feigelis, Klemen Kotar, Khai Loong Aw, Jiajun Wu, Daniel L. K. Yamins',
  // A biologically plausible route to learn 3D perception
  'Wanhee Lee, Jared Watrous, Honglin Chen, Klemen Kotar, Tyler Bonnen, Daniel L. K. Yamins',
  // Modeling Focal Synaptic Degeneration and Neural Plasticity in Ventral Visual Cortex
  'Yash Shah, Kevin Tran, Klemen Kotar, Daniel L. K. Yamins',
  // CCN — Are ViTs as Global as We Think? Assessing Model Locality for Brain-Model Mapping
  'Fangrui Huang, Klemen Kotar, Wanhee Lee, Rosa Cao, Daniel L. K. Yamins',
  // CCN — Learning Language by Listening: A Computational Learnability Account
  'Greta Tuckute, Klemen Kotar, Daniel L. K. Yamins, Talia Konkle',
  // CCN — VAST: Visual Abstractions as Streams of Thought
  'Khai Loong Aw, Klemen Kotar, Baihan Zhang, Yunong Liu, Liliang Chen, Rahul Venkatesh, Atlas Kazemian, Wanhee Lee, Daniel L. K. Yamins',
  // CCN — Unifying Discrimination and Generation in One Architecture
  'Imran Thobani, Klemen Kotar, Jared Watrous, Andreas S. Tolias, Daniel L. K. Yamins',
];

// Collaborators section: circle size scales with number of shared papers.
// aliases match spelling variants in the author strings above.
// Every co-author across the papers, grouped into rough co-authorship
// clusters. Bubble size is computed from shared-paper counts at build time.
export const CLUSTERS = {
  neuroai: { label: 'NeuroAI Lab',      color: '#ff7d17' },
  cogai:   { label: 'Stanford vision',  color: '#2fb8cf' },
  cogsci:  { label: 'CogSci',           color: '#8a6fc8' },
  mitlang: { label: 'MIT language',     color: '#ff6f61' },
  ai2uw:   { label: 'AI2 & UW',        color: '#7ba05b' },
};

export const COLLABS = [
  // ── Stanford NeuroAI ──
  { name: 'Dan Yamins', slug: 'yamins', cluster: 'neuroai', url: 'https://stanford.edu/~yamins/', aliases: ['Daniel L. K. Yamins', 'Daniel LK Yamins'] },
  { name: 'Wanhee Lee', slug: 'wanhee', cluster: 'neuroai', url: 'https://scholar.google.com/citations?user=BdHgmrUAAAAJ&hl=en', aliases: ['Wanhee Lee'] },
  { name: 'Rahul Venkatesh', slug: 'rahul', cluster: 'neuroai', url: 'https://rahulvenkk.github.io/', aliases: ['Rahul Venkatesh'] },
  { name: 'Jared Watrous', slug: 'jared', trainee: true, cluster: 'neuroai', url: 'https://www.linkedin.com/in/jared-watrous/', aliases: ['Jared Watrous'] },
  { name: 'Honglin Chen', slug: 'honglin', cluster: 'neuroai', url: 'https://honglinc.com/', aliases: ['Honglin Chen'] },
  { name: 'Khai Loong Aw', slug: 'khai', cluster: 'neuroai', url: 'https://awwkl.github.io/', aliases: ['Khai Loong Aw'] },
  { name: 'Stefan Stojanov', slug: 'stefan', cluster: 'neuroai', url: 'https://sstojanov.github.io/', aliases: ['Stefan Stojanov'] },
  { name: 'Dan Bear', slug: 'bear', cluster: 'neuroai', url: 'https://neuroscience.stanford.edu/people/daniel-bear', aliases: ['Daniel Bear', 'Daniel M. Bear'] },
  { name: 'Simon Kim', slug: 'seungwoo', trainee: true, cluster: 'neuroai', url: 'https://sekim12.github.io/', aliases: ['Seungwoo Kim', 'Seung Wook Kim', 'Simon Kim'] },
  { name: 'Liliang Chen', slug: 'liliang', trainee: true, cluster: 'neuroai', url: 'https://www.linkedin.com/in/lilian-naing-chen-1975b81b1', aliases: ['Liliang Chen'] },
  { name: 'Khaled Jedoui', slug: 'khaled', cluster: 'neuroai', url: 'https://web.stanford.edu/~thekej/', aliases: ['Khaled Jedoui'] },
  { name: 'Kevin Feigelis', slug: 'feigelis', cluster: 'neuroai', url: 'https://scholar.google.com/citations?user=BlU496UAAAAJ&hl=en', aliases: ['Kevin T. Feigelis'] },
  { name: 'Gia Ancone', slug: 'gia', trainee: true, cluster: 'neuroai', url: 'https://www.linkedin.com/in/gia-ancone-58b545207', aliases: ['Gia Ancone'] },
  { name: 'Luca Wheeler', slug: 'lucaw', trainee: true, cluster: 'neuroai', url: 'https://www.lucathomaswheeler.com', aliases: ['Luca Thomas Wheeler'] },
  { name: 'Alex Durango', slug: 'durango', cluster: 'neuroai', url: 'https://www.linkedin.com/in/alexander-durango/', aliases: ['Alex Durango'] },
  { name: 'Imran Thobani', slug: 'imran', cluster: 'neuroai', url: 'https://imranthobani.com/', aliases: ['Imran Thobani'] },
  { name: 'Atlas Kazemian', slug: 'atlas', cluster: 'neuroai', url: 'https://akazemian.github.io/personal_profile/', aliases: ['Atlas Kazemian'] },
  { name: 'Ashley Xu', slug: 'ashley', trainee: true, cluster: 'neuroai', url: 'https://www.linkedin.com/in/ashley-xu-a2588b1a9', aliases: ['Ashley Xu'] },
  { name: 'Yash Shah', slug: 'yash', cluster: 'neuroai', url: 'https://ynshah3.github.io/', aliases: ['Yash Shah'] },
  // ── Stanford vision / CogAI ──
  { name: 'Jiajun Wu', slug: 'jiajun', cluster: 'cogai', url: 'https://jiajunwu.com', aliases: ['Jiajun Wu'] },
  { name: 'Stephen Tian', slug: 'tian', cluster: 'cogai', url: 'https://s-tian.github.io/', aliases: ['Stephen Tian'] },
  { name: 'Koven Yu', slug: 'koven', cluster: 'cogai', url: 'https://kovenyu.com/', aliases: ['Hong-Xing Yu'] },
  { name: 'Juan Carlos Niebles', slug: 'niebles', cluster: 'cogai', url: 'https://www.niebles.net/', aliases: ['Juan Carlos Niebles'] },
  { name: 'Cristobal Eyzaguirre', slug: 'cristobal', cluster: 'cogai', url: 'https://ceyzaguirre4.github.io/', aliases: ['Cristobal Eyzaguirre'] },
  { name: 'Yunong Liu', slug: 'yunong', cluster: 'cogai', url: 'https://yunongliu.com/', aliases: ['Yunong Liu'] },
  { name: 'Andreas Tolias', slug: 'tolias', cluster: 'cogai', url: 'https://toliaslab.org/', aliases: ['Andreas S. Tolias', 'Andreas Tolias'] },
  // ── CogSci ──
  { name: 'Michael Frank', slug: 'frank', cluster: 'cogsci', url: 'https://web.stanford.edu/~mcfrank/', aliases: ['Michael C. Frank'] },
  { name: 'Kevin Smith', slug: 'ksmith', cluster: 'cogsci', url: 'https://www.mit.edu/~k2smith/', aliases: ['Kevin A. Smith'] },
  { name: 'Judith Fan', slug: 'jfan', cluster: 'cogsci', url: 'https://cogtoolslab.github.io/', aliases: ['Judith E. Fan'] },
  { name: 'Felix Binder', slug: 'binder', cluster: 'cogsci', url: 'https://felixbinder.net/', aliases: ['Felix Binder'] },
  { name: 'Tyler Bonnen', slug: 'bonnen', cluster: 'cogsci', url: 'https://tzler.github.io/', aliases: ['Tyler Bonnen'] },
  { name: 'Talia Konkle', slug: 'konkle', cluster: 'cogsci', url: 'https://konklab.fas.harvard.edu/', aliases: ['Talia Konkle'] },
  // ── MIT language ──
  { name: 'Greta Tuckute', slug: 'greta', cluster: 'mitlang', url: 'http://www.tuckute.com', aliases: ['Greta Tuckute'] },
  { name: 'Ev Fedorenko', slug: 'fedorenko', cluster: 'mitlang', url: 'https://www.evlab.mit.edu/', aliases: ['Evelina Fedorenko'] },
  { name: 'Lukas Wolf', slug: 'wolf', cluster: 'mitlang', url: 'https://lu-wo.github.io/', aliases: ['Lukas Wolf'] },
  { name: 'Eghbal Hosseini', slug: 'hosseini', cluster: 'mitlang', url: 'https://eghbalhosseini.github.io/', aliases: ['Eghbal Hosseini'] },
  { name: 'Tamar Regev', slug: 'regev', cluster: 'mitlang', url: 'https://www.tamarz.website/', aliases: ['Tamar I. Regev'] },
  { name: 'Ethan Wilcox', slug: 'wilcox', cluster: 'mitlang', url: 'https://wilcoxeg.github.io/', aliases: ['Ethan Wilcox'] },
  { name: 'Alex Warstadt', slug: 'warstadt', cluster: 'mitlang', url: 'https://alexwarstadt.github.io/', aliases: ['Alex Warstadt'] },
  // ── AI2 & UW ──
  { name: 'Roozbeh Mottaghi', slug: 'roozbeh', cluster: 'ai2uw', url: 'https://roozbehm.info', aliases: ['Roozbeh Mottaghi'] },
  { name: 'Aaron Walsman', slug: 'aaron', cluster: 'ai2uw', url: 'https://aaronwalsman.com', aliases: ['Aaron Walsman'] },
  { name: 'Dieter Fox', slug: 'fox', cluster: 'ai2uw', url: 'https://homes.cs.washington.edu/~fox/', aliases: ['Dieter Fox'] },
  { name: 'Ali Farhadi', slug: 'farhadi', cluster: 'ai2uw', url: 'https://homes.cs.washington.edu/~ali/', aliases: ['Ali Farhadi'] },
  { name: 'Muru Zhang', slug: 'muru', cluster: 'ai2uw', url: 'https://nanami18.github.io/', aliases: ['Muru Zhang'] },
  { name: 'Karthik Desingh', slug: 'desingh', cluster: 'ai2uw', url: 'https://karthikdesingh.com/', aliases: ['Karthik Desingh'] },
  { name: 'Gabriel Ilharco', slug: 'ilharco', cluster: 'ai2uw', url: 'https://gabrielilharco.com/', aliases: ['Gabriel Ilharco'] },
  { name: 'Ludwig Schmidt', slug: 'ludwig', cluster: 'ai2uw', url: 'https://people.csail.mit.edu/ludwigs/', aliases: ['Ludwig Schmidt'] },
  { name: 'Kiana Ehsani', slug: 'kiana', cluster: 'ai2uw', url: 'https://ehsanik.github.io/', aliases: ['Kiana Ehsani'] },
  { name: 'Luca Weihs', slug: 'weihs', cluster: 'ai2uw', url: 'https://lucaweihs.github.io/', aliases: ['Luca Weihs'] },
  { name: 'Jordi Salvador', slug: 'jordi', cluster: 'ai2uw', url: null, aliases: ['Jordi Salvador'] },
  { name: 'Unnat Jain', slug: 'unnat', cluster: 'ai2uw', url: 'https://unnat.github.io/', aliases: ['Unnat Jain'] },
  { name: 'Kuo-Hao Zeng', slug: 'kuohao', cluster: 'ai2uw', url: 'https://kuohaozeng.github.io/', aliases: ['Kuo-Hao Zeng'] },
  { name: 'Ani Kembhavi', slug: 'ani', cluster: 'ai2uw', url: 'https://anikem.github.io/', aliases: ['Aniruddha Kembhavi'] },
];
