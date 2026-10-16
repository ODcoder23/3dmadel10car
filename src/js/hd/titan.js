/* 09 TITAN — muscle car (carimg/09_Titan.png).
   Gunmetal widebody muscle coupe: tall, flat, slab-sided body with a long level hood and a power bulge, an upright
   full-width grille split by a body-colour bar, squinting box headlamps with C-shaped light guides, a fastback roof
   into a short ducktail deck, triple vertical tail bars, red pin lines on the splitter, sills and arches, red mirror
   shells, a black pedestal wing with red end plates, quad exhausts and black wheels with red lips. */
import { buildFromTemplate } from './template.js';
import { BLACK } from './parts.js';

const RED = 0xe2361c;

export const TITAN = {
  id: 'titan', hd: true, fx: 'muscle', name: 'TITAN', stats: [8, 10, 6, 9],
  phys: { power: 1.16, grip: .98, loose: .96, vmax: 65, redline: 6800, lsd: .45, torque: [[900, 1.05], [2200, 1.22], [3800, 1.2], [5400, 1.02], [6800, .8]] },
  paint: 0x4b4f55, accent: RED, led: 0xf2f6ff, tailColor: 0xff2010, length: 4.8,
  wheels: { r: .37, zF: -1.5, zR: 1.42, rimFrac: .74, spokes: 10, pair: true, twist: .15, nutColor: RED, lipColor: RED,
    front: { w: .29, tx: .87 }, rear: { w: .35, tx: .88 } },
  lights: { head: [[-.74, .7, -2.4], [.74, .7, -2.4]], tail: [[-.62, .9, 2.41], [.62, .9, 2.41]] },
};

export function buildTitan(options = {}) {
  return buildFromTemplate(TITAN, {
    layout: 'front', accent: RED, roof: 'paint', seatAccent: RED, trim: 0x2a1614,
    prof: {
      Z0: -2.4, Z1: 2.38,
      Wd: [[-2.4, .9], [-2.3, .96], [-2.0, .995], [-1.5, 1.01], [-.9, .99], [-.3, .975], [.4, .985], [.9, 1.02], [1.42, 1.045], [1.9, 1.035], [2.25, 1.01], [2.38, .99]],
      Tc: [[-2.4, .74], [-2.25, .8], [-1.8, .84], [-1.0, .87], [-.5, .9], [.6, .96], [1.4, .98], [1.9, 1.0], [2.22, 1.01], [2.38, .99]],
      Fp: [[-2.4, .76], [-2.2, .84], [-1.5, .89], [-.9, .885], [-.4, .89], [.3, .91], [.9, .96], [1.42, 1.0], [1.9, 1.0], [2.38, .99]],
      Bl: [[-2.4, .5], [-2.0, .58], [-1.5, .62], [-.5, .63], [.5, .65], [1.42, .69], [2.38, .68]],
      Yb: [[-2.4, .2], [-2.12, .16], [-1.8, .15], [1.9, .16], [2.2, .19], [2.38, .25]],
      vB: [[-.5, .3], [0, .33], [.7, .34], [1.4, .28], [1.9, .2]],
      cH: [[-.5, 0], [-.2, .17], [.15, .35], [.55, .39], [.95, .36], [1.35, .22], [1.75, .08], [1.96, 0]],
      CZ0: -.5, CZ1: 1.96, WS1: .28, side: [-.06, 1.12], cut: [-.34, 1.08],
    },
    sec: { crown: .002, mid: .2, dip: .004, peak: .84, shoulder: .975, drop: .028 },
    rearGlass: [1.12, 1.8, .28],
    fascia: 'muscle', head: { type: 'square', len: .34, v: [[.52, .72], [.6, .66]] },
    hood: { key: 'gloss', color: 0x18191c, w: [.3, .3], edge: { key: 'gloss', color: RED } }, spine: { key: 'gloss', color: 0x18191c },
    hoodVents: false, grilleFrame: RED,
    fang: { key: 'gloss', color: 0x18191c }, cornerAccent: { key: 'gloss', color: RED }, archLip: { key: 'gloss', color: RED, size: .014 },
    splitter: { key: 'gloss', color: BLACK, lip: { key: 'gloss', color: RED }, canards: false, reach: .1 },
    blade: false, panel: { color: 0x26282c, top: [.86, .8] }, sideIntake: 'gills',
    ventAccent: { key: 'gloss', color: RED },
    skirt: { key: 'gloss', color: BLACK, accent: { key: 'gloss', color: RED } },
    mirror: { key: 'gloss', color: RED, light: null },
    tail: { type: 'tri', wrap: false }, tailY: .9,
    ducktail: { key: 'paint', color: 0xffffff, h: .05 },
    wing: { type: 'pedestal', key: 'matte', color: 0x141517, span: .95, y: 1.3, z: 2.0 },
    diffuser: { key: 'matte', color: 0x141517, seg: 18, tip: 0x5f6266,
      exhausts: [-.66, -.54, .54, .66].map(x => ({ x, y: .26, z: 2.44, r: .045, seg: 18, color: 0x5f6266 })) },
    extra({ H }) {
      // power bulge down the hood with twin black scoops edged in red
      H.ribbon('paint', 0xffffff, [[-2.15, 0], [-1.4, 0], [-.6, 0]], .5, { off: .001, thick: .035, mirror: false, n: 24, taper: t => .7 + .3 * Math.sin(t * Math.PI) });
      for (const v of [.1]) {
        H.ribbon('gloss', RED, [[-1.78, v], [-1.36, v]], .2, { off: .03, thick: .045, n: 8, taper: t => .75 + .25 * t });
        H.ribbon('gloss', 0x0c0d0f, [[-1.775, v], [-1.37, v]], .17, { off: .034, thick: .048, n: 8, taper: t => .75 + .25 * t });
      }
      // red pin lines on the rear deck and along the shoulder crease
      H.ribbon('gloss', RED, [[1.8, .14], [2.05, .26], [2.33, .4]], .012, { off: .005, thick: .003 });
      H.ribbon('gloss', RED, [[-2.0, .62], [-1.0, .615], [0, .615], [1.0, .61], [2.1, .6]], .006, { off: .004, thick: .002 });
      // black quarter-window louvre behind the door
      H.ribbon('gloss', BLACK, [[1.1, .5], [1.3, .48], [1.55, .46]], .07, { off: .004, thick: .003, taper: t => 1 - .6 * t });
    },
  }, options);
}
