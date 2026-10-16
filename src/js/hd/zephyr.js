/* 01 ZEPHYR — hypercar (carimg/01_Zephyr.png).
   Liquid-silver body with a black carbon hood spine and a black teardrop canopy that runs back over the engine
   louvres, blade-shaped front fenders with ice-blue LED strips, deep side intakes behind the doors, carbon splitter
   with canards, a full-width swan-neck wing, red LED tail bars over a lattice rear and a finned diffuser. */
import * as THREE from 'three';
import { keys, lerp, smooth, hull, archLiner, frontPlate, M, assemble, dot } from './kit.js';
import { BLACK, floorPan, cockpit, canopy, wing, mirrors, splitter, diffuser, skirt } from './parts.js';

const ACCENT = 0x2f8bff, CHARCOAL = 0x2a2d32, SMOKE = 0x16181b;

export const ZEPHYR = {
  id: 'zephyr', hd: true, fx: 'hyper', name: 'ZEPHYR', stats: [10, 9, 8, 4],
  phys: { power: 1.15, grip: 1.1, loose: .96, vmax: 70, redline: 8600, lsd: .88, torque: [[900, .98], [2500, 1.12], [5000, 1.18], [7200, 1.14], [8600, 1.0]] },
  paint: 0xbfc5cc, accent: ACCENT, led: 0xcfe8ff, tailColor: 0xff1e12, length: 4.86,
  wheels: { r: .365, zF: -1.45, zR: 1.42, rimFrac: .74, spokes: 10, pair: true, twist: .25, nutColor: ACCENT,
    front: { w: .275, tx: .845 }, rear: { w: .33, tx: .855 } },
  lights: { head: [[-.74, .53, -2.38], [.74, .53, -2.38]], tail: [[-.62, .72, 2.43], [.62, .72, 2.43]] },
};

// Body profiles along z (front −2.38 … rear +2.38)
const Z0 = -2.38, Z1 = 2.38;
const Wd = keys([[-2.38, .78], [-2.3, .88], [-2.15, .95], [-1.9, .99], [-1.45, 1.0], [-.95, .96], [-.3, .925], [.3, .945], [.85, 1.01], [1.4, 1.035], [1.95, 1.015], [2.25, .975], [2.38, .945]]);
const Tc = keys([[-2.38, .36], [-2.2, .45], [-1.8, .55], [-1.3, .63], [-.9, .70], [-.5, .80], [.5, .85], [1.1, .86], [1.7, .865], [2.15, .85], [2.38, .81]]);
const Fp = keys([[-2.38, .5], [-2.18, .61], [-1.85, .73], [-1.45, .81], [-1.1, .80], [-.8, .765], [-.3, .745], [.3, .79], [.9, .885], [1.4, .935], [1.95, .92], [2.38, .865]]);
const Bl = keys([[-2.38, .31], [-2.0, .42], [-1.45, .52], [-.5, .55], [.5, .58], [1.4, .62], [2.38, .585]]);
const Yb = keys([[-2.38, .18], [-2.1, .145], [-1.8, .135], [1.9, .14], [2.2, .16], [2.38, .2]]);
export function section(z) {
  const W = Wd(z), T = Tc(z), F = Fp(z), B = Bl(z), Y = Yb(z);
  return [[0, T], [.2 * W, T + .006], [.42 * W, lerp(T, F, .35)], [.62 * W, F - .025], [.76 * W, F], [.91 * W, F - .06], [W, B], [.975 * W, lerp(B, Y, .62)], [.9 * W, Y]];
}
// Canopy: base line on the hull at v = vB(z), height h(z) above it; w = 0 at the base, 1 on the centre-line
const vB = keys([[-.95, .33], [-.3, .37], [.4, .38], [1.2, .3], [1.8, .22], [2.15, .18]]);
const cH = keys([[-.93, 0], [-.62, .14], [-.3, .255], [0, .29], [.35, .275], [.8, .2], [1.2, .125], [1.7, .085], [2.0, .05], [2.16, 0]]);
const CZ0 = -.92, CZ1 = 2.15, WS1 = -.1; // canopy ends; windshield top edge

export function buildZephyr(options = {}) {
  return assemble(ZEPHYR, options, (kit, { hi }) => {
    const A = [{ z: -1.45, y: .37, r: .425 }, { z: 1.42, y: .37, r: .435 }];
    const cockpit = (z, v) => z > -.78 && z < .72 && v < vB(z) - .02;
    const H = hull(kit, section, { z0: Z0, z1: Z1, nz: hi ? 240 : 56, nv: hi ? 72 : 18, arches: A, archMinX: .52, cut: cockpit });
    for (const a of A) archLiner(kit, H, a, { inner: .5, yBottom: .1, n: hi ? 40 : 16 });

    // ---------- floor, cockpit, canopy (black) with glass ----------
    floorPan(kit);
    if (hi) cockpit(kit, H, vB, { accent: ACCENT });
    const { C } = canopy(kit, H, { vB, cH, z0: CZ0, z1: CZ1, ws1: WS1, hi });
    C.ribbon('paint', 0xffffff, [[WS1 + .05, 1], [.5, 1], [1.2, 1], [1.9, 1]], .05, { off: .004, thick: .006, mirror: false, taper: t => 1 - .6 * t });
    // engine-cover louvres
    for (let k = 0; k < (hi ? 12 : 6); k++) { const z = lerp(1.0, 1.95, k / (hi ? 11 : 5)); C.ribbon('gloss', 0x1d2024, [[z, .2], [z - .02, .6], [z - .025, 1]], .028, { off: .006, thick: .012, n: 12 }); }

    // ---------- carbon hood spine, nose beak, vents ----------
    const hood = z => [0, lerp(.1, .265, smooth(-2.34, -.95, z))];
    H.patch('carbon', 0xffffff, -2.34, -.9, hood, { off: .004, nu: hi ? 50 : 16, nv: hi ? 10 : 4 });
    H.ribbon('carbon', 0xffffff, [[-2.3, 0], [-1.6, 0], [-.95, 0]], .03, { off: .005, thick: .012, mirror: false });
    H.ribbon('gloss', BLACK, [[-2.34, .1], [-1.6, .17], [-.92, .265]], .012, { off: .005, thick: .004 });
    H.patch('grille', 0x9aa0a8, -1.38, -1.0, z => [.29, .38 - .02 * smooth(-1.38, -1, z)], { off: .005, nu: 10, nv: 4 });

    // ---------- headlights: black blade housing, ice-blue LED edge, projector pods ----------
    const head = z => { const t = smooth(-2.37, -2.0, z); return [lerp(.44, .58, t), lerp(.72, .64, t)]; };
    H.patch('gloss', SMOKE, -2.37, -2.0, head, { off: .004, nu: 16, nv: 6 });
    H.ribbon('drl', 0xffffff, [[-2.37, .73], [-2.2, .69], [-2.0, .645]], .02, { off: .006, thick: .006, taper: t => 1 - .55 * t });
    H.ribbon('led', 0xffffff, [[-2.365, .45], [-2.18, .52], [-2.01, .575]], .008, { off: .006, thick: .004 });
    for (const [z, v] of [[-2.3, .6], [-2.22, .605], [-2.14, .61]]) { dot(kit, H, 'chrome', 0x9aa3ad, z, v, .024, { off: .007 }); dot(kit, H, 'led', 0xffffff, z, v, .014, { off: .009 }); }
    // fender crease blades running back from the lights
    H.ribbon('paint', 0xffffff, [[-2.0, .62], [-1.62, .6], [-1.2, .61]], .012, { off: .002, thick: .006, taper: t => 1 - t });

    // ---------- front fascia ----------
    const zf = Z0 - .004;
    kit.sym('grille', frontPlate([[.09, .19], [.66, .2], [.7, .3], [.62, .38], [.38, .42], [.12, .36]], zf - .012, .012), 0xffffff);
    kit.add('carbon', frontPlate([[-.15, .4], [.15, .4], [.06, .13], [-.06, .13]], zf - .045, .045, { bevel: .006 }), 0xffffff);
    for (const y of [.31, .25]) kit.add('tail', new THREE.CircleGeometry(.012, 12), 0xffffff, M([0, y, zf - .05], [0, Math.PI, 0]));
    kit.sym('drl', frontPlate([[.69, .2], [.72, .2], [.76, .32], [.73, .33]], zf - .016, .012), 0xffffff);
    // silver Y-blades separating the intakes
    kit.sym('paint', frontPlate([[.4, .19], [.47, .19], [.42, .41], [.33, .4]], zf - .03, .03, { bevel: .006 }), 0xffffff);
    // lower corner intakes wrapping round the nose
    H.patch('grille', 0xffffff, -2.37, -2.15, z => [lerp(.8, .86, smooth(-2.37, -2.15, z)), .98], { off: .003, nu: 10, nv: 6 });
    H.ribbon('drl', 0xffffff, [[-2.36, .78], [-2.25, .8], [-2.13, .86], [-2.08, .97]], .01, { off: .005, thick: .004 });

    // ---------- splitter, fences, canards ----------
    splitter(kit, [[0, -2.53], [.5, -2.51], [.86, -2.42], [.99, -2.27], [1.0, -2.08], [.9, -2.0], [0, -2.06]], {
      fences: [.3, .58].map(x => ({ x, pts: [[-2.5, .1], [-2.2, .1], [-2.22, .2], [-2.4, .2]] })), canards: [{ x: .93, y: .24, z: -2.18, l: .22 }, { x: .93, y: .33, z: -2.18, l: .16 }] });

    // ---------- side ----------
    // shut lines
    for (const pts of [[[-.9, .43], [-.92, .7], [-.9, .95]], [[-.9, .43], [-.3, .42], [.25, .44]], [[.25, .44], [.18, .6]]]) H.ribbon('matte', 0x050505, pts, .005, { off: .0015, n: 20 });
    // charcoal lower door panel sweeping up into the side intake, silver blade along its upper edge
    const dTop = z => lerp(.88, .7, smooth(-.85, .95, z));
    H.patch('gloss', CHARCOAL, -.88, .98, z => [dTop(z), .955], { off: .003, nu: hi ? 40 : 14, nv: 8 });
    H.patch('grille', 0xb0b6bc, .35, 1.0, z => [dTop(z) + .02, lerp(dTop(z) + .03, .9, smooth(.35, .8, z))], { off: .0045, nu: 20, nv: 8 });
    H.ribbon('paint', 0xffffff, [-.88, -.3, .3, .98].map(z => [z, dTop(z) - .005]), .05, { off: .004, thick: .022, taper: t => .6 + .4 * Math.sin(t * Math.PI) });
    H.ribbon('drl', 0xffffff, [[-.6, .93], [.1, .925], [.3, .92]], .008, { off: .005, thick: .004 });
    // vent + blue streak behind the front wheel
    H.patch('grille', 0xffffff, -1.0, -.88, z => [lerp(.6, .64, smooth(-1, -.88, z)), .9], { off: .004, nu: 6, nv: 8 });
    H.ribbon('drl', 0xffffff, [[-1.0, .62], [-.99, .78], [-.96, .9]], .012, { off: .006, thick: .005 });
    // rear haunch intakes
    H.patch('grille', 0xffffff, .7, 1.12, z => [.4, lerp(.47, .52, smooth(.7, 1.12, z))], { off: .004, nu: 10, nv: 4 });
    H.ribbon('gloss', BLACK, [[.68, .4], [.9, .41], [1.14, .4]], .014, { off: .006, thick: .008 });
    // carbon side skirt with LED edge, mirrors on carbon stalks
    skirt(kit, H, { hi });
    mirrors(kit, H, { hi, u: -.58, v: .42, pos: [.98, .97, -.46] });

    // ---------- rear ----------
    const zr = Z1 + .004;
    kit.add('lattice', frontPlate([[-.86, .26], [.86, .26], [.9, .6], [.84, .66], [-.84, .66], [-.9, .6]], zr, .008), 0xffffff);
    for (const s of [1, -1]) {
      const bar = [[.26, .716], [.87, .733], [.9, .758], [.26, .736]].map(([x, y]) => [s * x, y]), drop = [[.855, .58], [.88, .58], [.9, .75], [.875, .74]].map(([x, y]) => [s * x, y]);
      kit.add('gloss', frontPlate([[.22, .7], [.92, .715], [.94, .775], [.22, .755]].map(([x, y]) => [s * x, y]), zr, .012), 0x050506);
      kit.add('tail', frontPlate(s > 0 ? bar : bar.reverse(), zr + .012, .008), 0xffffff);
      kit.add('tail', frontPlate(s > 0 ? drop : drop.reverse(), zr + .012, .008), 0xffffff);
    }
    kit.add('tail', frontPlate([[-.2, .77], [.2, .77], [.2, .785], [-.2, .785]], zr + .01, .006), 0xffffff);
    kit.add('matte', frontPlate([[-.25, .38], [.25, .38], [.25, .5], [-.25, .5]], zr + .008, .01), 0x8c9096);
    // tail-light wrap on the rear corners
    H.ribbon('tail', 0xffffff, [[2.2, .55], [2.3, .6], [2.375, .66]], .016, { off: .004, thick: .005 });
    // diffuser: ramp + fins, twin hex exhausts
    diffuser(kit, { exhausts: [-.1, .1].map(x => ({ x, y: .25, z: 2.44, r: .06 })) });
    // rear deck gills
    for (let k = 0; k < 4; k++) H.ribbon('gloss', BLACK, [[1.75 + k * .1, .44], [1.78 + k * .1, .56]], .03, { off: .004, thick: .006, n: 6 });

    // ---------- swan-neck rear wing ----------
    wing(kit, { hi, plate: [[1.92, 1.06], [2.44, 1.1], [2.47, 1.36], [2.37, 1.38], [2.0, 1.25], [1.9, 1.13]],
      neck: [[1.76, .855], [2.02, .86], [2.24, 1.1], [2.3, 1.24], [2.2, 1.28], [2.12, 1.22], [1.96, .99]] });
  });
}
