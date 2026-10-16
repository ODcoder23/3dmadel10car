/* Reusable assemblies for the HD cars: cockpit, canopy, wing, mirrors, splitter, diffuser, skirts.
   Every function takes the kit (and the hull surface H where the part sits on the body) plus a config,
   so each car file only states what is particular to its design. */
import * as THREE from 'three';
import { lerp, smooth, sectionAt, Surf, gridGeo, mirror, sweep, sidePlate, planPlate, frontPlate, airfoil, M } from './kit.js';

export const BLACK = 0x0b0c0e;

/** Flat black under-tray between the wheels. */
export function floorPan(kit, { len = 4.3, x = .76, strips = [[-2.0, -1.9], [-1.0, .95], [1.9, 2.2]] } = {}) {
  kit.add('matte', new THREE.BoxGeometry(1.3, .02, len), 0x0a0a0b, M([0, .125, 0]));
  for (const [z0, z1] of strips) kit.sym('matte', new THREE.BoxGeometry(.24, .02, z1 - z0), 0x0a0a0b, M([x, .13, (z0 + z1) / 2]));
}

/** Tub, seats, dashboard, wheel and roll hoop inside the canopy (z0 … z1 is the opening cut in the hull). */
export function cockpit(kit, H, vB, { z0 = -.8, z1 = .74, accent = 0x2f8bff, trim = 0x2a2c30, shell = 0x9aa0a8, shellKey = 'carbon', dz = 0, hoop = true } = {}) {
  kit.add('interior', new THREE.BoxGeometry(1.2, .02, z1 - z0), 0x1b1c1f, M([0, .42, (z0 + z1) / 2]));
  const tub = gridGeo(30, 4, (i, j) => { const z = lerp(z0, z1, i / 30), p = H.p(z, vB(z) - .02); return [p.x - .01, lerp(.41, p.y, j / 4), z]; });
  kit.add('interior', tub, 0x1d1e21); kit.add('interior', mirror(tub), 0x1d1e21);
  kit.add('interior', new THREE.BoxGeometry(1.3, .28, .02), 0x141517, M([0, .55, z0 + .01]));
  kit.add('interior', new THREE.BoxGeometry(1.3, .45, .02), 0x141517, M([0, .63, z1 - .01]));
  const seat = [[.28, .44], [-.18, .44], [-.22, .52], [.12, .55], [.2, .62], [.34, .94], [.42, .97], [.46, .92], [.38, .55]].map(([z, y]) => [z + dz, y]);
  kit.sym(shellKey, sidePlate(seat, .16, .4, { bevel: .02 }), shell);
  kit.sym('interior', sidePlate(seat.map(([z, y]) => [z - .03, y + .015]), .2, .32, { bevel: .01 }), trim);
  kit.sym('interior', sidePlate([[.3, .78], [.4, .94], [.38, .95], [.28, .8]].map(([z, y]) => [z + dz, y]), .32, .04), accent);
  kit.add('interior', sidePlate([[-.62, .62], [-.3, .62], [-.26, .76], [-.36, .82], [-.6, .8]].map(([z, y]) => [z + dz, y]), -.62, 1.24, { bevel: .02 }), 0x18191c);
  kit.add('carbon', sidePlate([[-.6, .42], [.1, .42], [.1, .55], [-.45, .72], [-.6, .7]].map(([z, y]) => [z + dz, y]), -.08, .16, { bevel: .01 }), 0x8e949b);
  kit.add('interior', sidePlate([[-.4, .81], [-.3, .81], [-.29, .87], [-.38, .87]].map(([z, y]) => [z + dz, y]), -.48, .26), 0x0f1012);
  kit.add('led', new THREE.PlaneGeometry(.22, .06), 0x4aa8ff, M([-.35, .855, -.3 + dz], [-.35, 0, 0]));
  kit.add('interior', new THREE.TorusGeometry(.16, .02, 10, 32), 0x141517, M([-.35, .76, -.18 + dz], [-.25, 0, 0]));
  kit.add('interior', new THREE.BoxGeometry(.3, .04, .03), 0x141517, M([-.35, .76, -.18 + dz], [-.25, 0, 0]));
  kit.add('drl', new THREE.BoxGeometry(.02, .025, .025), 0xffffff, M([-.35, .915, -.22 + dz], [-.25, 0, 0]));
  if (hoop) kit.add('gloss', new THREE.TorusGeometry(.4, .03, 8, 24, Math.PI), BLACK, M([0, .58, z1 - .1]));
}

/** Canopy sitting on the hull at v = vB(z), height cH(z). Near-vertical side glass rolling into the roof;
    where it is low it melts back into the hull. Returns the surface and the glass outlines. */
export function canopy(kit, H, { vB, cH, z0, z1, ws1, hi, roofKey = 'gloss', roofColor = BLACK, frameColor = 0x050506, side = [-.53, .5], sideTopMax = .5, sideTaper = .28, rearGlass = null }) {
  const C = new Surf(kit, (z, w) => {
    const h = cH(z), vb = vB(z), B = H.p(z, vb), q = H.p(z, vb * (1 - w)), by = B.y;
    const r = sectionAt([[0, by + h + .012], [.5 * B.x, by + h - .006], [.86 * B.x, by + .84 * h], [.97 * B.x, by + .4 * h], [B.x, by]], 1 - w), k = smooth(0, .09, h);
    return [lerp(q.x, r[0], k), lerp(q.y, r[1], k) + .006, z];
  }, { centerY: .6 });
  const wsMin = z => lerp(.12, .6, smooth(z0 + .02, ws1, z));
  const sTop = z => Math.min(sideTopMax, wsMin(z) - .07) - sideTaper * smooth(side[1] - .4, side[1], z);
  // the side-glass hole uses the lowest glass edge so its stepped cell boundary always stays under the glass
  const sHole = Math.min(...Array.from({ length: 21 }, (_, k) => sTop(lerp(side[0] + .05, side[1] - .05, k / 20))));
  const inWs = (z, w) => z < ws1 - .05 && w > wsMin(z) + .05, inSide = (z, w) => z > side[0] + .05 && z < side[1] - .05 && w > .13 && w < sHole - .03;
  const inRear = (z, w) => rearGlass && z > rearGlass[0] + .03 && z < rearGlass[1] - .03 && w > rearGlass[2] + .03;
  const nu = hi ? 110 : 26, nv = hi ? 32 : 8;
  const g = gridGeo(nu, nv, (i, j) => C.p(lerp(z0, z1, i / nu), j / nv).toArray(),
    { keep: (i, j) => { const z = lerp(z0, z1, (i + .5) / nu), w = (j + .5) / nv; return !(hi && (inWs(z, w) || inSide(z, w) || inRear(z, w))); } });
  kit.add(roofKey, g, roofColor); kit.add(roofKey, mirror(g), roofColor);
  C.patch('glass', 0xffffff, z0 + .02, ws1, z => [wsMin(z) - .015, 1], { off: .004, nu: hi ? 30 : 10, nv: hi ? 16 : 6 });
  C.patch('glass', 0xffffff, side[0], side[1], z => [.08, Math.max(.1, sTop(z))], { off: .004, nu: hi ? 30 : 10, nv: 8 });
  if (rearGlass) C.patch('glass', 0xffffff, rearGlass[0], rearGlass[1], () => [rearGlass[2], 1], { off: .004, nu: 16, nv: 8 });
  const pillar = [0, .25, .5, .75, 1].map(t => { const z = lerp(z0 + .02, ws1, t); return [z, wsMin(z) - .01]; });
  C.ribbon('gloss', frameColor, [...pillar, [ws1 + .01, .8], [ws1 + .015, 1]], .02, { off: .007, thick: .004 });
  C.ribbon('gloss', frameColor, [0, .25, .5, .75, 1].map(t => { const z = lerp(side[0], side[1], t); return [z, Math.max(.1, sTop(z)) + .01]; }), .016, { off: .007, thick: .003 });
  return { C, wsMin, sTop };
}

/** Swan-neck rear wing: main plane + flap, end plates, two necks rising from the deck. */
export function wing(kit, { span = .95, chord = .38, y = 1.17, z = 1.98, aoa = -.16, flap = { chord: .14, y: 1.27, z: 2.33, aoa: -.55 }, plate, neck, neckX = .34,
  key = 'carbon', color = 0x8a8a8a, neckKey = 'gloss', neckColor = BLACK, light = 'drl', hi = true }) {
  kit.add(key, sidePlate(airfoil(chord, .11, hi ? 18 : 8, -.05), -span, span * 2, { curve: 2 }), color, M([0, y, z], [aoa, 0, 0]));
  if (flap) kit.add(key, sidePlate(airfoil(flap.chord, .1, 8, -.04), -span + .02, span * 2 - .04), color, M([0, flap.y, flap.z], [flap.aoa, 0, 0]));
  if (light) kit.add(light, new THREE.BoxGeometry(span * 1.7, .008, .008), 0xffffff, M([0, y - .065, z + .02], [aoa, 0, 0]));
  if (plate) kit.sym(key, sidePlate(plate, span, .014, { bevel: .003 }), color);
  if (neck) kit.sym(neckKey, sidePlate(neck, neckX, .026, { bevel: .004 }), neckColor);
}

/** Door mirror: stalk from the body point (u, v) out to a teardrop housing at `pos`. */
export function mirrors(kit, H, { u = -.6, v = .44, pos = [1.1, .975, -.5], hi = true, stalkKey = 'carbon', stalkColor = 0xffffff, bodyKey = 'paint', bodyColor = 0xffffff, light = 'drl' } = {}) {
  const b = H.p(u, v);
  sweep(kit, stalkKey, stalkColor, t => [lerp(b.x - .02, pos[0] - .05, t), lerp(b.y, pos[1] - .025, t) + .04 * Math.sin(t * Math.PI), lerp(u, pos[2], t)], [[-.012, -.01], [.012, -.01], [.012, .01], [-.012, .01]], { n: 12 });
  kit.sym(bodyKey, new THREE.SphereGeometry(1, hi ? 24 : 12, hi ? 16 : 8), bodyColor, M(pos, [0, -.12, 0], [.07, .055, .13]));
  kit.sym('chrome', new THREE.CircleGeometry(1, 20), 0x9fb0c0, M([pos[0], pos[1], pos[2] + .07], [0, -.12, 0], [.06, .045, 1]));
  if (light) kit.sym(light, new THREE.BoxGeometry(.006, .006, .12), 0xffffff, M([pos[0] + .065, pos[1] - .01, pos[2] - .02], [0, -.12, 0]));
}

/** Front splitter from a half plan outline [[x, z], …] (centre-line points at x = 0), with fences and canards. */
export function splitter(kit, half, { y = .085, thick = .024, key = 'carbon', color = 0xffffff, fences = [], canards = [], lip } = {}) {
  const full = [...half, ...half.slice(1, -1).reverse().map(([x, z]) => [-x, z])];
  kit.add(key, planPlate(full, y, thick, { bevel: .004 }), color);
  if (lip) { const edge = half.slice(0, -1); sweep(kit, lip.key, lip.color, t => { const f = t * (edge.length - 1), i = Math.min(Math.floor(f), edge.length - 2), k = f - i; return [lerp(edge[i][0], edge[i + 1][0], k), y + thick + .002, lerp(edge[i][1], edge[i + 1][1], k) + .004]; }, [[0, 0], [.006, 0], [.006, .006], [0, .006]], { n: 30 }); }
  for (const f of fences) kit.sym(key, sidePlate(f.pts, f.x, .012), color);
  for (const c of canards) kit.sym(key, new THREE.BoxGeometry(.012, c.l, c.d ?? .16), color, M([c.x, c.y, c.z], [0, 0, c.a ?? 1.25]));
}

/** Diffuser ramp with vertical fins and exhaust tips. */
export function diffuser(kit, { z0 = 1.75, z1 = 2.5, y0 = .13, y1 = .32, w = .82, fins = [.16, .4, .64], key = 'carbon', color = 0xffffff, exhausts = [] } = {}) {
  kit.add(key, gridGeo(1, 1, (i, j) => [lerp(-w, w, j), lerp(y0, y1, i), lerp(z0, z1, i)], { uv: (i, j) => [i * 3, j * 6] }), color);
  for (const x of fins) kit.sym(key, sidePlate([[z0 + .05, y0], [z1, y1], [z1 + .02, y0]], x - .006, .012), color);
  for (const e of exhausts) {
    kit.add('chrome', new THREE.CylinderGeometry(e.r, e.r * .92, .16, e.seg ?? 6, 1, true), e.color ?? 0x8d8378, M([e.x, e.y, e.z], [Math.PI / 2, 0, 0]));
    kit.add('matte', new THREE.CircleGeometry(e.r * .84, e.seg ?? 6), 0x050505, M([e.x, e.y, e.z + .03]));
  }
}

/** Side skirt blade swept along the sill, with an optional thin light/accent strip on its top edge. */
export function skirt(kit, H, { z0 = -.98, z1 = .96, y = .135, key = 'carbon', color = 0xffffff, accent = { key: 'drl', color: 0xffffff }, hi = true } = {}) {
  const sx = z => H.p(z, 1).x;
  sweep(kit, key, color, t => { const z = lerp(z0, z1, t); return [sx(z) + .005, y, z]; }, [[-.04, 0], [.07, -.015], [.085, .01], [.0, .07]], { n: hi ? 30 : 10 });
  if (accent) sweep(kit, accent.key, accent.color, t => { const z = lerp(z0 + .08, z1 - .06, t); return [sx(z) + .06, y - .003, z]; }, [[0, 0], [.012, 0], [.012, .006], [0, .006]], { n: 10 });
}

/** Bolt-on wheel-arch flare: a band hugging the arch (a = {z, y, r}) that follows the body surface and stands proud of
    it by `out` at its outer edge, with rivets. */
export function overfender(kit, H, a, { key = 'matte', color = 0x111214, out = .06, band = .07, gap = .01, rivets = { key: 'chrome', color: 0x8a9097 }, hi = true } = {}) {
  const R = a.r + gap, n = hi ? 36 : 12, t0 = -.3, t1 = Math.PI + .3;
  const pt = (t, u, o) => { const th = lerp(t0, t1, t), r = R + u, z = a.z - Math.cos(th) * r, y = a.y + Math.sin(th) * r; return [Math.max(.55, H.xAt(z, Math.max(y, .18))) + o, y, z]; };
  // section (radial u, lateral o): inner edge on the arch, outer edge flush with the body, crest standing out by `out`
  const prof = [[0, -.01], [0, out * .75], [band * .35, out], [band * .8, out * .7], [band, .004], [band, -.01], [0, -.01]];
  const g = gridGeo(n, prof.length - 1, (i, j) => pt(i / n, prof[j][0], prof[j][1]));
  kit.add(key, g, color); kit.add(key, mirror(g), color);
  if (rivets && hi) for (let k = 1; k < 8; k++) kit.sym(rivets.key, new THREE.CylinderGeometry(.008, .008, .012, 8), rivets.color, M(pt(k / 8, band * .45, out * .92), [0, 0, Math.PI / 2]));
}

/** Shark fin along the car's centre-line: rises from the roof at z0 to `top` at z1 (side outline follows roofY). */
export function fin(kit, roofY, { z0 = .3, z1 = 2.0, top = 1.2, key = 'gloss', color = BLACK, t = .014, light } = {}) {
  const pts = [];
  for (let k = 0; k <= 12; k++) { const z = lerp(z0, z1, k / 12); pts.push([z, roofY(z) - .01]); }
  pts.push([z1, top], [lerp(z0, z1, .55), roofY(lerp(z0, z1, .55)) + (top - roofY(z1)) * .25]);
  kit.add(key, sidePlate(pts, -t / 2, t, { bevel: .002 }), color);
  if (light) kit.add(light.key, sidePlate([[z1 - .2, top - .05], [z1, top - .015], [z1, top - .035], [z1 - .2, top - .06]], -t / 2 - .002, t + .004), light.color);
}

/** Roof air scoop (snorkel) sitting on the centre-line from z0 to z1, its open mouth facing forward. */
export function roofScoop(kit, roofY, { z0 = -.15, z1 = .55, w = .3, h = .13, key = 'gloss', color = BLACK, trim } = {}) {
  const pts = [[z0, roofY(z0) - .02], [z0, roofY(z0) + h], [z0 + .12, roofY(z0 + .12) + h * .95], [z1, roofY(z1) + .01], [z1, roofY(z1) - .02]];
  kit.add(key, sidePlate(pts, -w / 2, w, { bevel: .01 }), color);
  kit.add('matte', frontPlate([[-w / 2 + .03, roofY(z0) + .02], [w / 2 - .03, roofY(z0) + .02], [w / 2 - .03, roofY(z0) + h - .025], [-w / 2 + .03, roofY(z0) + h - .025]], z0 - .012, .01), 0x020203);
  if (trim) kit.add(trim.key, frontPlate([[-w / 2 - .005, roofY(z0) + h - .005], [w / 2 + .005, roofY(z0) + h - .005], [w / 2 + .005, roofY(z0) + h + .012], [-w / 2 - .005, roofY(z0) + h + .012]], z0 - .02, .014), trim.color);
}
