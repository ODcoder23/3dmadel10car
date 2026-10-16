/* 06 ORBIT — concept car (carimg/06_Orbit.png).
   Pearl-silver concept hypercar: a very low, deep-valley nose between tall front fenders topped by raised blades with
   gold edges, a wide black teardrop canopy that runs long into the tail, a black hood and centre prow, polished-gold
   fang blades, pinstripes and skirt trim, amber blade headlights, hooked "]" tail lights, a low gold-edged active
   spoiler on short struts instead of a tall wing, and black wheels with gold lips. */
import { buildFromTemplate } from './template.js';
import { BLACK } from './parts.js';

const GOLD = 0xd9a62a;

export const ORBIT = {
  id: 'orbit', hd: true, fx: 'concept', name: 'ORBIT', stats: [10, 8, 9, 4],
  phys: { power: 1.1, grip: 1.1, loose: .98, vmax: 69, redline: 9000, lsd: .84, torque: [[900, .86], [3000, 1.04], [5600, 1.16], [7800, 1.15], [9000, 1.0]] },
  paint: 0xd2d5d9, accent: 0xffb22e, led: 0xfff4e0, tailColor: 0xff3a14, length: 4.9,
  wheels: { r: .37, zF: -1.5, zR: 1.46, rimFrac: .78, spokes: 14, pair: true, twist: .32, nutColor: GOLD, lipColor: GOLD,
    front: { w: .275, tx: .86 }, rear: { w: .34, tx: .88 } },
  lights: { head: [[-.74, .5, -2.44], [.74, .5, -2.44]], tail: [[-.62, .7, 2.46], [.62, .7, 2.46]] },
};

export function buildOrbit(options = {}) {
  return buildFromTemplate(ORBIT, {
    layout: 'mid', accent: GOLD, accentKey: 'chrome', roof: 'black', seatAccent: GOLD, trim: 0x2c2820,
    prof: {
      Z0: -2.44, Z1: 2.46, arches: [{ z: -1.5, y: .37, r: .43 }, { z: 1.46, y: .37, r: .44 }],
      Wd: [[-2.44, .8], [-2.3, .92], [-2.1, .99], [-1.8, 1.02], [-1.5, 1.03], [-1.0, .97], [-.4, .92], [.3, .94], [.9, 1.01], [1.46, 1.05], [2.0, 1.03], [2.32, .98], [2.46, .93]],
      Tc: [[-2.44, .3], [-2.25, .36], [-1.9, .43], [-1.5, .5], [-1.1, .6], [-.7, .72], [.4, .8], [1.2, .81], [1.9, .8], [2.3, .77], [2.46, .72]],
      Fp: [[-2.44, .5], [-2.25, .66], [-1.9, .8], [-1.5, .87], [-1.15, .85], [-.8, .79], [-.3, .76], [.3, .79], [.9, .88], [1.46, .93], [2.0, .9], [2.46, .82]],
      Bl: [[-2.44, .3], [-2.1, .42], [-1.5, .52], [-.5, .54], [.5, .57], [1.46, .61], [2.46, .56]],
      Yb: [[-2.44, .16], [-2.15, .13], [-1.8, .12], [1.9, .13], [2.3, .15], [2.46, .2]],
      vB: [[-.78, .4], [-.2, .42], [.5, .42], [1.3, .34], [1.9, .26], [2.3, .2]],
      cH: [[-.78, 0], [-.5, .14], [-.2, .26], [.15, .32], [.55, .3], [1.0, .22], [1.5, .14], [2.0, .07], [2.3, .02], [2.36, 0]],
      CZ0: -.78, CZ1: 2.36, WS1: .02, side: [-.36, .66], cut: [-.62, .82],
      door: [-.76, .4], intake: [.48, 1.06], fenderVent: [-1.08, -.96], haunch: [.78, 1.2],
    },
    sec: { crown: .003, mid: .14, dip: .07, peak: .72, shoulder: .9, drop: .08 },
    head: { type: 'blade', len: .44, v: [[.5, .74], [.62, .66]] },
    hood: { key: 'gloss', color: BLACK, w: [.12, .22], edge: { key: 'chrome', color: GOLD } }, hoodEnd: -.8, nose: { key: 'gloss', color: BLACK },
    hoodVents: false, louvres: 0, spine: { key: 'chrome', color: GOLD },
    fang: { key: 'chrome', color: GOLD }, cornerAccent: { key: 'chrome', color: GOLD }, archLip: { key: 'chrome', color: GOLD, size: .012 },
    fenderBlades: { key: 'paint', color: 0xffffff, w: .05, h: .07, accent: { key: 'chrome', color: GOLD } },
    splitter: { key: 'gloss', color: BLACK, lip: { key: 'chrome', color: GOLD }, fences: false, canards: false, reach: .12 },
    blade: { key: 'paint', color: 0xffffff }, panel: { color: 0x121315, top: [.86, .68] },
    flash: { key: 'chrome', color: GOLD, pts: [[-.85, .7], [-.4, .68], [.1, .66], [.45, .6]], w: .018 },
    ventAccent: { key: 'chrome', color: GOLD },
    skirt: { key: 'gloss', color: BLACK, accent: { key: 'chrome', color: GOLD } },
    mirror: { key: 'chrome', color: GOLD, light: null },
    tail: { type: 'c', center: false }, tailY: .7, ducktail: { key: 'paint', color: 0xffffff, h: .03 }, rearVents: false,
    wing: { type: 'blade', key: 'paint', color: 0xffffff, y: 1.0, z: 2.06, span: .86, chord: .32, plate: { key: 'chrome', color: GOLD }, neckColor: BLACK },
    diffuser: { key: 'matte', color: 0x141517, seg: 18, tip: GOLD, exhausts: [-.07, .07].map(x => ({ x, y: .26, z: 2.52, r: .05, seg: 18, color: GOLD })) },
    extra({ H, C }) {
      // gold pin lines round the rear haunch and along the canopy's long tail
      H.ribbon('chrome', GOLD, [[.75, .52], [1.2, .5], [1.8, .48], [2.3, .5]], .008, { off: .004, thick: .003 });
      C.ribbon('chrome', GOLD, [[.9, .1], [1.5, .1], [2.1, .1], [2.32, .1]], .008, { off: .006, thick: .003 });
    },
  }, options);
}
