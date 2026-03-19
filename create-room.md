# Create Room — Page Reference

> *Melos UI Component — Full Implementation*

---

## Overview

The Create Room page is the entry point for starting a new listening session on Melos. It shares the overall Melos design language — glassy surfaces, Georgia serif typography, the five-colour palette — but uses a distinctly different background from the landing and login screens to signal a change in context.

Where the landing page uses vertical procedural lines, this page layers three independent background systems: drifting radial orbs, pulsing concentric rings, and diagonal grain lines. All three react to the cursor independently, creating a living canvas that feels exploratory and warm.

---

## Design Decisions

**Background differentiation** — Each major Melos screen should feel recognisably part of the same family but spatially distinct. The create-room page moves from linear to radial and diagonal geometry, shifting the mood from arrival to creation.

**Deeper base colour** — The base is `#2E1F2E` rather than `#433850`, giving the floating orbs more contrast and depth to glow against.

**Cursor dot** — Changed from lavender to cream-white `#FDFEF5` to contrast against the darker, more complex background.

**Single action focus** — The page presents exactly one affordance: the glassy `+` button. No navigation clutter, no distractions. The room creation intent is the entire screen.

**Modal on click** — The creation form appears as a frosted glass dialogue over the animated background. The background continues to animate and respond to the cursor while the modal is open.

---

## Colour Tokens

| Name | Hex | Role on this page |
|---|---|---|
| Deep Purple Base | `#2E1F2E` | Page background |
| Grape Soda | `#88527F` | Orb colour variant |
| Amethyst Smoke | `#CBAACB` | Orb, ring, grain, borders, labels |
| Chocolate Plum | `#6B3F3F` | Orb, grain colour variant |
| Slate Blue | `#454859` | Orb, ring colour variant |
| Lavender Mid | `#9F87AF` | Ring colour variant |
| Near-Black | `#7A6890` | Ring colour variant |
| Cream White | `#FDFEF5` | Cursor dot, text, input text |
| Dark Deep | `#2A1A2A` | Orb colour (deepest) |

---

## Background System

The background is drawn entirely on an HTML5 `<canvas>` element that fills the full viewport. Three independent systems are composited on every animation frame.

### System 1 — Floating Orbs

Six radial gradient blobs drift slowly across the canvas with randomised velocity. Each orb brightens (opacity increases up to `0.28`) when the cursor comes within 160px of its centre. Orbs wrap around the viewport edges so they never disappear.

- Count: 6
- Radius range: 60–180px
- Velocity: ±0.18px per frame
- Cursor threshold: 160px
- Colours: `#CBAACB`, `#6B3F3F`, `#454859`, `#88527F`, `#2A1A2A`
- Base opacity: 0.06–0.16, hover max 0.28

### System 2 — Concentric Rings

Eighteen thin rings are scattered at random positions across the canvas. Each pulses in radius using a sine wave with an individual speed and phase offset, creating organic breathing movement. Rings brighten when the cursor enters their radius + 40px threshold.

- Count: 18
- Radius range: 40–220px (before pulse)
- Pulse amplitude: ±12px
- Stroke width: 0.5–1.7px
- Base opacity: 0.04–0.11, hover max 0.35
- Colours: `#CBAACB`, `#6B3F3F`, `#454859`, `#9F87AF`, `#7A6890`

### System 3 — Diagonal Grain Lines

Twenty-eight fine lines run diagonally (top-right to bottom-left, 45°) and drift slowly across the canvas. Each line independently detects cursor proximity using a point-to-line distance calculation. On hover, a line thickens (up to 3× its base width) and increases opacity by up to 0.4.

- Count: 28
- Thickness range: 0.4–1.8px
- Drift speed: ±0.12px per frame
- Cursor threshold: 80px (perpendicular distance)
- Base opacity: 0.03–0.10
- Colours: `#CBAACB`, `#FDFEF5`, `#6B3F3F`

---

## Component Specs

### Create Button

Sits centred in the viewport. Rounded square with `border-radius: 28px`.

```
width:           110px
height:          110px
border-radius:   28px
background:      rgba(203,170,203,0.08)
border:          1px solid rgba(203,170,203,0.28)
backdrop-filter: blur(20px)
hover bg:        rgba(203,170,203,0.18)
hover border:    rgba(203,170,203,0.50)
hover transform: scale(1.04)
icon:            32×32px SVG plus, stroke #CBAACB, 1.8px
label:           "create a room", 10px Georgia, letter-spacing:2px
```

### Modal Card

Appears centred over the background on button click. Enters with `translateY(16px) scale(0.97)` → `translateY(0) scale(1)` over 300ms.

```
width:           460px
border-radius:   24px
background:      rgba(48,32,52,0.75)
border:          1px solid rgba(203,170,203,0.18)
backdrop-filter: blur(36px)
padding:         36px 36px 28px
```

### Modal Fields

**Room name** — single line text input, 40 char max
**Description** — textarea, 68px height, optional

```
Input background:      rgba(253,254,245,0.04)
Input border:          1px solid rgba(203,170,203,0.13)
Input focus border:    rgba(203,170,203,0.48)
Input focus bg:        rgba(253,254,245,0.07)
Input text:            13px Georgia, #FDFEF5
Label:                 10px Georgia, letter-spacing:3px, rgba(203,170,203,0.50)
Placeholder:           rgba(203,170,203,0.22)
```

### Theme Swatches

Ten premade themes displayed in a 5×2 grid. Each swatch is a square with `border-radius: 10px` rendered as a 135° linear gradient across three colour stops. Selected state shows a white checkmark and `border: 2px solid #FDFEF5`.

| # | Name | Colour A | Colour B | Colour C |
|---|---|---|---|---|
| 1 | Melos | `#433850` | `#CBAACB` | `#6B3F3F` |
| 2 | Midnight | `#1A1A2E` | `#E94560` | `#0F3460` |
| 3 | Forest | `#1B2A1F` | `#4CAF7D` | `#2D5016` |
| 4 | Ember | `#2C1810` | `#E8824A` | `#8B3A1E` |
| 5 | Ocean | `#0D1B2A` | `#5BA4CF` | `#1A3A5C` |
| 6 | Rose | `#2A1520` | `#D4789E` | `#8B2252` |
| 7 | Slate | `#1C1F2E` | `#8892B0` | `#2D3561` |
| 8 | Amber | `#1E1800` | `#F0B429` | `#6B4C00` |
| 9 | Dusk | `#1A1025` | `#B388FF` | `#4A148C` |
| 10 | Sage | `#141E17` | `#80CBC4` | `#2E4A3E` |

### Custom Colour Picker

A native `<input type="color">` overlaid on a circular preview div. On "apply", the selected hex is applied to the preview strip and deselects all swatches.

```
Preview circle:  36×36px, border-radius:50%
                 border: 2px solid rgba(203,170,203,0.30)
Apply button:    pill shape, rgba(203,170,203,0.10) bg
                 border: 1px solid rgba(203,170,203,0.25)
```

### Preview Strip

A 5px tall rounded strip below the custom picker that reflects the currently active theme or custom colour. Transitions at `0.4s` when switching themes.

### Create Room Button

Full-width pill button at the bottom of the modal.

```
padding:         13px 0
border-radius:   999px
background:      rgba(203,170,203,0.15)
border:          1px solid rgba(203,170,203,0.35)
hover bg:        rgba(203,170,203,0.28)
hover border:    rgba(203,170,203,0.58)
text:            12px Georgia, letter-spacing:4px, #FDFEF5
```

---

## Interaction Behaviour

| Action | Result |
|---|---|
| Hover cursor over background | Orbs brighten, rings glow, grain lines thicken near cursor |
| Click create button | Modal fades in (opacity 0→1, translateY 16→0, scale 0.97→1) |
| Click theme swatch | Swatch gets white border + checkmark; preview strip updates |
| Change colour picker | Circle preview updates live |
| Click apply | Custom colour applied to strip; swatches deselected |
| Click ✕ or outside modal | Modal fades out |
| Background while modal open | Continues animating and reacting to cursor |

---

## File Structure

```
/
├── create-room.html     ← full page (self-contained, no dependencies)
└── create-room.md       ← this document
```

---

## Full Source Code

### create-room.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Melos — Create Room</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }

body {
  width:100vw; height:100vh;
  background:#2E1F2E;
  overflow:hidden; cursor:none;
  font-family:Georgia,serif;
}

canvas { position:fixed; inset:0; width:100%; height:100%; }

#cursor-dot {
  position:fixed; width:6px; height:6px;
  background:#FDFEF5; border-radius:50%;
  pointer-events:none; transform:translate(-50%,-50%);
  z-index:20; opacity:0; transition:opacity 0.3s;
}

#center {
  position:fixed; inset:0;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:14px; z-index:5;
}

.page-label {
  font-size:11px; letter-spacing:5px;
  color:rgba(203,170,203,0.45);
  text-transform:uppercase;
}

#create-btn {
  width:110px; height:110px;
  border-radius:28px;
  background:rgba(203,170,203,0.08);
  border:1px solid rgba(203,170,203,0.28);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  cursor:pointer;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:6px;
  transition:background 0.25s, border-color 0.25s, transform 0.2s;
}
#create-btn:hover {
  background:rgba(203,170,203,0.18);
  border-color:rgba(203,170,203,0.5);
  transform:scale(1.04);
}
#create-btn svg { width:32px; height:32px; }
#create-btn span {
  font-size:10px; letter-spacing:2px;
  color:rgba(253,254,245,0.6);
}

#modal-overlay {
  position:fixed; inset:0;
  background:rgba(30,16,30,0.6);
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
  z-index:10;
  display:flex; align-items:center; justify-content:center;
  opacity:0; pointer-events:none;
  transition:opacity 0.3s;
}
#modal-overlay.open { opacity:1; pointer-events:all; }

.modal {
  width:460px; max-width:94vw;
  background:rgba(48,32,52,0.75);
  border:1px solid rgba(203,170,203,0.18);
  border-radius:24px;
  backdrop-filter:blur(36px);
  -webkit-backdrop-filter:blur(36px);
  padding:36px 36px 28px;
  display:flex; flex-direction:column;
  transform:translateY(16px) scale(0.97);
  transition:transform 0.3s;
}
#modal-overlay.open .modal { transform:translateY(0) scale(1); }

.modal-header {
  display:flex; align-items:center;
  justify-content:space-between; margin-bottom:28px;
}
.modal-title {
  font-size:18px; font-weight:400;
  color:#FDFEF5; letter-spacing:1px;
}
.modal-close {
  width:28px; height:28px; border-radius:50%;
  background:rgba(203,170,203,0.08);
  border:1px solid rgba(203,170,203,0.18);
  color:rgba(203,170,203,0.55); cursor:pointer;
  font-size:13px; display:flex;
  align-items:center; justify-content:center;
  transition:background 0.2s;
}
.modal-close:hover { background:rgba(203,170,203,0.2); }

.field { margin-bottom:20px; }
.field label {
  display:block; font-size:10px;
  color:rgba(203,170,203,0.5);
  letter-spacing:3px; margin-bottom:8px;
}
.field input, .field textarea {
  width:100%; padding:11px 14px;
  border-radius:12px;
  background:rgba(253,254,245,0.04);
  border:1px solid rgba(203,170,203,0.13);
  color:#FDFEF5; font-family:Georgia,serif;
  font-size:13px; outline:none; resize:none;
  transition:border-color 0.2s, background 0.2s;
}
.field input::placeholder,
.field textarea::placeholder { color:rgba(203,170,203,0.22); }
.field input:focus, .field textarea:focus {
  border-color:rgba(203,170,203,0.48);
  background:rgba(253,254,245,0.07);
}
.field textarea { height:68px; line-height:1.6; }

.theme-label {
  font-size:10px; color:rgba(203,170,203,0.5);
  letter-spacing:3px; margin-bottom:12px;
}
.themes-grid {
  display:grid; grid-template-columns:repeat(5,1fr);
  gap:8px; margin-bottom:12px;
}
.theme-swatch {
  aspect-ratio:1; border-radius:10px; cursor:pointer;
  border:2px solid transparent;
  transition:transform 0.18s, border-color 0.18s;
  position:relative; overflow:hidden;
}
.theme-swatch:hover { transform:scale(1.08); }
.theme-swatch.selected { border-color:#FDFEF5; transform:scale(1.08); }
.theme-swatch .check {
  position:absolute; inset:0;
  display:flex; align-items:center; justify-content:center;
  opacity:0; transition:opacity 0.15s;
}
.theme-swatch.selected .check { opacity:1; }

.custom-row {
  display:flex; align-items:center;
  gap:12px; margin-bottom:22px;
}
.custom-label {
  font-size:10px; color:rgba(203,170,203,0.4);
  letter-spacing:2px; flex:1;
}
.color-picker-wrap {
  position:relative; width:36px; height:36px;
}
.color-picker-wrap input[type=color] {
  position:absolute; inset:0;
  width:100%; height:100%;
  opacity:0; cursor:pointer; border:none; padding:0;
}
.color-preview {
  width:36px; height:36px; border-radius:50%;
  border:2px solid rgba(203,170,203,0.3);
  pointer-events:none;
}
.custom-apply {
  padding:7px 16px; border-radius:99px;
  background:rgba(203,170,203,0.1);
  border:1px solid rgba(203,170,203,0.25);
  color:rgba(253,254,245,0.75);
  font-family:Georgia,serif; font-size:11px;
  letter-spacing:2px; cursor:pointer;
  transition:background 0.2s;
}
.custom-apply:hover { background:rgba(203,170,203,0.2); }

.preview-strip {
  height:5px; border-radius:3px;
  margin-bottom:22px; transition:background 0.4s;
}

.submit-btn {
  width:100%; padding:13px 0; border-radius:999px;
  background:rgba(203,170,203,0.15);
  border:1px solid rgba(203,170,203,0.35);
  color:#FDFEF5; font-family:Georgia,serif;
  font-size:12px; letter-spacing:4px; cursor:pointer;
  transition:background 0.2s, border-color 0.2s;
}
.submit-btn:hover {
  background:rgba(203,170,203,0.28);
  border-color:rgba(203,170,203,0.58);
}
</style>
</head>
<body>

<canvas id="canvas"></canvas>
<div id="cursor-dot"></div>

<div id="center">
  <p class="page-label">your rooms</p>
  <button id="create-btn">
    <svg viewBox="0 0 32 32" fill="none" stroke="#CBAACB" stroke-width="1.8" stroke-linecap="round">
      <line x1="16" y1="7" x2="16" y2="25"/>
      <line x1="7" y1="16" x2="25" y2="16"/>
    </svg>
    <span>create a room</span>
  </button>
</div>

<div id="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title">create a room</span>
      <button class="modal-close" id="close-btn">✕</button>
    </div>

    <div class="field">
      <label>room name</label>
      <input type="text" placeholder="give your room a name…" maxlength="40"/>
    </div>

    <div class="field">
      <label>description</label>
      <textarea placeholder="what's the vibe? (optional)"></textarea>
    </div>

    <p class="theme-label">choose a theme</p>
    <div class="themes-grid" id="themes-grid"></div>

    <div class="custom-row">
      <span class="custom-label">or pick your own colour</span>
      <div class="color-picker-wrap">
        <div class="color-preview" id="color-preview"></div>
        <input type="color" id="color-picker" value="#9F87AF"/>
      </div>
      <button class="custom-apply" id="apply-custom">apply</button>
    </div>

    <div class="preview-strip" id="preview-strip"></div>
    <button class="submit-btn">create room</button>
  </div>
</div>

<script>
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const dot    = document.getElementById('cursor-dot');

let W, H, mouse = {x:-999, y:-999}, animId, time = 0;
const rings = [], grainLines = [], orbs = [];

function buildRings() {
  rings.length = 0;
  const cx = W * 0.5, cy = H * 0.5;
  for (let i = 0; i < 18; i++) {
    rings.push({
      cx: cx + (Math.random() - 0.5) * W * 0.5,
      cy: cy + (Math.random() - 0.5) * H * 0.5,
      baseR:  40 + Math.random() * 180,
      speed:  0.0003 + Math.random() * 0.0005,
      phase:  Math.random() * Math.PI * 2,
      opacity: 0.04 + Math.random() * 0.07,
      thickness: 0.5 + Math.random() * 1.2,
      color: ['#CBAACB','#6B3F3F','#454859','#9F87AF','#7A6890'][Math.floor(Math.random()*5)]
    });
  }
}

function buildGrain() {
  grainLines.length = 0;
  for (let i = 0; i < 28; i++) {
    grainLines.push({
      offset:    Math.random() * (W + H),
      thickness: 0.4 + Math.random() * 1.4,
      opacity:   0.03 + Math.random() * 0.07,
      speed:     (Math.random() - 0.5) * 0.12,
      color:     ['#CBAACB','#FDFEF5','#6B3F3F'][Math.floor(Math.random()*3)],
      hoverAmt:  0,
    });
  }
}

function buildOrbs() {
  orbs.length = 0;
  const colors = ['#CBAACB','#6B3F3F','#454859','#88527F','#2A1A2A'];
  for (let i = 0; i < 6; i++) {
    orbs.push({
      x: Math.random() * W, y: Math.random() * H,
      r:  60 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      color:   colors[i % colors.length],
      opacity: 0.06 + Math.random() * 0.1,
      _displayOpacity: 0,
    });
  }
}

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  buildRings(); buildGrain(); buildOrbs();
}

function nearMouse(x, y, r) {
  const dx = x - mouse.x, dy = y - mouse.y;
  return Math.sqrt(dx*dx + dy*dy) < r;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#2E1F2E';
  ctx.fillRect(0, 0, W, H);

  orbs.forEach(o => {
    const near = nearMouse(o.x, o.y, 160);
    const target = near ? Math.min(o.opacity * 2.5, 0.28) : o.opacity;
    o._displayOpacity += (target - o._displayOpacity) * 0.05;
    const alpha = Math.round(o._displayOpacity * 255).toString(16).padStart(2,'0');
    const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    grad.addColorStop(0, o.color + alpha);
    grad.addColorStop(1, o.color + '00');
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();
    o.x += o.vx; o.y += o.vy;
    if (o.x < -o.r) o.x = W + o.r;
    if (o.x > W + o.r) o.x = -o.r;
    if (o.y < -o.r) o.y = H + o.r;
    if (o.y > H + o.r) o.y = -o.r;
  });

  rings.forEach(ring => {
    const pulse = Math.sin(time * ring.speed * 1000 + ring.phase) * 12;
    const r = ring.baseR + pulse;
    const near = nearMouse(ring.cx, ring.cy, r + 40);
    ctx.beginPath();
    ctx.arc(ring.cx, ring.cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = ring.thickness;
    ctx.globalAlpha = near ? Math.min(ring.opacity * 3, 0.35) : ring.opacity;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  grainLines.forEach(g => {
    g.offset += g.speed;
    if (g.offset > W + H) g.offset -= (W + H) * 1.5;
    if (g.offset < -(W + H)) g.offset += (W + H) * 1.5;
    const sx = g.offset, sy = 0, ex = g.offset - H, ey = H;
    const dx = ex - sx, dy = ey - sy;
    const len = Math.sqrt(dx*dx + dy*dy);
    const t = Math.max(0, Math.min(1, ((mouse.x-sx)*dx + (mouse.y-sy)*dy) / (len*len)));
    const dist = Math.sqrt((mouse.x-(sx+t*dx))**2 + (mouse.y-(sy+t*dy))**2);
    const hover = Math.max(0, 1 - dist / 80);
    g.hoverAmt += (hover - g.hoverAmt) * 0.1;
    ctx.beginPath();
    ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
    ctx.lineWidth = g.thickness * (1 + g.hoverAmt * 2);
    ctx.strokeStyle = g.color;
    ctx.globalAlpha = g.opacity + g.hoverAmt * 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  time += 0.016;
  animId = requestAnimationFrame(draw);
}

const THEMES = [
  { name:'Melos',    a:'#433850', b:'#CBAACB', c:'#6B3F3F' },
  { name:'Midnight', a:'#1A1A2E', b:'#E94560', c:'#0F3460' },
  { name:'Forest',   a:'#1B2A1F', b:'#4CAF7D', c:'#2D5016' },
  { name:'Ember',    a:'#2C1810', b:'#E8824A', c:'#8B3A1E' },
  { name:'Ocean',    a:'#0D1B2A', b:'#5BA4CF', c:'#1A3A5C' },
  { name:'Rose',     a:'#2A1520', b:'#D4789E', c:'#8B2252' },
  { name:'Slate',    a:'#1C1F2E', b:'#8892B0', c:'#2D3561' },
  { name:'Amber',    a:'#1E1800', b:'#F0B429', c:'#6B4C00' },
  { name:'Dusk',     a:'#1A1025', b:'#B388FF', c:'#4A148C' },
  { name:'Sage',     a:'#141E17', b:'#80CBC4', c:'#2E4A3E' },
];

let selectedTheme = THEMES[0], customColor = null;
const grid  = document.getElementById('themes-grid');
const strip = document.getElementById('preview-strip');

function makeGradient(t) {
  return `linear-gradient(135deg,${t.a} 0%,${t.b} 50%,${t.c} 100%)`;
}
function updateStrip() {
  strip.style.background = customColor ? customColor : makeGradient(selectedTheme);
}

THEMES.forEach((t, i) => {
  const sw = document.createElement('div');
  sw.className = 'theme-swatch' + (i === 0 ? ' selected' : '');
  sw.style.background = makeGradient(t);
  sw.title = t.name;
  sw.innerHTML = `<span class="check"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5.5,10.5 12,3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  sw.addEventListener('click', () => {
    document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('selected'));
    sw.classList.add('selected');
    selectedTheme = t; customColor = null; updateStrip();
  });
  grid.appendChild(sw);
});
updateStrip();

const picker  = document.getElementById('color-picker');
const preview = document.getElementById('color-preview');
preview.style.background = picker.value;
picker.addEventListener('input', () => { preview.style.background = picker.value; });
document.getElementById('apply-custom').addEventListener('click', () => {
  customColor = picker.value;
  document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('selected'));
  updateStrip();
});

document.getElementById('create-btn').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('open');
});
document.getElementById('close-btn').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.remove('open');
});
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay'))
    document.getElementById('modal-overlay').classList.remove('open');
});

document.addEventListener('mousemove', e => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
  dot.style.opacity = '1';
});
document.addEventListener('mouseleave', () => {
  mouse.x = -999; mouse.y = -999; dot.style.opacity = '0';
});
window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); });

resize(); draw();
</script>
</body>
</html>
```

---

*Melos — create-room page reference — March 2026*