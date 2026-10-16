/* 08 NOVA — GT car (carimg/08_Nova.png).
   Steel-blue metallic front-mid-engine grand tourer: a long low hood between muscular front fenders, a set-back
   cabin with a body-coloured roof flowing into a long fastback, a wide single-mouth grille with thin vanes, long
   slim ice-blue headlight blades, a full-width tail light bar, a sculpted crease from the front wheel into a black
   side scoop, blue mirror shells, a black swan-neck wing with body-colour end plates and black multi-spoke wheels. */
import { buildFromTemplate } from './template.js';
import { BLACK } from './parts.js';

const ICE = 0x4aa8ff;

export const NOVA = {
  id: 'nova', hd: true, fx: 'gt', name: 'NOVA', stats: [9, 8, 8, 6],
  phys: { power: 1.05, grip: 1.06, loose: 1.02, vmax: 67, redline: 7800, lsd: .72, torque: [[900, 1.0], [2400, 1.14], [4500, 1.16], [6400, 1.08], [7800, .92]] },
  paint: 0x4a6aa8, accent: ICE, led: 0xdcefff, tailColor: 0xff2a12, length: 4.76,
  wheels: { r: .36, zF: -1.56, zR: 1.4, rimFrac: .76, spokes: 16, pair: true, twist: .18, nutColor: ICE, lipColor: 0x26292e,
    front: { w: .27, tx: .85 }, rear: { w: .325, tx: .87 } },
  lights: { head: [[-.7, .55, -2.42], [.7, .55, -2.42]], tail: [[-.62, .76, 2.3], [.62, .76, 2.3]] },
};

export function buildNova(options = {}) {
  return buildFromTemplate(NOVA, {
    layout: 'front', accent: ICE, roof: 'paint', seatAccent: ICE, trim: 0x1e2533,
    prof: {
      Z0: -2.42, Z1: 2.3, arches: [{ z: -1.56, y: .365, r: .42 }, { z: 1.4, y: .365, r: .43 }],
      Wd: [[-2.42, .76], [-2.3, .87], [-2.05, .95], [-1.56, .995], [-1.0, .96], [-.3, .93], [.4, .945], [.95, 1.01], [1.4, 1.05], [1.9, 1.03], [2.18, .98], [2.3, .94]],
      Tc: [[-2.42, .46], [-2.25, .56], [-1.9, .64], [-1.3, .7], [-.8, .74], [-.45, .77], [.6, .84], [1.4, .86], [1.9, .86], [2.2, .83], [2.3, .79]],
      Fp: [[-2.42, .5], [-2.25, .62], [-1.9, .76], [-1.56, .83], [-1.2, .8], [-.7, .76], [-.1, .755], [.6, .8], [1.0, .88], [1.4, .925], [1.9, .9], [2.3, .83]],
      Bl: [[-2.42, .3], [-2.1, .42], [-1.56, .5], [-.5, .53], [.5, .56], [1.4, .6], [2.3, .56]],
      Yb: [[-2.42, .17], [-2.15, .14], [-1.8, .13], [1.9, .14], [2.15, .16], [2.3, .2]],
      vB: [[-.45, .35], [0, .385], [.7, .39], [1.4, .31], [1.95, .22]],
      cH: [[-.46, 0], [-.16, .16], [.2, .3], [.5, .325], [.9, .29], [1.3, .18], [1.72, .065], [1.98, 0]],
      CZ0: -.46, CZ1: 1.98, WS1: .24, side: [-.04, 1.0], cut: [-.3, 1.0], dz: .45,
      door: [-.42, .66], intake: [.68, 1.0], fenderVent: [-1.02, -.9],
    },
    sec: { crown: .01, mid: .3, dip: .04, peak: .73, shoulder: .9, drop: .085 },
    rearGlass: [1.04, 1.72, .36],
    fascia: 'wide', head: { type: 'slim', len: .5, v: [[.47, .62], [.6, .58]] },
    hood: { key: 'carbon', w: [.06, .16] }, hoodRidge: false, hoodVents: { z: [-1.15, -.75], v: [.28, .38], slats: 5 },
    nose: { key: 'paint', color: 0xffffff }, spine: false,
    fang: { key: 'gloss', color: 0x101114 }, cornerAccent: { key: 'drl', color: 0xffffff },
    splitter: { key: 'carbon', color: 0x5a5a5a, canards: false, fences: false, reach: .08 },
    blade: { key: 'paint', color: 0xffffff }, panel: { key: 'gloss', color: 0x0f1013, top: [.92, .74], z0: .05 },
    ventAccent: false,
    skirt: { key: 'carbon', color: 0x5a5a5a, accent: null },
    mirror: { key: 'paint', color: 0xffffff, light: 'drl' },
    tail: { type: 'full', drop: false }, tailY: .76, ducktail: { key: 'paint', color: 0xffffff, h: .02 },
    wing: { type: 'swan', key: 'matte', color: 0x141517, y: 1.12, z: 1.82, span: .9, plate: { key: 'paint', color: 0xffffff }, light: null },
    diffuser: { key: 'matte', color: 0x141517, seg: 18, tip: 0x6e7076, exhausts: [-.5, -.38, .38, .5].map(x => ({ x, y: .24, z: 2.36, r: .042, seg: 18, color: 0x6e7076 })) },
    extra({ H }) {
      // sculpted crease running from the front wheel into the door, and a black accent under it
      H.ribbon('paint', 0xffffff, [[-1.1, .72], [-.6, .7], [-.1, .69], [.4, .71]], .014, { off: .002, thick: .008, taper: t => 1 - .7 * t });
      H.ribbon('gloss', BLACK, [[-1.12, .9], [-.6, .92], [-.1, .94]], .03, { off: .004, thick: .004, taper: t => 1 - t });
    },
  }, options);
}
