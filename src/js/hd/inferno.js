/* 04 INFERNO — super car (carimg/04_Inferno.png).
   Molten-orange wedge: a sharp, low nose rising in one straight line through a steeply raked windshield, flat
   creased flanks, a big Lambo-style sidepod intake behind the door, black canopy, carbon hood stripe, hexagonal
   front intakes split by black diagonal blades, Y-shaped light signatures front and rear, black lower body, an
   orange-plane wing on black swan necks and black wheels with orange lips. */
import { buildFromTemplate } from './template.js';
import { BLACK } from './parts.js';

const ORANGE_LIP = 0xd9650f;

export const INFERNO = {
  id: 'inferno', hd: true, fx: 'super', name: 'INFERNO', stats: [9, 10, 8, 5],
  phys: { power: 1.12, grip: 1.07, loose: .98, vmax: 66, redline: 8200, lsd: .8, torque: [[900, .98], [2600, 1.15], [4800, 1.18], [6800, 1.1], [8200, .95]] },
  paint: 0xf0700c, accent: 0xff7a1a, led: 0xf4f8ff, tailColor: 0xff3010, length: 4.62,
  wheels: { r: .36, zF: -1.4, zR: 1.38, rimFrac: .74, spokes: 10, pair: true, twist: .3, nutColor: 0xff7a1a, lipColor: ORANGE_LIP,
    front: { w: .275, tx: .85 }, rear: { w: .34, tx: .89 } },
  lights: { head: [[-.7, .52, -2.28], [.7, .52, -2.28]], tail: [[-.66, .72, 2.32], [.66, .72, 2.32]] },
};

export function buildInferno(options = {}) {
  return buildFromTemplate(INFERNO, {
    layout: 'mid', accent: BLACK, roof: 'black', seatAccent: 0xff7a1a, trim: 0x2a1c12,
    prof: {
      Z0: -2.3, Z1: 2.32, arches: [{ z: -1.4, y: .365, r: .42 }, { z: 1.38, y: .365, r: .44 }],
      Wd: [[-2.3, .74], [-2.2, .86], [-2.0, .95], [-1.7, .99], [-1.4, 1.0], [-.95, .955], [-.4, .92], [.3, .95], [.85, 1.03], [1.38, 1.07], [1.95, 1.05], [2.2, 1.02], [2.32, 1.0]],
      Tc: [[-2.3, .34], [-2.15, .41], [-1.8, .5], [-1.4, .57], [-1.0, .64], [-.6, .74], [.4, .83], [1.0, .84], [1.7, .85], [2.15, .85], [2.32, .83]],
      Fp: [[-2.3, .46], [-2.12, .57], [-1.8, .68], [-1.4, .76], [-1.1, .75], [-.7, .73], [-.2, .74], [.3, .78], [.9, .88], [1.38, .93], [1.95, .92], [2.32, .88]],
      Bl: [[-2.3, .3], [-2.0, .42], [-1.4, .5], [-.5, .53], [.5, .57], [1.38, .64], [2.32, .62]],
      Yb: [[-2.3, .16], [-2.05, .13], [-1.8, .12], [1.9, .13], [2.2, .15], [2.32, .19]],
      vB: [[-1.0, .33], [-.3, .37], [.4, .38], [1.2, .3], [1.8, .22], [2.12, .17]],
      cH: [[-.98, 0], [-.7, .09], [-.4, .19], [-.1, .265], [.25, .285], [.6, .25], [1.0, .17], [1.5, .1], [1.9, .05], [2.12, 0]],
      CZ0: -.98, CZ1: 2.12, WS1: -.06, side: [-.48, .5], cut: [-.8, .72],
      intake: [.22, .98], fenderVent: [-.98, -.88], haunch: null,
    },
    sec: { crown: .002, mid: .3, dip: .01, peak: .8, shoulder: .965, drop: .03 },
    fascia: 'hex', head: { type: 'y', len: .36, v: [[.46, .66], [.6, .62]] },
    hood: { key: 'carbon', w: [.15, .27] }, nose: { key: 'carbon' }, drlKey: 'led', hoodVents: false,
    fang: { key: 'gloss', color: BLACK }, cornerAccent: { key: 'paint', color: 0xffffff },
    splitter: { key: 'carbon', color: 0x5a5a5a, lip: { key: 'paint', color: 0xffffff }, reach: .1 },
    blade: false, panel: { color: 0x101113, top: [.9, .62] }, sideIntake: 'pod',
    flash: { key: 'gloss', color: BLACK, pts: [[-1.0, .55], [-.75, .62], [-.5, .74], [-.3, .86]], w: .05 },
    ventAccent: { key: 'paint', color: 0xffffff },
    skirt: { key: 'carbon', color: 0x5a5a5a, accent: { key: 'paint', color: 0xffffff } },
    mirror: { key: 'paint', color: 0xffffff, light: 'drl' },
    louvres: 6, tail: { type: 'y', center: false }, tailY: .72,
    wing: { type: 'swan', key: 'paint', color: 0xffffff, y: 1.1, z: 1.9, span: .95, neckKey: 'gloss', neckColor: BLACK, plate: { key: 'gloss', color: BLACK }, light: null },
    diffuser: { key: 'matte', color: 0x141517, seg: 6, tip: 0x6e6a66, exhausts: [{ x: 0, y: .5, z: 2.36, r: .07, seg: 6, color: 0x6e6a66 }] },
  }, options);
}
