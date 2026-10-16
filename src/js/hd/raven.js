/* 03 RAVEN — race car (carimg/03_Raven.png).
   Long, low, graphite-black endurance racer slashed with violet: a long nose and longer tail, very wide rear
   haunches, a roof air scoop above the driver, louvres on the front fenders, big dive planes, violet roof-edge
   stripes, a lightning flash through the door and swooshes along the engine cover, violet skirts, mirror shells and
   wing end plates, violet-white blade LEDs, twin stacked tail blades and a tall swan-neck wing with a flap. */
import { buildFromTemplate } from './template.js';
import { BLACK, roofScoop } from './parts.js';
import { lerp, smooth } from './kit.js';

const VIOLET = 0x7b2fe0, GLOW = 0xa45cff;

export const RAVEN = {
  id: 'raven', hd: true, fx: 'race', name: 'RAVEN', stats: [9, 8, 10, 4],
  phys: { power: 1.06, grip: 1.14, loose: 1.04, vmax: 66, redline: 8800, lsd: .86, torque: [[900, .82], [3000, 1.0], [5500, 1.12], [7600, 1.13], [8800, .98]] },
  paint: 0x2a2c31, accent: GLOW, led: 0xeee6ff, tailColor: 0xff3a10, length: 5.0,
  wheels: { r: .36, zF: -1.5, zR: 1.46, rimFrac: .74, spokes: 10, pair: true, twist: .28, nutColor: VIOLET, lipColor: 0x6a3ab8,
    front: { w: .28, tx: .86 }, rear: { w: .36, tx: .92 } },
  lights: { head: [[-.74, .48, -2.48], [.74, .48, -2.48]], tail: [[-.64, .7, 2.52], [.64, .7, 2.52]] },
};

export function buildRaven(options = {}) {
  return buildFromTemplate(RAVEN, {
    layout: 'mid', accent: GLOW, roof: 'paint', seatAccent: VIOLET, trim: 0x221a30,
    prof: {
      Z0: -2.48, Z1: 2.52, arches: [{ z: -1.5, y: .365, r: .42 }, { z: 1.46, y: .365, r: .45 }],
      Wd: [[-2.48, .76], [-2.36, .87], [-2.15, .95], [-1.8, .99], [-1.5, 1.0], [-1.0, .955], [-.4, .92], [.3, .95], [.9, 1.06], [1.46, 1.11], [2.0, 1.09], [2.35, 1.04], [2.52, 1.0]],
      Tc: [[-2.48, .32], [-2.3, .39], [-1.9, .48], [-1.4, .57], [-1.0, .65], [-.6, .76], [.4, .82], [1.2, .83], [1.9, .83], [2.3, .81], [2.52, .76]],
      Fp: [[-2.48, .46], [-2.28, .58], [-1.9, .72], [-1.5, .8], [-1.15, .79], [-.8, .75], [-.3, .74], [.3, .79], [.9, .9], [1.46, .95], [2.0, .93], [2.52, .84]],
      Bl: [[-2.48, .28], [-2.1, .4], [-1.5, .5], [-.5, .53], [.5, .57], [1.46, .62], [2.52, .56]],
      Yb: [[-2.48, .15], [-2.2, .12], [-1.9, .11], [2.0, .12], [2.35, .14], [2.52, .19]],
      vB: [[-.98, .32], [-.3, .36], [.4, .37], [1.2, .29], [1.8, .21], [2.2, .16]],
      cH: [[-.96, 0], [-.66, .14], [-.34, .25], [-.02, .29], [.4, .28], [.85, .2], [1.3, .12], [1.8, .07], [2.1, .035], [2.24, 0]],
      CZ0: -.96, CZ1: 2.24, WS1: -.14, side: [-.56, .5], cut: [-.82, .72],
      door: [-.94, .26], intake: [.34, 1.02], fenderVent: [-1.06, -.94], haunch: [.74, 1.16],
    },
    sec: { crown: .006, mid: .3, dip: .03, peak: .76, shoulder: .93, drop: .06 },
    head: { type: 'blade', len: .34, v: [[.44, .73], [.58, .655]] },
    hood: { key: 'carbon', w: [.11, .25] }, hoodEnd: -.96, hoodVents: { z: [-1.6, -1.12], v: [.08, .19], slats: 5 },
    fang: { key: 'gloss', color: VIOLET }, cornerAccent: { key: 'gloss', color: VIOLET }, archLip: { key: 'gloss', color: VIOLET, size: .014 },
    splitter: { key: 'carbon', color: 0x6a6a6a, lip: { key: 'gloss', color: VIOLET }, canards: 'big', reach: .16 },
    blade: { key: 'paint', color: 0xffffff }, panel: { color: 0x0d0e10, top: [.84, .66] },
    flash: { key: 'gloss', color: VIOLET, pts: [[-.76, .86], [-.48, .8], [-.32, .73], [-.14, .7], [.04, .64]], w: .03 },
    ventAccent: { key: 'drl', color: 0xffffff },
    skirt: { key: 'carbon', color: 0x6a6a6a, accent: { key: 'gloss', color: VIOLET } },
    mirror: { key: 'gloss', color: VIOLET, light: 'drl' },
    louvres: 10, spine: { key: 'gloss', color: 0x1a1c20 },
    tail: { type: 'quad', centerKey: 'drl' }, tailY: .7,
    wing: { type: 'swan', key: 'matte', color: 0x151619, y: 1.32, z: 2.1, span: 1.02, chord: .4, plate: { key: 'gloss', color: VIOLET }, light: 'drl' },
    diffuser: { key: 'matte', color: 0x141517, seg: 18, tip: 0x7d6f8c, y1: .36, fins: [.14, .34, .54, .74] },
    extra({ C, H, kit, hi, vB, roofY }) {
      // violet stripes along the roof edges and swooshes down the engine-cover flanks
      C.ribbon('gloss', VIOLET, [[-.1, .62], [.2, .6], [.6, .55], [1.0, .5], [1.5, .48], [2.0, .5]], .035, { off: .006, thick: .003, taper: t => 1 - .7 * t });
      const sw = z => .11 * Math.sin(Math.PI * smooth(.3, 2.4, z)) ** .7;
      H.patch('gloss', VIOLET, .3, 2.4, z => [vB(z) + .025, vB(z) + .025 + sw(z)], { off: .004, nu: hi ? 40 : 14, nv: 4 });
      H.ribbon('gloss', VIOLET, [[-.98, .985], [0, .985], [1.0, .985]], .02, { off: .004, thick: .003 });
      // roof air scoop above the driver
      roofScoop(kit, roofY, { z0: -.12, z1: .6, w: .28, h: .12, key: 'gloss', color: 0x1c1d21, trim: { key: 'gloss', color: VIOLET } });
      // louvres cut into the tops of the front fenders
      for (let k = 0; k < 6; k++) { const z = lerp(-1.85, -1.3, k / 5); H.ribbon('gloss', BLACK, [[z, .42], [z + .03, .56]], .032, { off: .004, thick: .007, n: 6 }); }
    },
  }, options);
}
