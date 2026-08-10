# klemen-website 🤖

Personal site for Klemen Kotar — a warm paper "map" world that a small, very
earnest robot drives around. No build step, no framework: static HTML + ES
modules + a vendored copy of three.js.

## Run locally

```bash
cd klemen-website
python3 -m http.server 8000     # any static server works
# open http://localhost:8000
```

(Opening `index.html` via `file://` won't work — ES modules need a server.)

## Deploy (GitHub Pages)

Push this directory to the `klemenkotar.github.io` repo (or any repo with
Pages enabled, `main` branch, root folder). Everything is relative-path and
self-contained; the only external dependency is Google Fonts (degrades to
system fonts if blocked).

## Editing content

- **Papers / blog posts** → [js/data.js](js/data.js). Each paper is one object;
  `id` is its arXiv id and doubles as the thumbnail filename.
- **Paper thumbnails** → `assets/papers/<arxiv-id>.webp`. Generate one from the
  PDF's first page with ghostscript + PIL, e.g.:
  ```bash
  gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r120 -dFirstPage=1 -dLastPage=1 -o /tmp/p.png paper.pdf
  python3 -c "from PIL import Image; im=Image.open('/tmp/p.png').convert('RGB'); w,h=im.size; im=im.crop((int(w*.06),int(h*.045),int(w*.94),int(h*.62))); im.thumbnail((640,9999)); im.save('assets/papers/XXXX.XXXXX.webp','WEBP',quality=80)"
  ```
  If a thumbnail is missing the card shows a 📄 placeholder — nothing breaks.
- **Bio / hero text** → [index.html](index.html) (the `.hero` block).
- **Profile photo** → `assets/profile.jpg` (Twitter avatar). A formal headshot
  is also available at `assets/profile-formal.jpg` — swap the `src` in
  `index.html` if preferred.

## How it works (map of the code)

| file | what it does |
|---|---|
| [js/main.js](js/main.js) | layout of the world map, CSS-transform camera, navigation, hover-to-drive, input, speech bubble, tread marks, main loop |
| [js/robot.js](js/robot.js) | the robot model (all three.js primitives) + its animation state machine: blinking, saccades, happy/sleepy moods, wave/spin/wiggle idles, springy antenna, crawling treads, heartbeat light |
| [js/scene.js](js/scene.js) | transparent overlay renderer; a camera `setViewOffset` trick pins the robot to any screen point with consistent perspective + shadows |
| [js/driver.js](js/driver.js) | differential-drive locomotion: waypoint following, accel/brake profiles, turn-in-place, celebration spins |
| [js/pathfind.js](js/pathfind.js) | A* over a 40px grid (content boxes become obstacles) + line-of-sight path smoothing |
| [js/data.js](js/data.js) | all content: papers, blog posts, links |
| [robot-dev.html](robot-dev.html) | robot playground for tweaking the model (`?az=&el=&d=&anim=drive|wave|happy`) |

Robot easter eggs: click him (wave/spin/♥), leave him alone for ~50 s (he
falls asleep), keys `h`/`p`/`b` navigate, and he glances at your cursor when
you get close.
