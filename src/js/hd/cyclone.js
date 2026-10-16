/* 05 CYCLONE — drift car (carimg/05_Cyclone.png).
   Low front-engine widebody fastback in electric teal with a black livery: black vented hood between swollen front
   fenders, riveted black bolt-on arch flares, slim LED headlight blades over a wide grille and big canards, black roof,
   jagged black slashes along the doors and haunches, stacked double tail blades, teal mirror shells, a tall black
   pedestal wing with a flap and black deep-dish wheels with teal lips. */
import { buildFromTemplate } from './template.js';
import { BLACK } from './parts.js';

const TEAL = 0x18c6c9;

export const CYCLONE = {
  id: 'cyclone', hd: true, fx: 'drift', name: 'CYCLONE', stats: [8, 8, 9, 6],
  phys: { power: 1.04, grip: 1.0, loose: 1.12, vmax: 63, redline: 7800, lsd: .9, torque: [[900, .95], [2500, 1.12], [4500, 1.14], [6400, 1.04], [7800, .88]] },
  paint: 0x0fa9b0, accent: TEAL, led: 0xf2f8ff, tailColor: 0xff2a12, length: 4.72,
  wheels: { r: .36, zF: -1.48, zR: 1.42, rimFrac: .76, spokes: 12, pair: false, twist: .05, nutColor: TEAL, lipColor: 0x1aa7ad,
    front: { w: .3, tx: .9 }, rear: { w: .36, tx: .93 } },
  lights: { head: [[-.76, .6, -2.36], [.76, .6, -2.36]], tail: [[-.62, .8, 2.36], [.62, .8, 2.36]] },
};

export function buildCyclone(options = {}) {
  return buildFromTemplate(CYCLONE, {
    layout: 'front', accent: TEAL, roof: 'black', seatAccent: TEAL, trim: 0x13262a,
    prof: {
      Z0: -2.36, Z1: 2.34, arches: [{ z: -1.48, y: .365, r: .43 }, { z: 1.42, y: .365, r: .445 }],
      Wd: [[-2.36, .86], [-2.26, .95], [-2.0, 1.02], [-1.48, 1.05], [-1.0, 1.0], [-.4, .96], [.4, .97], [.95, 1.04], [1.42, 1.09], [1.9, 1.07], [2.2, 1.02], [2.34, .98]],
      Tc: [[-2.36, .56], [-2.2, .63], [-1.6, .71], [-.9, .76], [-.5, .8], [.6, .86], [1.4, .88], [1.9, .89], [2.2, .9], [2.34, .87]],
      Fp: [[-2.36, .6], [-2.2, .7], [-1.75, .82], [-1.48, .85], [-1.15, .82], [-.6, .78], [.2, .8], [.9, .88], [1.42, .94], [1.9, .92], [2.34, .89]],
      Bl: [[-2.36, .38], [-2.0, .48], [-1.48, .53], [-.5, .55], [.5, .57], [1.42, .6], [2.34, .58]],
      Yb: [[-2.36, .16], [-2.12, .13], [-1.8, .12], [1.9, .13], [2.2, .15], [2.34, .2]],
      vB: [[-.48, .34], [0, .38], [.7, .39], [1.4, .31], [1.9, .23]],
      cH: [[-.5, 0], [-.2, .16], [.2, .32], [.55, .345], [.95, .3], [1.35, .17], [1.7, .065], [1.92, 0]],
      CZ0: -.5, CZ1: 1.92, WS1: .26, side: [-.08, 1.02],
    },
    sec: { crown: .004, mid: .22, dip: .045, peak: .74, drop: .07 },
    rearGlass: [1.04, 1.7, .32],
    head: { type: 'slim', len: .4, v: [[.5, .63], [.6, .6]] },
    hood: { key: 'gloss', color: 0x101113, w: [.33, .36] }, hoodVents: { z: [-1.7, -1.05], v: [.12, .3], slats: 7 },
    drlKey: 'led', spine: { key: 'gloss', color: BLACK },
    fang: { key: 'paint', color: 0xffffff }, grilleFrame: BLACK, cornerAccent: { key: 'gloss', color: BLACK },
    splitter: { key: 'carbon', color: 0x5a5a5a, lip: { key: 'paint', color: 0xffffff }, canards: 'big', reach: .2, y: .07 },
    blade: { key: 'paint', color: 0xffffff }, panel: { color: 0x0f1012, top: [.84, .7] },
    ventAccent: { key: 'paint', color: 0xffffff },
    overfenders: { key: 'matte', color: 0x111214, out: .07, band: .09 },
    skirt: { key: 'carbon', color: 0x5a5a5a, accent: { key: 'paint', color: 0xffffff }, y: .12 },
    mirror: { key: 'paint', color: 0xffffff, light: null },
    tail: { type: 'quad' },
    wing: { type: 'pedestal', key: 'matte', color: 0x141517, span: 1.0, y: 1.3, z: 1.96, flap: true, chord: .42 },
    diffuser: { key: 'matte', color: 0x141517, seg: 18, tip: 0x5f6266, exhausts: [{ x: .55, y: .24, z: 2.4, r: .07, seg: 18, color: 0x7a6a5a }] },
    extra({ H, hi }) {
      // jagged black livery slashes along the flanks and over the rear haunches
      const slash = (pts, w) => H.ribbon('gloss', BLACK, pts, w, { off: .0045, thick: .002, n: 16, taper: t => .2 + .8 * Math.sin(t * Math.PI) });
      slash([[-2.05, .7], [-1.85, .66], [-1.65, .68]], .06);
      slash([[-.9, .62], [-.6, .58], [-.2, .6], [.2, .56]], .09);
      slash([[-.2, .72], [.2, .7], [.5, .66]], .05);
      slash([[1.15, .5], [1.5, .46], [1.9, .48], [2.2, .52]], .08);
      slash([[1.6, .62], [1.9, .6], [2.25, .64]], .05);
      if (hi) H.ribbon('led', 0xffffff, [[-2.33, .5], [-2.2, .52]], .006, { off: .007, thick: .003, n: 4 });
    },
  }, options);
}
