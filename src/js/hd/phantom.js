/* 07 PHANTOM — track car (carimg/07_Phantom.png).
   Stealth-black, prototype-style track car cut with acid-lime graphics: a very low nose slung between tall pontoon
   front fenders, a narrow bubble canopy, a shark fin running from the roof to a tall double-plane wing on swan necks,
   long rear overhang, big canards, lime chevron, roof stripe, slashes and skirts, crossing lime tail slashes,
   lime-lipped black wheels and lime calipers. */
import { buildFromTemplate } from './template.js';
import { BLACK } from './parts.js';

const LIME = 0x9fe01a;

export const PHANTOM = {
  id: 'phantom', hd: true, fx: 'track', name: 'PHANTOM', stats: [9, 9, 10, 3],
  phys: { power: 1.09, grip: 1.16, loose: 1.0, vmax: 67, redline: 9000, lsd: .9, torque: [[900, .82], [3000, 1.02], [5800, 1.15], [8000, 1.14], [9000, 1.0]] },
  paint: 0x1b1d20, accent: LIME, led: 0xf2ffe8, tailColor: 0xff3010, length: 4.96,
  wheels: { r: .36, zF: -1.46, zR: 1.42, rimFrac: .74, spokes: 10, pair: true, twist: .3, nutColor: LIME, lipColor: LIME,
    front: { w: .28, tx: .86 }, rear: { w: .34, tx: .87 } },
  lights: { head: [[-.76, .56, -2.4], [.76, .56, -2.4]], tail: [[-.6, .7, 2.56], [.6, .7, 2.56]] },
};

export function buildPhantom(options = {}) {
  return buildFromTemplate(PHANTOM, {
    layout: 'mid', accent: LIME, roof: 'black', seatAccent: LIME, trim: 0x1c2414,
    prof: {
      Z0: -2.4, Z1: 2.56, arches: [{ z: -1.46, y: .365, r: .42 }, { z: 1.42, y: .365, r: .43 }],
      Wd: [[-2.4, .82], [-2.3, .93], [-2.1, 1.0], [-1.8, 1.03], [-1.46, 1.04], [-1.0, .96], [-.4, .9], [.3, .92], [.9, 1.0], [1.42, 1.04], [2.0, 1.02], [2.4, .97], [2.56, .93]],
      Tc: [[-2.4, .28], [-2.2, .33], [-1.8, .38], [-1.4, .43], [-1.0, .52], [-.7, .64], [.3, .76], [1.1, .79], [1.8, .79], [2.3, .76], [2.56, .7]],
      Fp: [[-2.4, .56], [-2.2, .72], [-1.85, .86], [-1.46, .9], [-1.1, .86], [-.8, .76], [-.3, .72], [.3, .76], [.9, .86], [1.42, .92], [2.0, .9], [2.56, .8]],
      Bl: [[-2.4, .34], [-2.1, .46], [-1.46, .55], [-.5, .53], [.5, .56], [1.42, .6], [2.56, .55]],
      Yb: [[-2.4, .15], [-2.15, .12], [-1.8, .11], [1.9, .12], [2.4, .14], [2.56, .19]],
      vB: [[-.9, .27], [-.3, .3], [.4, .31], [1.2, .26], [1.8, .2], [2.15, .16]],
      cH: [[-.88, 0], [-.6, .16], [-.3, .29], [0, .33], [.4, .31], [.8, .23], [1.2, .14], [1.7, .08], [2.0, .04], [2.16, 0]],
      CZ0: -.88, CZ1: 2.16, WS1: -.1, side: [-.5, .5], cut: [-.74, .72],
      haunch: [.72, 1.12],
    },
    sec: { crown: .004, mid: .1, dip: .09, peak: .72, shoulder: .9, drop: .07 },
    head: { type: 'blade', len: .3, v: [[.48, .7], [.58, .66]] },
    hood: { key: 'carbon', w: [.08, .2] }, spine: { key: 'gloss', color: LIME }, roofStripe: { key: 'gloss', color: LIME },
    hoodVents: { z: [-1.75, -1.2], v: [.06, .16], slats: 5 },
    fang: { key: 'gloss', color: LIME }, cornerAccent: { key: 'gloss', color: LIME }, archLip: { key: 'gloss', color: LIME, size: .012 },
    splitter: { key: 'carbon', color: 0x5a5a5a, lip: { key: 'gloss', color: LIME }, canards: 'big', reach: .22, y: .07 },
    blade: { key: 'gloss', color: LIME }, panel: { color: 0x0c0d0f, top: [.86, .66] },
    flash: { key: 'gloss', color: LIME, pts: [[-.8, .84], [-.5, .76], [-.25, .72], [0, .66], [.25, .62]], w: .04 },
    ventAccent: { key: 'gloss', color: LIME },
    skirt: { key: 'carbon', color: 0x5a5a5a, accent: { key: 'gloss', color: LIME } },
    mirror: { key: 'gloss', color: LIME, light: null },
    fin: { z0: .2, key: 'carbon', color: 0x3a3a3a, light: { key: 'gloss', color: LIME } },
    louvres: 8, tail: { type: 'x' }, tailY: .7,
    wing: { type: 'double', key: 'matte', color: 0x141517, y: 1.26, z: 2.06, span: .98, plate: { key: 'gloss', color: LIME }, light: 'drl' },
    diffuser: { key: 'carbon', color: 0x5a5a5a, seg: 6, tip: 0x6b6f63, y1: .36, fins: [.12, .3, .48, .66] },
    extra({ H }) {
      // lime chevron over the hood and slashes over the front fenders and rear haunches
      H.ribbon('gloss', LIME, [[-2.35, .03], [-1.95, .1], [-1.5, .17], [-1.05, .24]], .04, { off: .006, thick: .003, taper: t => .4 + .6 * t });
      H.ribbon('gloss', LIME, [[-2.05, .5], [-1.8, .55], [-1.55, .6]], .05, { off: .004, thick: .003, taper: t => Math.sin(t * Math.PI) });
      H.ribbon('gloss', LIME, [[.7, .5], [1.1, .47], [1.6, .45], [2.1, .47]], .06, { off: .004, thick: .003, taper: t => Math.sin(t * Math.PI) });
      H.ribbon('gloss', LIME, [[.45, .7], [.8, .64], [1.0, .6]], .03, { off: .006, thick: .003 });
      // louvres on top of the pontoon fenders
      for (let k = 0; k < 5; k++) { const z = -1.72 + k * .1; H.ribbon('gloss', BLACK, [[z, .44], [z + .02, .56]], .035, { off: .004, thick: .006, n: 6 }); }
    },
  }, options);
}
