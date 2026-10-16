/* 02 VOLTEX — sport car (carimg/02_Voltex.png).
   Compact candy-red mid-engine sports coupe: short overhangs and wheelbase, a higher, rounder nose and a taller
   cabin with a body-coloured roof and rear glass, a wide black carbon stripe from the windshield over the nose down
   to the splitter, slim white headlight blades, black lower doors into deep side intakes, black engine cover with
   a centre spine, a full-width tail light bar over a ducktail, a low black wing and red-lipped five-spoke wheels. */
import { buildFromTemplate } from './template.js';
import { BLACK } from './parts.js';

const RED = 0xff3b1f;

export const VOLTEX = {
  id: 'voltex', hd: true, fx: 'super', name: 'VOLTEX', stats: [9, 9, 9, 5],
  phys: { power: 1.08, grip: 1.1, loose: 1.0, vmax: 67, redline: 8400, lsd: .8, torque: [[900, .9], [2600, 1.08], [5000, 1.14], [7000, 1.1], [8400, .94]] },
  paint: 0xb3140f, accent: RED, led: 0xf2f7ff, tailColor: 0xff2410, length: 4.44,
  wheels: { r: .35, zF: -1.34, zR: 1.32, rimFrac: .74, spokes: 10, pair: true, twist: .12, nutColor: RED, lipColor: 0xb3231a,
    front: { w: .27, tx: .84 }, rear: { w: .325, tx: .85 } },
  lights: { head: [[-.7, .56, -2.2], [.7, .56, -2.2]], tail: [[-.6, .76, 2.24], [.6, .76, 2.24]] },
};

export function buildVoltex(options = {}) {
  return buildFromTemplate(VOLTEX, {
    layout: 'mid', accent: RED, roof: 'paint', seatAccent: RED, trim: 0x3a1512,
    prof: {
      Z0: -2.2, Z1: 2.24, arches: [{ z: -1.34, y: .355, r: .41 }, { z: 1.32, y: .355, r: .42 }],
      Wd: [[-2.2, .8], [-2.1, .9], [-1.95, .96], [-1.6, .99], [-1.34, 1.0], [-.9, .97], [-.4, .945], [.3, .96], [.8, 1.0], [1.32, 1.03], [1.8, 1.01], [2.1, .97], [2.24, .94]],
      Tc: [[-2.2, .42], [-2.05, .51], [-1.7, .6], [-1.2, .67], [-.85, .73], [-.5, .82], [.5, .88], [1.1, .9], [1.7, .9], [2.05, .89], [2.24, .86]],
      Fp: [[-2.2, .54], [-2.0, .65], [-1.7, .76], [-1.34, .81], [-1.0, .8], [-.7, .78], [-.2, .77], [.3, .8], [.85, .89], [1.32, .935], [1.8, .92], [2.24, .87]],
      Bl: [[-2.2, .32], [-1.9, .43], [-1.34, .52], [-.5, .56], [.5, .59], [1.32, .62], [2.24, .59]],
      Yb: [[-2.2, .17], [-1.95, .14], [-1.7, .13], [1.8, .14], [2.1, .16], [2.24, .2]],
      vB: [[-.88, .35], [-.3, .385], [.4, .395], [1.1, .32], [1.7, .24], [2.0, .19]],
      cH: [[-.86, 0], [-.58, .17], [-.28, .31], [.05, .355], [.45, .345], [.85, .27], [1.2, .17], [1.6, .09], [1.9, .04], [2.02, 0]],
      CZ0: -.86, CZ1: 2.02, WS1: -.06, side: [-.46, .55], cut: [-.72, .7],
      door: [-.84, .22], intake: [.28, .9], fenderVent: [-.9, -.8], haunch: [.62, 1.0],
    },
    sec: { crown: .01, mid: .4, dip: .02, peak: .76, shoulder: .9, drop: .075 },
    rearGlass: [.22, .98, .42],
    head: { type: 'slim', len: .36, v: [[.46, .7], [.6, .64]] },
    hood: { key: 'carbon', w: [.13, .24] }, hoodEnd: -.86, hoodVents: { z: [-1.85, -1.5], v: [.28, .37], slats: 4 },
    fang: { key: 'gloss', color: RED }, nose: { key: 'carbon' }, cornerAccent: { key: 'gloss', color: RED },
    splitter: { key: 'carbon', color: 0x6a6a6a, lip: { key: 'gloss', color: RED }, reach: .1 },
    blade: { key: 'paint', color: 0xffffff }, panel: { color: 0x101114, top: [.88, .66] },
    ventAccent: { key: 'gloss', color: RED },
    skirt: { key: 'carbon', color: 0x6a6a6a, accent: { key: 'paint', color: 0xffffff } },
    mirror: { key: 'paint', color: 0xffffff, light: 'drl' },
    louvres: 7, spine: { key: 'gloss', color: 0x1a1c20 },
    tail: { type: 'full', drop: false }, tailY: .76, ducktail: { key: 'paint', color: 0xffffff, h: .03 },
    wing: { type: 'swan', key: 'matte', color: 0x161719, y: 1.08, z: 1.86, span: .9, chord: .32, plate: { key: 'gloss', color: BLACK }, light: 'drl' },
    diffuser: { key: 'matte', color: 0x141517, seg: 18, tip: 0x6e6a66 },
    extra({ H }) {
      // carbon stripe continues from the windshield down the nose
      H.ribbon('paint', 0xffffff, [[-2.18, .14], [-1.6, .2], [-.9, .25]], .01, { off: .005, thick: .004 });
    },
  }, options);
}
