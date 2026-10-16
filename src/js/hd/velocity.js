/* 10 VELOCITY — rally car (carimg/10_Velocity.png).
   Raised rally crossover in signal yellow with black livery: high ground clearance, a tall upright greenhouse with a
   long flat roof ending in a near-vertical hatch, a short black hood with twin yellow stripes, black roof carrying a
   bar of five spot lamps and rack rails, round twin headlamps, a tubular bull bar and skid plate, wide riveted black
   flares over all-terrain tyres on bronze wheels, black lower cladding, a roof spoiler and mud flaps. */
import * as THREE from 'three';
import { buildFromTemplate } from './template.js';
import { BLACK } from './parts.js';
import { M, sweep } from './kit.js';

const YELLOW = 0xf2b70f, BRONZE = 0xa4752a;

export const VELOCITY = {
  id: 'velocity', hd: true, fx: 'rally', name: 'VELOCITY', stats: [7, 8, 8, 8], lift: .2,
  phys: { power: 1.06, grip: 1.02, loose: 1.22, vmax: 62, redline: 7600, lsd: .7, torque: [[900, 1.0], [2500, 1.16], [4300, 1.18], [6200, 1.05], [7600, .88]] },
  paint: 0xf0b40e, accent: YELLOW, led: 0xf4f8ff, tailColor: 0xff2410, length: 4.6,
  wheels: { r: .43, zF: -1.42, zR: 1.38, rimFrac: .6, spokes: 10, pair: false, twist: .1, knobby: true, nutColor: BRONZE, lipColor: BRONZE, spokeColor: 0x7c5a22,
    front: { w: .32, tx: .9 }, rear: { w: .32, tx: .9 } },
  lights: { head: [[-.72, .6, -2.3], [.72, .6, -2.3]], tail: [[-.62, .86, 2.26], [.62, .86, 2.26]] },
};

export function buildVelocity(options = {}) {
  return buildFromTemplate(VELOCITY, {
    layout: 'front', accent: BLACK, roof: 'black', seatAccent: YELLOW, trim: 0x2a2416,
    prof: {
      Z0: -2.3, Z1: 2.26, arches: [{ z: -1.42, y: .23, r: .5 }, { z: 1.38, y: .23, r: .5 }],
      Wd: [[-2.3, .84], [-2.18, .93], [-1.95, .99], [-1.42, 1.01], [-.9, .98], [0, .965], [.9, .985], [1.38, 1.01], [1.9, .99], [2.15, .96], [2.26, .93]],
      Tc: [[-2.3, .6], [-2.15, .68], [-1.7, .74], [-1.1, .78], [-.7, .8], [.5, .84], [1.5, .86], [2.0, .86], [2.26, .84]],
      Fp: [[-2.3, .64], [-2.15, .73], [-1.7, .79], [-1.42, .8], [-.9, .8], [0, .8], [.9, .82], [1.38, .84], [1.9, .84], [2.26, .82]],
      Bl: [[-2.3, .4], [-2.0, .46], [-1.4, .48], [0, .49], [1.4, .5], [2.26, .48]],
      Yb: [[-2.3, .14], [-2.0, .09], [-1.8, .08], [1.9, .09], [2.15, .11], [2.26, .16]],
      vB: [[-.75, .3], [0, .32], [1.4, .32], [2.15, .3]],
      cH: [[-.74, 0], [-.48, .22], [-.15, .44], [.25, .5], [1.2, .51], [1.75, .49], [2.02, .4], [2.14, .2], [2.2, 0]],
      CZ0: -.74, CZ1: 2.2, WS1: .02, side: [-.36, 1.78], cut: [-.62, 1.3], dz: .2,
      door: [-.66, .72], intake: [.8, 1.0], fenderVent: null,
    },
    sec: { crown: .006, mid: .3, dip: .015, peak: .8, shoulder: .95, drop: .04 },
    sideTop: .62, rearGlass: [1.84, 2.14, .32],
    head: { type: 'round', len: .32, v: [[.48, .7], [.56, .64]] },
    hood: { key: 'gloss', color: 0x111214, w: [.34, .34] }, spine: { key: 'gloss', color: BLACK }, hoodVents: { z: [-1.6, -1.15], v: [.24, .34], slats: 4 },
    grilleFrame: BLACK, fang: { key: 'gloss', color: 0x111214 }, cornerAccent: { key: 'gloss', color: BLACK },
    archLip: { key: 'matte', color: 0x101112, size: .02 },
    overfenders: { key: 'matte', color: 0x121314, out: .08, band: .12, gap: .005 },
    splitter: { key: 'matte', color: 0x26282b, canards: false, fences: false, y: .03, reach: .06 },
    blade: false, panel: { key: 'matte', color: 0x141516, top: [.82, .82] }, sideIntake: 'none', handle: true,
    skirt: { key: 'matte', color: 0x18191b, accent: { key: 'paint', color: 0xffffff }, y: .1 },
    mirror: { key: 'gloss', color: BLACK, light: null, rise: .1 },
    tail: { type: 'bars' }, tailY: .86, ducktail: false,
    wing: { type: 'blade', key: 'gloss', color: BLACK, span: .86, y: 1.4, z: 1.98, chord: .32, neckColor: BLACK },
    diffuser: { key: 'matte', color: 0x18191b, seg: 18, tip: 0x5f6266, y1: .3, exhausts: [{ x: -.5, y: .2, z: 2.3, r: .06, seg: 18, color: 0x5f6266 }, { x: -.36, y: .2, z: 2.3, r: .06, seg: 18, color: 0x5f6266 }] },
    extra({ H, C, kit, hi, roofY }) {
      // black livery slashes
      const slash = (pts, w) => H.ribbon('gloss', BLACK, pts, w, { off: .0045, thick: .002, n: 16, taper: t => .2 + .8 * Math.sin(t * Math.PI) });
      slash([[-.4, .62], [0, .58], [.45, .6]], .09); slash([[.05, .72], [.4, .68], [.7, .64]], .05); slash([[1.2, .52], [1.6, .48], [2.05, .52]], .08);
      // yellow stripes on the black hood
      for (const v of [.06, .16]) H.ribbon('paint', 0xffffff, [[-2.25, v], [-1.6, v + .01], [-.74, v + .02]], .035, { off: .006, thick: .002 });
      // roof light bar: rail, five lamps with lit faces, two mounting legs
      const rz = -.32, y = roofY(rz) + .1;
      kit.add('matte', new THREE.BoxGeometry(1.1, .03, .06), 0x0e0f10, M([0, y - .05, rz]));
      for (const x of [-.5, .5]) kit.add('matte', new THREE.BoxGeometry(.03, .1, .05), 0x0e0f10, M([x, y - .09, rz + .02]));
      for (let k = 0; k < 5; k++) { const x = (k - 2) * .21;
        kit.add('matte', new THREE.CylinderGeometry(.075, .07, .09, hi ? 24 : 12), 0x121314, M([x, y, rz], [Math.PI / 2, 0, 0]));
        kit.add('chrome', new THREE.TorusGeometry(.072, .008, 6, hi ? 24 : 12), 0x9aa1a8, M([x, y, rz - .046]));
        kit.add('led', new THREE.CircleGeometry(.064, hi ? 24 : 12), 0xffffff, M([x, y, rz - .047], [0, Math.PI, 0])); }
      // roof rack rails
      for (const s of [-1, 1]) sweep(kit, 'matte', 0x0e0f10, t => { const z = -.05 + t * 1.75, p = C.p(z, .7); return [s * p.x, p.y + .05, z]; }, [[-.014, -.014], [.014, -.014], [.014, .014], [-.014, .014]], { n: 16, mirror: false });
      // tubular bull bar and skid plate
      const bar = t => { const a = (t - .5) * Math.PI * .75; return [Math.sin(a) * .62, .5 + .06 * Math.cos(a), -2.4 + .1 * (1 - Math.cos(a))]; };
      sweep(kit, 'matte', 0x141516, bar, Array.from({ length: 8 }, (_, k) => [Math.cos(k / 8 * Math.PI * 2) * .025, Math.sin(k / 8 * Math.PI * 2) * .025]), { n: 24, mirror: false });
      for (const x of [-.35, .35]) kit.add('matte', new THREE.CylinderGeometry(.022, .022, .34, 10), 0x141516, M([x, .36, -2.38]));
      kit.add('chrome', new THREE.BoxGeometry(1.0, .02, .45), 0x6c7075, M([0, .04, -2.18], [.35, 0, 0]));
      // tow hook and mud flaps
      kit.add('drl', new THREE.TorusGeometry(.03, .008, 6, 12), 0xffffff, M([.42, .2, -2.39]));
      for (const s of [-1, 1]) kit.add('matte', new THREE.BoxGeometry(.3, .24, .012), 0x0e0f10, M([s * .86, .02, 1.92]));
    },
  }, options);
}
