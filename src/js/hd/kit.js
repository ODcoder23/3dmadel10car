/* HD car kit — shared tools for the hand-shaped cars drawn in carimg/.
   Units are metres, forward is −Z, +X is the car's right. Every part is described for the right side and mirrored.
   A body is a parametric surface: u runs along the car (z), v runs round the half cross-section from the top
   centre-line (v = 0) down to the sill (v = 1). Details (panels, light strips, shut lines, vents) are placed in that
   (u, v) space, so they sit exactly on the paint whatever the body shape is. Parts are merged per material:
   one draw call per material per car. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const V3 = THREE.Vector3, clamp = THREE.MathUtils.clamp;
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/** Smooth 1-D profile through [x, y] keyframes (cubic Hermite, flat beyond the ends). */
export function keys(pts) {
  const n = pts.length;
  return x => {
    if (x <= pts[0][0]) return pts[0][1];
    if (x >= pts[n - 1][0]) return pts[n - 1][1];
    let i = 0; while (x > pts[i + 1][0]) i++;
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n - 1)], h = p2[0] - p1[0], t = (x - p1[0]) / h;
    const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * h, m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
  };
}

/** Centripetal Catmull-Rom through 2-D points, uniform per segment: v = k/(n−1) lands exactly on point k.
    The first point is treated as lying on the mirror plane (x = 0), so the curve meets its mirror image smoothly. */
export function sectionAt(P, v) {
  const n = P.length;
  if (v < 0) { const q = sectionAt(P, -v); return [-q[0], q[1]]; }
  if (v > 1) { const a = sectionAt(P, 1), b = sectionAt(P, 1 - (v - 1)); return [2 * a[0] - b[0], 2 * a[1] - b[1]]; }
  const f = v * (n - 1), i = Math.min(Math.floor(f), n - 2), t = f - i;
  const get = k => k < 0 ? [-P[1][0], P[1][1]] : k >= n ? [2 * P[n - 1][0] - P[n - 2][0], 2 * P[n - 1][1] - P[n - 2][1]] : P[k];
  const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
  const d = (a, b) => Math.max(1e-5, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])));
  const t0 = 0, t1 = d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3), u = t1 + (t2 - t1) * t;
  const L = (a, b, ta, tb) => { const w = (u - ta) / (tb - ta); return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w]; };
  const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3), B1 = L(A1, A2, t0, t2), B2 = L(A2, A3, t1, t3);
  return L(B1, B2, t1, t2);
}

// ---------------------------------------------------------------- procedural textures
const canvas = (w, h) => { if (typeof document === 'undefined') return null; const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function tex(c, { repeat = [1, 1], srgb = true } = {}) {
  if (!c) return null;
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
const cache = {};
export const textures = {
  /** 2×2 twill carbon weave. */
  carbon() { return cache.carbon ??= (() => { const c = canvas(256, 256); if (!c) return null; const g = c.getContext('2d'), s = 32;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const along = ((x + y) >> 1) % 2 === 0, gr = along ? g.createLinearGradient(x * s, 0, x * s + s, 0) : g.createLinearGradient(0, y * s, 0, y * s + s);
      gr.addColorStop(0, '#060607'); gr.addColorStop(.5, along ? '#2c2f35' : '#1c1e22'); gr.addColorStop(1, '#060607'); g.fillStyle = gr; g.fillRect(x * s, y * s, s, s); }
    return tex(c, { repeat: [5, 5] }); })(); },
  /** Hexagonal intake mesh. */
  honeycomb() { return cache.honey ??= (() => { const c = canvas(256, 256); if (!c) return null; const g = c.getContext('2d'); g.fillStyle = '#020203'; g.fillRect(0, 0, 256, 256);
    const r = 16, w = r * Math.sqrt(3); g.lineWidth = 5;
    for (let row = -1; row < 12; row++) for (let col = -1; col < 10; col++) { const cx = col * w + (row % 2 ? w / 2 : 0), cy = row * r * 1.5; g.beginPath();
      for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.strokeStyle = '#34373c'; g.stroke(); }
    return tex(c, { repeat: [12, 12] }); })(); },
  /** Diagonal lattice for the rear fascia. */
  lattice() { return cache.lattice ??= (() => { const c = canvas(128, 128); if (!c) return null; const g = c.getContext('2d'); g.fillStyle = '#030304'; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = '#2b2e33'; g.lineWidth = 7; for (let k = -2; k < 4; k++) { g.beginPath(); g.moveTo(k * 64, 0); g.lineTo(k * 64 + 128, 128); g.stroke(); g.beginPath(); g.moveTo(k * 64 + 128, 0); g.lineTo(k * 64, 128); g.stroke(); }
    return tex(c, { repeat: [9, 9] }); })(); },
  /** Tyre: v runs across the lathe profile, so horizontal bands are circumferential grooves / sidewall rings. */
  tyre() { return cache.tyre ??= (() => { const c = canvas(16, 512); if (!c) return null; const g = c.getContext('2d'); g.fillStyle = '#d4d4d4'; g.fillRect(0, 0, 16, 512);
    for (const y of [.40, .47, .53, .60]) { g.fillStyle = '#2a2a2a'; g.fillRect(0, y * 512 - 4, 16, 8); }
    for (const y of [.12, .16, .84, .88]) { g.fillStyle = '#aaaaaa'; g.fillRect(0, y * 512 - 1, 16, 2); }
    return tex(c); })(); },
  /** Cross-drilled, slotted carbon-ceramic disc face (planar uv over the ring). */
  disc() { return cache.disc ??= (() => { const c = canvas(512, 512); if (!c) return null; const g = c.getContext('2d'), m = 256; g.fillStyle = '#6e7074'; g.fillRect(0, 0, 512, 512);
    const gr = g.createRadialGradient(m, m, 120, m, m, 256); gr.addColorStop(0, '#5a5c60'); gr.addColorStop(.6, '#7d8085'); gr.addColorStop(1, '#55575b'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    for (let k = 0; k < 360; k += 2) { g.strokeStyle = `rgba(255,255,255,${.03 + .03 * Math.sin(k * 7)})`; g.beginPath(); g.arc(m, m, 150 + (k % 90), 0, Math.PI * 2); g.stroke(); }
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; for (const [rr, da] of [[175, 0], [205, .08], [235, .16]]) { g.fillStyle = '#141416'; g.beginPath(); g.arc(m + Math.cos(a + da) * rr, m + Math.sin(a + da) * rr, 7, 0, Math.PI * 2); g.fill(); } }
    g.strokeStyle = '#2a2b2e'; g.lineWidth = 4; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + .13; g.beginPath(); g.arc(m, m, 200, a, a + .22); g.stroke(); }
    return tex(c); })(); },
};

// ---------------------------------------------------------------- materials
/** Base colour white everywhere: the actual colour of each part comes from its vertex colours. */
export function makeMaterials({ paint = 0xbfc4ca, accent = 0x2f7dff, led = 0xbfe4ff, tail = 0xff2216 } = {}) {
  const D = THREE.DoubleSide, carbon = textures.carbon(), honey = textures.honeycomb(), lattice = textures.lattice(), tyre = textures.tyre(), disc = textures.disc();
  return {
    paint: new THREE.MeshPhysicalMaterial({ color: paint, metalness: .72, roughness: .26, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.4, vertexColors: true, side: D }),
    carbon: new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: carbon, metalness: .05, roughness: .4, clearcoat: .7, clearcoatRoughness: .08, envMapIntensity: .45, vertexColors: true, side: D }),
    gloss: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: .1, roughness: .22, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: .7, vertexColors: true, side: D }),
    matte: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0, roughness: .8, envMapIntensity: .5, vertexColors: true, side: D }),
    grille: new THREE.MeshStandardMaterial({ color: 0xffffff, map: honey, metalness: .4, roughness: .55, vertexColors: true, side: D }),
    lattice: new THREE.MeshStandardMaterial({ color: 0xffffff, map: lattice, metalness: .4, roughness: .5, vertexColors: true, side: D }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0a0e13, metalness: .1, roughness: .03, clearcoat: 1, clearcoatRoughness: .02, transparent: true, opacity: .9, envMapIntensity: 1.1, depthWrite: false, side: D }),
    lens: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: .1, roughness: .05, clearcoat: 1, transparent: true, opacity: .35, depthWrite: false, side: D }),
    led: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: led, emissiveIntensity: 2.4, roughness: .3, vertexColors: true, side: D }),
    drl: new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 2.2, roughness: .3, side: D }),
    tail: new THREE.MeshStandardMaterial({ color: 0x3a0000, emissive: tail, emissiveIntensity: 1.2, roughness: .35, side: D }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .16, envMapIntensity: 1.5, vertexColors: true, side: D }),
    interior: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: .05, roughness: .85, vertexColors: true, side: D }),
    tyre: new THREE.MeshStandardMaterial({ color: 0x1a1a1b, map: tyre, bumpMap: tyre, bumpScale: 1.5, metalness: 0, roughness: .88, vertexColors: true }),
    rim: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: .65, roughness: .28, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.3, vertexColors: true, side: D }),
    disc: new THREE.MeshStandardMaterial({ color: 0xffffff, map: disc, metalness: .75, roughness: .45, vertexColors: true, side: D }),
    caliper: new THREE.MeshPhysicalMaterial({ color: accent, metalness: .2, roughness: .3, clearcoat: 1, clearcoatRoughness: .1 }),
  };
}

// ---------------------------------------------------------------- geometry collector
export function createKit() {
  const parts = {};
  /** Adds a geometry to material bucket `key`, coloured `color`, optionally transformed by a Matrix4. */
  function add(key, g, color = 0xffffff, m) {
    g.clearGroups(); for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
    if (!g.index) g.setIndex([...Array(g.getAttribute('position').count).keys()]);
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    const n = g.getAttribute('position').count;
    if (!g.getAttribute('uv')) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
    if (m) g.applyMatrix4(m);
    const c = new THREE.Color(color), a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    (parts[key] ||= []).push(g); return g;
  }
  /** Adds a geometry and its mirror image across x = 0. */
  function sym(key, g, color, m) { if (m) g.applyMatrix4(m); add(key, g, color); add(key, mirror(g), color); }
  function commit(mats, parent) {
    const meshes = {};
    for (const [key, list] of Object.entries(parts)) { if (!list.length) continue; const mesh = new THREE.Mesh(mergeGeometries(list), mats[key]); mesh.name = key; parent.add(mesh); meshes[key] = mesh; }
    return meshes;
  }
  const count = () => Object.values(parts).flat().reduce((n, g) => n + g.index.count / 3, 0);
  return { add, sym, commit, parts, count };
}
export function mirror(g) {
  const m = g.clone(); m.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
  if (!m.index) m.setIndex([...Array(m.getAttribute('position').count).keys()]);
  const ix = m.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
  return m;
}
export const M = (p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => new THREE.Matrix4().compose(new V3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new V3(...s));

/** Indexed grid geometry from a point function f(i, j) → [x, y, z] and optional uv function. `keep(i, j)` drops cells. */
export function gridGeo(nu, nv, f, { uv, keep } = {}) {
  const pos = [], uvs = [], idx = [];
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { pos.push(...f(i, j)); uvs.push(...(uv ? uv(i, j) : [i / nu, j / nv])); }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { if (keep && !keep(i, j)) continue; const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, b, b + 1, a, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

// ---------------------------------------------------------------- parametric surfaces
/** A surface f(u, v) → [x, y, z] for the right side. `centerY` orients normals outward (away from the car's axis). */
export class Surf {
  constructor(kit, f, { centerY = .45 } = {}) { this.kit = kit; this.f = f; this.centerY = centerY; }
  p(u, v) { return new V3(...this.f(u, v)); }
  frame(u, v) {
    const e = 1e-3, p = this.p(u, v), du = this.p(u + e, v).sub(this.p(u - e, v)), dv = this.p(u, v + e).sub(this.p(u, v - e)), n = new V3().crossVectors(du, dv);
    if (n.lengthSq() < 1e-14) n.set(0, 1, 0); n.normalize();
    if (n.dot(new V3(p.x, p.y - this.centerY, 0)) < 0) n.negate();
    return { p, n, du, dv };
  }
  at(u, v, off = 0) { const { p, n } = this.frame(u, v); return p.addScaledVector(n, off); }
  /** Patch over u ∈ [u0, u1] with v ∈ range(u) = [va, vb], lifted `off` along the normal. Mirrored unless `mirror: false`. */
  patch(key, color, u0, u1, range, { off = .003, nu = 24, nv = 10, mirror: mir = true, uvScale = 1, keep } = {}) {
    if (this.kit.low) { nu = Math.max(4, Math.ceil(nu / 3)); nv = Math.max(2, Math.ceil(nv / 3)); } // far-away AI cars
    const g = gridGeo(nu, nv, (i, j) => { const u = lerp(u0, u1, i / nu), [va, vb] = range(u); return this.at(u, lerp(va, vb, j / nv), off).toArray(); },
      { uv: (i, j) => { const u = lerp(u0, u1, i / nu), [va, vb] = range(u); return [u * uvScale, lerp(va, vb, j / nv) * uvScale * 1.6]; }, keep });
    this.kit.add(key, g, color); if (mir) this.kit.add(key, mirror(g), color); return g;
  }
  /** Ribbon following a polyline of [u, v] points across the surface. `thick` > 0 makes it a raised blade. */
  ribbon(key, color, pts, width, { off = .002, thick = 0, n = 40, mirror: mir = true, taper } = {}) {
    const path = resample(pts, this.kit.low ? Math.min(n, 10) : n), pos = [], idx = [], uvs = [];
    path.forEach(([u, v], i) => {
      const { p, n: nn } = this.frame(u, v), a = path[Math.max(i - 1, 0)], b = path[Math.min(i + 1, path.length - 1)];
      const t = this.p(b[0], b[1]).sub(this.p(a[0], a[1])).normalize(), bn = new V3().crossVectors(nn, t).normalize(), w = width * (taper ? taper(i / (path.length - 1)) : 1) / 2;
      const base = p.clone().addScaledVector(nn, off), L = base.clone().addScaledVector(bn, -w), R = base.clone().addScaledVector(bn, w);
      if (thick > 0) pos.push(...L.toArray(), ...R.toArray(), ...R.clone().addScaledVector(nn, thick).toArray(), ...L.clone().addScaledVector(nn, thick).toArray());
      else pos.push(...L.toArray(), ...R.toArray());
      const k = thick > 0 ? 4 : 2; for (let q = 0; q < k; q++) uvs.push(i / (path.length - 1), q / (k - 1));
    });
    const k = thick > 0 ? 4 : 2;
    for (let i = 0; i < path.length - 1; i++) for (let q = 0; q < (k === 4 ? 4 : 1); q++) { const a = i * k + q, b = i * k + (q + 1) % k, c = a + k, d = b + k; idx.push(a, c, d, a, d, b); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    this.kit.add(key, g, color); if (mir) this.kit.add(key, mirror(g), color); return g;
  }
}
/** Smoothly resamples a polyline of 2-D points to `n` points (Catmull-Rom, passes through every point). */
export function resample(pts, n) {
  if (pts.length < 2) return pts;
  const curve = new THREE.CatmullRomCurve3(pts.map(([a, b]) => new V3(a, b, 0)), false, 'centripetal');
  return curve.getSpacedPoints(n - 1).map(p => [p.x, p.y]);
}

/** Lofted body hull: `section(z)` gives the half cross-section control points from the top centre-line to the sill.
    Wheel arches are cut out of the side: vertices inside an arch snap onto its edge, cells fully inside are dropped. */
export function hull(kit, section, { z0, z1, nz = 220, nv = 64, arches = [], archMinX = .5, cut, key = 'paint', color = 0xffffff, cap = 'matte', capColor = 0x0a0b0c } = {}) {
  const f = (z, v) => { const [x, y] = sectionAt(section(z), v); return [x, y, z]; };
  const S = new Surf(kit, f);
  const zAt = i => lerp(z0, z1, .5 - .5 * Math.cos(Math.PI * i / nz)), inside = [];
  const snap = (x, y, z) => {
    for (const a of arches) {
      if (x < archMinX) continue;
      const dz = z - a.z, dy = y - a.y;
      if (dy >= 0 && Math.hypot(dz, dy) < a.r) { const k = a.r / Math.hypot(dz, dy); return [x, a.y + dy * k, a.z + dz * k, true]; }
      if (dy < 0 && Math.abs(dz) < a.r) return [x, y, a.z + Math.sign(dz || 1) * a.r, true];
    }
    return [x, y, z, false];
  };
  const g = gridGeo(nz, nv, (i, j) => { const z = zAt(i), p = f(z, j / nv), s = snap(...p); inside[i * (nv + 1) + j] = s[3]; return s.slice(0, 3); },
    { uv: (i, j) => [zAt(i), j / nv], keep: (i, j) => { const a = i * (nv + 1) + j, b = a + nv + 1; if (cut && cut(lerp(zAt(i), zAt(i + 1), .5), (j + .5) / nv)) return false; return !(inside[a] && inside[b] && inside[a + 1] && inside[b + 1]); } });
  kit.add(key, g, color); kit.add(key, mirror(g), color);
  // end caps (flat, dark: the fascias are built on top of them)
  for (const z of [z0, z1]) {
    const half = Array.from({ length: 41 }, (_, j) => sectionAt(section(z), j / 40)), outline = [...half.map(([x, y]) => [x, y]), ...half.slice().reverse().map(([x, y]) => [-x, y])];
    const tris = THREE.ShapeUtils.triangulateShape(outline.map(([x, y]) => new THREE.Vector2(x, y)), []), pos = [];
    for (const t of tris) for (const k of t) pos.push(outline[k][0], outline[k][1], z);
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const uv = []; for (let k = 0; k < pos.length; k += 3) uv.push(pos[k] * 3, pos[k + 1] * 3); cg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); cg.computeVertexNormals();
    kit.add(cap, cg, capColor);
  }
  /** Outer x of the hull at height y on section z (the widest crossing). */
  S.xAt = (z, y) => { const P = section(z); let best = 0; let prev = sectionAt(P, 0);
    for (let j = 1; j <= 80; j++) { const q = sectionAt(P, j / 80); if ((prev[1] - y) * (q[1] - y) <= 0 && prev[1] !== q[1]) best = Math.max(best, lerp(prev[0], q[0], (y - prev[1]) / (q[1] - prev[1]))); prev = q; }
    return best; };
  S.section = section;
  return S;
}

/** Inner wheel-arch liner + a thin lip around the opening. */
export function archLiner(kit, S, a, { inner = .42, yBottom = .12, lip = .018, lipKey = 'gloss', lipColor = 0x0c0d0f, n = 40 } = {}) {
  // boundary: up the front edge, over the top, down the rear edge
  const B = [];
  const down = Math.max(0, a.y - yBottom);
  for (let k = 0; k <= 4; k++) B.push([a.z - a.r, yBottom + down * k / 4]);
  for (let k = 1; k < n; k++) { const t = Math.PI - k / n * Math.PI; B.push([a.z + Math.cos(t) * a.r, a.y + Math.sin(t) * a.r]); }
  for (let k = 0; k <= 4; k++) B.push([a.z + a.r, a.y - down * k / 4]);
  const outer = B.map(([z, y]) => Math.max(inner + .05, S.xAt(z, y)));
  const g = gridGeo(B.length - 1, 1, (i, j) => { const [z, y] = B[i], dz = z - a.z, dy = Math.max(0, y - a.y), d = Math.hypot(dz, dy) || 1, grow = .012;
    return [j ? outer[i] - .004 : inner, a.y + dy + (dy / d) * grow * (y > a.y ? 1 : 0), z + (dz / d) * grow]; });
  kit.add('matte', g, 0x0b0b0c); kit.add('matte', mirror(g), 0x0b0b0c);
  if (lip) {
    const L = gridGeo(B.length - 1, 2, (i, j) => { const [z, y] = B[i], dz = z - a.z, dy = Math.max(0, y - a.y), d = Math.hypot(dz, dy) || 1, ux = dz / d, uy = (y > a.y ? dy / d : 0);
      const x = outer[i] + [0, .012, .004][j], r = [-.004, .004, lip][j]; return [x, y + uy * r, z + ux * r]; });
    kit.add(lipKey, L, lipColor); kit.add(lipKey, mirror(L), lipColor);
  }
}

/** Sweeps a 2-D profile [[out, up], …] along a path t → [x, y, z] (right side). out = horizontal normal to the path, up ≈ +Y. */
export function sweep(kit, key, color, path, profile, { n = 40, closed = true, mirror: mir = true, scale } = {}) {
  const pos = [], idx = [], uvs = [], m = profile.length, up = new V3(0, 1, 0);
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = new V3(...path(t)), tan = new V3(...path(Math.min(1, t + 1e-3))).sub(new V3(...path(Math.max(0, t - 1e-3)))).normalize();
    let out = new V3().crossVectors(up, tan); if (out.lengthSq() < 1e-8) out.set(1, 0, 0); out.normalize(); const u2 = new V3().crossVectors(tan, out).normalize(), s = scale ? scale(t) : 1;
    profile.forEach(([o, u], k) => { pos.push(...p.clone().addScaledVector(out, o * s).addScaledVector(u2, u * s).toArray()); uvs.push(t * 4, k / (m - 1)); });
  }
  const segs = closed ? m : m - 1;
  for (let i = 0; i < n; i++) for (let k = 0; k < segs; k++) { const a = i * m + k, b = i * m + (k + 1) % m, c = a + m, d = b + m; idx.push(a, c, d, a, d, b); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
  kit.add(key, g, color); if (mir) kit.add(key, mirror(g), color); return g;
}

/** Extrudes a 2-D outline [[a, b], …] by `depth` (along +Z of the shape), with an optional bevel, then transforms it. */
export function slab(pts, depth, { bevel = 0, curve = 4 } = {}) {
  const shape = new THREE.Shape(pts.map(([a, b]) => new THREE.Vector2(a, b)));
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: bevel > 0 ? 2 : 0, curveSegments: curve });
  return g;
}
/** Shape in the car's side plane (z, y) extruded across x from x0 by `depth`. */
export function sidePlate(pts, x0, depth, opt) { const g = slab(pts, depth, opt); g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, x0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1)); return g; }
/** Shape in the plan plane (x, z) extruded upward in y from y0 by `depth`. */
export function planPlate(pts, y0, depth, opt) { const g = slab(pts, depth, opt); g.applyMatrix4(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, y0, 0, 1, 0, 0, 0, 0, 0, 1)); return g; }
/** Shape in the front plane (x, y) extruded along z from z0 by `depth`. */
export function frontPlate(pts, z0, depth, opt) { const g = slab(pts, depth, opt); g.translate(0, 0, z0); return g; }

/** Airfoil section (chord along +a, thickness along b), leading edge at a = 0. */
export function airfoil(chord, thick, n = 16, camber = .04) {
  const top = [], bot = [];
  for (let k = 0; k <= n; k++) { const x = (1 - Math.cos(k / n * Math.PI)) / 2, t = 5 * thick * (.2969 * Math.sqrt(x) - .126 * x - .3516 * x * x + .2843 * x ** 3 - .1036 * x ** 4), c = camber * 4 * x * (1 - x);
    top.push([x * chord, (c + t) * chord]); bot.push([x * chord, (c - t) * chord]); }
  return [...top, ...bot.reverse().slice(1, -1)];
}

// ---------------------------------------------------------------- wheels
/** Wheel with tyre, rim (spokes from `spoke(kit, s, R)`), lip, centre-lock and a brake disc; returns one merged mesh per material. */
export function buildWheel(mats, s, { r = .36, w = .3, rimFrac = .74, spokes = 10, spokeColor = 0x121316, lipColor = 0x8d949b, nutColor = 0x2f7dff, twist = .22, pair = true, knobby = false, hi = true }) {
  const kit = createKit(), seg = hi ? 48 : 24, hw = w / 2, rimR = r * rimFrac;
  // tyre: rounded shoulders, slight sidewall bulge
  const prof = [[rimR + .004, -hw + .01], [rimR + .03, -hw - .004], [r - .05, -hw - .012], [r - .018, -hw + .004], [r - .004, -hw + .03], [r, -hw + .06], [r, hw - .06], [r - .004, hw - .03], [r - .018, hw - .004], [r - .05, hw + .012], [rimR + .03, hw + .004], [rimR + .004, hw - .01]];
  kit.add('tyre', new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), seg), 0xffffff, M([0, 0, 0], [0, 0, -Math.PI / 2]));
  // all-terrain tread: staggered blocks over the crown and shoulders
  if (knobby) for (let k = 0; k < (hi ? 36 : 20); k++) { const a = k / (hi ? 36 : 20) * Math.PI * 2;
    for (const [x, wd] of k % 2 ? [[-hw * .45, hw * .7], [hw * .55, hw * .55]] : [[-hw * .55, hw * .55], [hw * .45, hw * .7]]) kit.add('tyre', new THREE.BoxGeometry(wd, .028, .055), 0x9a9a9a, M([x, Math.cos(a) * (r + .006), Math.sin(a) * (r + .006)], [a, 0, 0])); }
  // barrel + outer lip (machined)
  kit.add('rim', new THREE.CylinderGeometry(rimR, rimR, w - .02, seg, 1, true), 0x1b1d20, M([0, 0, 0], [0, 0, Math.PI / 2]));
  const face = s * (hw - .012);
  kit.add('chrome', new THREE.TorusGeometry(rimR - .006, .012, hi ? 8 : 3, seg), lipColor, M([face, 0, 0], [0, Math.PI / 2, 0]));
  kit.add('rim', new THREE.CylinderGeometry(rimR - .004, rimR - .03, .03, seg, 1, true), 0x16181b, M([face - s * .02, 0, 0], [0, 0, s * Math.PI / 2]));
  // spokes: tapered, concave towards the hub, twisted
  const count = pair ? spokes / 2 : spokes;
  for (let k = 0; k < count; k++) for (const d of pair ? [-.075, .075] : [0]) {
    const a0 = k / count * Math.PI * 2 + d, g = slab([[0, -.022], [rimR * .78, -.012], [rimR * .78, .012], [0, .022]], .028, { bevel: hi ? .004 : 0, curve: 2 });
    const p = g.getAttribute('position');
    for (let i = 0; i < p.count; i++) { const rr = p.getX(i) + rimR * .17, tw = twist * (rr / rimR) * (pair ? Math.sign(d) : 1), y = p.getY(i), depth = p.getZ(i);
      const a = a0 + tw * .3, along = rr, cross = y;
      const yy = Math.cos(a) * along - Math.sin(a) * cross, zz = Math.sin(a) * along + Math.cos(a) * cross, conc = .055 * (1 - (rr / rimR) ** 2);
      p.setXYZ(i, face - s * (depth + .006 + conc), yy, zz); }
    g.computeVertexNormals(); kit.add('rim', g, spokeColor);
  }
  // hub, centre lock nut, cap
  kit.add('rim', new THREE.CylinderGeometry(rimR * .2, rimR * .24, .06, seg / 2), spokeColor, M([face - s * .05, 0, 0], [0, 0, Math.PI / 2]));
  kit.add('chrome', new THREE.CylinderGeometry(.045, .045, .05, 6), 0x9aa1a8, M([face - s * .01, 0, 0], [0, 0, Math.PI / 2]));
  kit.add('rim', new THREE.CylinderGeometry(.03, .036, .02, 16), nutColor, M([face + s * .016, 0, 0], [0, 0, Math.PI / 2]));
  // brake disc (both faces + edge) and bell — only on the detailed car; behind the spokes of a far AI car it is invisible
  if (hi) {
  const discR = rimR - .06, hole = discR * .5;
  for (const sd of [-1, 1]) { const ring = new THREE.RingGeometry(hole, discR, seg, 1); const uv = ring.getAttribute('uv'), pp = ring.getAttribute('position');
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pp.getX(i) / discR / 2 + .5, pp.getY(i) / discR / 2 + .5);
    kit.add('disc', ring, 0xffffff, M([s * (hw - .16) + sd * .016, 0, 0], [0, sd * Math.PI / 2, 0])); }
  kit.add('disc', new THREE.CylinderGeometry(discR, discR, .032, seg, 1, true), 0x5a5c60, M([s * (hw - .16), 0, 0], [0, 0, Math.PI / 2]));
  kit.add('chrome', new THREE.CylinderGeometry(hole + .01, hole + .01, .07, seg, 1, false), 0x7d838a, M([s * (hw - .13), 0, 0], [0, 0, Math.PI / 2]));
  }
  const group = new THREE.Group(); kit.commit(mats, group); group.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return group;
}
/** Monoblock caliper hugging the disc, placed on the non-rotating pivot. */
export function buildCaliper(mats, s, { r = .36, w = .3, rimFrac = .74, front = true }) {
  const rimR = r * rimFrac, discR = rimR - .06, hw = w / 2, a0 = front ? Math.PI * .62 : Math.PI * .38;
  const pts = []; for (let k = 0; k <= 10; k++) { const a = a0 - .42 + k / 10 * .84; pts.push([Math.cos(a) * (discR + .022), Math.sin(a) * (discR + .022)]); }
  for (let k = 10; k >= 0; k--) { const a = a0 - .38 + k / 10 * .76; pts.push([Math.cos(a) * (discR - .085), Math.sin(a) * (discR - .085)]); }
  const g = slab(pts.map(([z, y]) => [z, y]), .07, { bevel: .01 }); g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, s * (hw - .2), 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1));
  const mesh = new THREE.Mesh(g, mats.caliper); mesh.castShadow = true; return mesh;
}

// ---------------------------------------------------------------- assembly
/** Builds the car object the game expects (same contract as createCar in cars.js). `shape(kit, ctx)` adds the body parts. */
export function assemble(spec, options, shape) {
  const hi = options.detail !== 'low', kit = Object.assign(createKit(), { low: !hi }), mats = makeMaterials({ paint: options.color ?? spec.paint, accent: spec.accent, led: spec.led, tail: spec.tailColor });
  const group = new THREE.Group(), body = new THREE.Group(); group.name = spec.name; body.name = 'Sprung body'; group.add(body);
  const shell = new THREE.Group(); shell.position.y = spec.lift || 0; body.add(shell); // raised bodies (rally) keep the body-frame origin at the axles
  const extra = shape(kit, { hi, mats, body: shell, spec }) || {};
  const meshes = kit.commit(mats, shell);
  for (const k of ['paint', 'carbon', 'gloss', 'matte']) if (meshes[k]) { meshes[k].castShadow = true; meshes[k].receiveShadow = true; }
  for (const k of ['glass', 'lens']) if (meshes[k]) meshes[k].renderOrder = 2;
  const W = spec.wheels, wheels = [], frontPivots = [];
  for (const s of [-1, 1]) for (const front of [true, false]) {
    const cfg = { ...W, ...(front ? W.front : W.rear), hi }, pivot = new THREE.Group(); pivot.position.set(s * cfg.tx, W.r + .004, front ? W.zF : W.zR); group.add(pivot);
    if (front) frontPivots.push(pivot);
    const wheel = new THREE.Group(); pivot.add(wheel); wheels.push(wheel); wheel.add(buildWheel(mats, s, cfg)); if (hi) pivot.add(buildCaliper(mats, s, { ...cfg, front }));
  }
  let tris = kit.count(); group.traverse(o => { if (o.isMesh && !Object.values(meshes).includes(o)) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.getAttribute('position').count) / 3; });
  group.userData = { model: spec.id, name: spec.name, wheelRadius: W.r, wheelbase: W.zR - W.zF, bodyLength: spec.length, triangles: Math.round(tris) };
  const base = { metalness: mats.paint.metalness, roughness: mats.paint.roughness };
  return { group, bodyGroup: body, wheels, frontPivots, brakeMaterials: [mats.tail], headlights: [meshes.led].filter(Boolean), materials: mats, wheelRadius: W.r, spec, lights: { head: spec.lights.head.map(([x, y, z]) => [x, y + (spec.lift || 0), z]), tail: spec.lights.tail.map(([x, y, z]) => [x, y + (spec.lift || 0), z]) }, ...extra,
    setPaint(hex) { mats.paint.color.set(hex); },
    setFinish(kind) {
      const p = mats.paint; if (!['gloss', 'metallic', 'matte', 'pearl'].includes(kind)) kind = 'gloss';
      p.metalness = kind === 'matte' ? .08 : kind === 'metallic' ? .85 : base.metalness;
      p.roughness = kind === 'matte' ? .78 : kind === 'metallic' ? .18 : kind === 'pearl' ? .22 : base.roughness;
      p.clearcoat = kind === 'matte' ? 0 : 1; p.clearcoatRoughness = kind === 'metallic' ? .03 : .04;
      p.iridescence = kind === 'pearl' ? .3 : 0; p.iridescenceIOR = 1.3; p.iridescenceThicknessRange = [180, 320]; p.needsUpdate = true;
    },
    dispose() { group.traverse(o => o.geometry?.dispose?.()); for (const m of Object.values(mats)) m.dispose(); } };
}

/** A small disc lying on surface S at (u, v), facing outward (lens, bolt head, light pod). */
export function dot(kit, S, key, color, u, v, r, { off = .004, seg = 18, mirror: mir = true } = {}) {
  const { p, n } = S.frame(u, v), g = new THREE.CircleGeometry(r, seg); g.applyMatrix4(new THREE.Matrix4().compose(p.addScaledVector(n, off), new THREE.Quaternion().setFromUnitVectors(new V3(0, 0, 1), n), new V3(1, 1, 1)));
  kit.add(key, g, color); if (mir) kit.add(key, mirror(g), color);
}
