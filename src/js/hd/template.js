/* Design template for the carimg/ cars. Two base body layouts share every detail routine:
   - 'mid'   : mid-engine — low nose, cab-forward canopy, long engine deck
   - 'front' : front-engine — long hood, set-back cabin, taller fascia with a grille
   Each car gives its own body profiles (D.prof keyframes, D.sec cross-section shape) and picks a variant for every
   signature element — fascia, headlights, tail lights, wing, side intake — plus optional parts (bolt-on flares, shark
   fin, roof scoop, fender blades), so no two cars share a silhouette or a face. `extra` adds anything else. */
import * as THREE from 'three';
import { keys, lerp, smooth, hull, archLiner, frontPlate, sidePlate, M, assemble, dot } from './kit.js';
import { BLACK, floorPan, cockpit, canopy, wing, mirrors, splitter, diffuser, skirt, overfender, fin, roofScoop } from './parts.js';

const NIGHT = 0x0d0e10, SMOKE = 0x131417;

export const LAYOUTS = {
  mid: {
    Z0: -2.36, Z1: 2.36, arches: [{ z: -1.44, y: .365, r: .42 }, { z: 1.42, y: .365, r: .43 }],
    Wd: [[-2.36, .79], [-2.26, .89], [-2.08, .96], [-1.75, .995], [-1.44, 1.0], [-.95, .965], [-.4, .93], [.3, .95], [.85, 1.01], [1.42, 1.035], [1.95, 1.02], [2.22, .985], [2.36, .955]],
    Tc: [[-2.36, .36], [-2.18, .45], [-1.8, .55], [-1.3, .63], [-.9, .71], [-.5, .81], [.5, .85], [1.1, .86], [1.7, .865], [2.12, .85], [2.36, .8]],
    Fp: [[-2.36, .5], [-2.15, .62], [-1.82, .75], [-1.44, .82], [-1.1, .8], [-.8, .765], [-.3, .75], [.3, .79], [.9, .89], [1.42, .94], [1.95, .92], [2.36, .86]],
    Bl: [[-2.36, .3], [-2.0, .42], [-1.44, .52], [-.5, .55], [.5, .58], [1.42, .62], [2.36, .58]],
    Yb: [[-2.36, .17], [-2.08, .14], [-1.8, .13], [1.9, .14], [2.2, .16], [2.36, .2]],
    vB: [[-.95, .34], [-.3, .375], [.4, .385], [1.2, .3], [1.8, .22], [2.15, .17]],
    cH: [[-.93, 0], [-.6, .145], [-.28, .27], [0, .305], [.4, .29], [.82, .21], [1.2, .13], [1.7, .085], [2.0, .05], [2.16, 0]],
    CZ0: -.92, CZ1: 2.16, WS1: -.11, side: [-.53, .5], cut: [-.78, .72], dz: 0,
    door: [-.9, .25], intake: [.32, 1.0], fenderVent: [-1.0, -.88], haunch: [.7, 1.12],
  },
  front: {
    Z0: -2.38, Z1: 2.36, arches: [{ z: -1.5, y: .37, r: .425 }, { z: 1.42, y: .37, r: .435 }],
    Wd: [[-2.38, .86], [-2.28, .93], [-2.05, .985], [-1.5, 1.0], [-.9, .975], [-.3, .955], [.4, .965], [.9, 1.0], [1.42, 1.03], [1.9, 1.015], [2.25, .985], [2.36, .965]],
    Tc: [[-2.38, .63], [-2.22, .69], [-1.6, .745], [-.9, .79], [-.5, .83], [.6, .9], [1.4, .92], [1.9, .93], [2.22, .95], [2.36, .93]],
    Fp: [[-2.38, .67], [-2.2, .76], [-1.5, .845], [-.9, .83], [-.4, .82], [.3, .845], [.9, .92], [1.42, .965], [1.9, .955], [2.36, .935]],
    Bl: [[-2.38, .43], [-2.0, .52], [-1.5, .56], [-.5, .57], [.5, .6], [1.42, .64], [2.36, .62]],
    Yb: [[-2.38, .2], [-2.12, .15], [-1.8, .14], [1.9, .15], [2.2, .17], [2.36, .23]],
    vB: [[-.5, .33], [0, .37], [.7, .38], [1.4, .3], [1.9, .22]],
    cH: [[-.52, 0], [-.22, .16], [.15, .33], [.5, .37], [.9, .33], [1.3, .21], [1.7, .09], [1.96, 0]],
    CZ0: -.52, CZ1: 1.96, WS1: .3, side: [-.1, 1.06], cut: [-.36, 1.08], dz: .45,
    door: [-.48, .7], intake: [.75, 1.04], fenderVent: [-1.06, -.94], haunch: null,
  },
};

/** Builds one car from its spec and design. */
export function buildFromTemplate(spec, D, options = {}) {
  const L = { ...LAYOUTS[D.layout], ...(D.prof || {}) }, front = D.layout === 'front';
  const Wd = keys(L.Wd), Tc = keys(L.Tc), Fp = keys(L.Fp), Bl = keys(L.Bl), Yb = keys(L.Yb), vB = keys(L.vB), cH = keys(L.cH);
  // cross-section: crown (roof of the hood), mid (how fast the hood rises to the fenders), dip (valley before the fender
  // peak), peak (fender-peak x), shoulder + drop (crease under the peak)
  const S = { crown: .006, mid: .35, dip: .025, peak: .76, shoulder: D.shoulder ?? .92, drop: .065, ...(D.sec || {}) };
  const section = z => { const W = Wd(z), T = Tc(z), F = Fp(z), B = Bl(z), Y = Yb(z);
    return [[0, T], [.2 * W, T + S.crown], [.42 * W, lerp(T, F, S.mid)], [.62 * W, F - S.dip], [S.peak * W, F], [S.shoulder * W, F - S.drop], [W, B], [.975 * W, lerp(B, Y, .62)], [.9 * W, Y]]; };
  const AC = D.accent, AK = D.accentKey || 'gloss';
  return assemble(spec, options, (kit, ctx) => {
    const { hi } = ctx, { Z0, Z1 } = L, A = L.arches;
    const H = hull(kit, section, { z0: Z0, z1: Z1, nz: hi ? 240 : 56, nv: hi ? 72 : 18, arches: A, archMinX: .52, cut: (z, v) => z > L.cut[0] && z < L.cut[1] && v < vB(z) - .02 });
    for (const a of A) archLiner(kit, H, a, { inner: .5, yBottom: .1, n: hi ? 40 : 16, lipKey: D.archLip?.key || 'gloss', lipColor: D.archLip?.color ?? NIGHT, lip: D.archLip?.size ?? .018 });
    const c = { kit, H, hi, vB, cH, L, section, Z0, Z1, A };

    // ---------- floor, cockpit, canopy ----------
    floorPan(kit, front ? { strips: [[-2.1, -2.0], [-1.04, .96], [1.9, 2.2]] } : {});
    if (hi) cockpit(kit, H, vB, { accent: D.seatAccent ?? AC, trim: D.trim ?? 0x26282c, z0: L.cut[0] + .02, z1: L.cut[1] - .04, dz: L.dz });
    const roofPaint = D.roof === 'paint';
    const { C } = canopy(kit, H, { vB, cH, z0: L.CZ0, z1: L.CZ1, ws1: L.WS1, hi, side: L.side, sideTopMax: D.sideTop ?? .5, roofKey: roofPaint ? 'paint' : 'gloss', roofColor: roofPaint ? 0xffffff : BLACK,
      rearGlass: D.rearGlass ?? (front ? [1.08, 1.78, .3] : null) });
    c.C = C;
    // centre-line height of the car (roof where the canopy is, body elsewhere)
    const roofY = z => z > L.CZ0 && z < L.CZ1 ? Math.max(C.p(z, 1).y, Tc(z)) : Tc(z);
    c.roofY = roofY;
    if (!front) {
      if (roofPaint) C.patch('gloss', BLACK, .96, L.CZ1 - .02, z => [lerp(.3, .1, smooth(1.6, L.CZ1, z)), 1], { off: .0045, nu: hi ? 30 : 10, nv: 10 });
      const n = D.louvres ?? (hi ? 11 : 5);
      for (let k = 0; k < n; k++) { const z = lerp(1.05, 1.96, k / (n - 1)); C.ribbon('gloss', 0x1d2024, [[z, .22], [z - .02, .58], [z - .03, .95]], .028, { off: .007, thick: .011, n: 10 }); }
      if (D.spine !== false) C.ribbon(D.spine?.key || 'gloss', D.spine?.color ?? 0x1a1c20, [[L.WS1 + .3, 1], [1.0, 1], [1.6, 1], [2.1, 1]], .05, { off: .008, thick: .012, mirror: false, taper: t => 1 - .5 * t });
    } else if (D.spine !== false) {
      C.ribbon(D.spine?.key || 'paint', D.spine?.color ?? 0xffffff, [[L.WS1 + .05, 1], [.9, 1], [1.5, 1]], .045, { off: .006, thick: .004, mirror: false });
    }
    if (D.roofStripe) C.ribbon(D.roofStripe.key, D.roofStripe.color, [[L.WS1 + .02, .62], [L.WS1 + .4, .58], [L.WS1 + .9, .52], [L.CZ1 - .5, .48]], .03, { off: .007, thick: .003, taper: t => 1 - .6 * t });

    // ---------- hood ----------
    const hz0 = Z0 + .04, hz1 = front ? L.CZ0 + .03 : (D.hoodEnd ?? -.9);
    if (D.hood) {
      H.patch(D.hood.key, D.hood.color ?? 0xffffff, hz0, hz1, z => [0, lerp(D.hood.w?.[0] ?? .11, D.hood.w?.[1] ?? .25, smooth(hz0, hz1, z))], { off: .004, nu: hi ? 50 : 16, nv: hi ? 10 : 4 });
      if (D.hood.edge) H.ribbon(D.hood.edge.key, D.hood.edge.color, [[hz0, (D.hood.w?.[0] ?? .11) + .005], [lerp(hz0, hz1, .5), lerp(D.hood.w?.[0] ?? .11, D.hood.w?.[1] ?? .25, .5) + .005], [hz1, (D.hood.w?.[1] ?? .25) + .005]], .01, { off: .005, thick: .004 });
    }
    if (D.hoodRidge !== false) H.ribbon(D.hood?.key || 'paint', D.hood?.color ?? 0xffffff, [[hz0 + .02, 0], [lerp(hz0, hz1, .5), 0], [hz1, 0]], .03, { off: .005, thick: .012, mirror: false });
    if (D.hoodVents !== false) {
      const hv = D.hoodVents || {}, v0 = hv.z?.[0] ?? (front ? -1.75 : -1.5), v1 = hv.z?.[1] ?? (front ? -1.25 : -1.05), w0 = hv.v?.[0] ?? (front ? .27 : .08), w1 = hv.v?.[1] ?? (front ? .36 : .19);
      H.patch('grille', 0x8a9097, v0, v1, z => [w0, w1 - .03 * smooth(v0, v1, z)], { off: .006, nu: 10, nv: 4 });
      const n = hv.slats ?? 4;
      for (let k = 0; k < n; k++) { const z = lerp(v0 + .03, v1 - .04, k / (n - 1)); H.ribbon('gloss', BLACK, [[z, w0 + .005], [z + .03, w1 - .01]], .01, { off: .007, thick: .008, n: 6 }); }
    }

    // ---------- headlights ----------
    const hd = D.head || {}, htype = hd.type || 'blade';
    const hl0 = Z0 + .01, hl1 = Z0 + (hd.len ?? (front ? .3 : .37));
    const hv = hd.v || (front ? [[.5, .68], [.56, .62]] : [[.45, .72], [.59, .645]]);
    const head = z => { const t = smooth(hl0, hl1, z); return [lerp(hv[0][0], hv[1][0], t), lerp(hv[0][1], hv[1][1], t)]; };
    const hm = lerp(hl0, hl1, .5);
    H.patch('gloss', hd.housing ?? SMOKE, hl0, hl1, head, { off: .004, nu: 16, nv: 6 });
    if (htype === 'blade' || htype === 'y') {
      H.ribbon('led', 0xffffff, [[hl0 + .005, head(hl0)[0] + .02], [hm, head(hm)[0] + .02], [hl1, head(hl1)[0] + .015]], .009, { off: .006, thick: .004 });
      H.ribbon(D.drlKey || 'drl', 0xffffff, [[hl0, head(hl0)[1] + .005], [hm, head(hm)[1] + .004], [hl1, head(hl1)[1] + .004]], .02, { off: .006, thick: .006, taper: t => 1 - .5 * t });
      for (let k = 0; k < 3; k++) { const z = lerp(hl0 + .08, hl1 - .08, k / 2), v = (head(z)[0] + head(z)[1]) / 2; dot(kit, H, 'chrome', 0x9aa3ad, z, v, .022, { off: .007 }); dot(kit, H, 'led', 0xffffff, z, v, .013, { off: .009 }); }
      if (htype === 'y') { // Y-shaped light signature: two arms leaving the housing, one up the fender, one down into the bumper
        H.ribbon(D.drlKey || 'drl', 0xffffff, [[hl1 - .04, head(hl1)[0] + .03], [hl1 + .1, head(hl1)[0] - .02], [hl1 + .2, head(hl1)[0] - .05]], .016, { off: .006, thick: .005, taper: t => 1 - .7 * t });
        H.ribbon(D.drlKey || 'drl', 0xffffff, [[hm, head(hm)[1] + .005], [hl0 + .06, head(hl0)[1] + .07], [hl0 + .02, head(hl0)[1] + .14]], .016, { off: .006, thick: .005, taper: t => 1 - .6 * t });
      }
    } else if (htype === 'slim') { // one thin light line, two small projectors
      H.ribbon('led', 0xffffff, [[hl0 + .005, head(hl0)[0] + .012], [hm, head(hm)[0] + .012], [hl1, head(hl1)[0] + .01]], .012, { off: .006, thick: .004 });
      H.ribbon(D.drlKey || 'drl', 0xffffff, [[hl0, head(hl0)[1] - .004], [hm, head(hm)[1] - .004], [hl1 + .06, head(hl1)[1] - .01]], .012, { off: .006, thick: .005, taper: t => 1 - .7 * t });
      for (const t of [.35, .62]) { const z = lerp(hl0, hl1, t), v = (head(z)[0] + head(z)[1]) / 2; dot(kit, H, 'chrome', 0x9aa3ad, z, v, .017, { off: .007 }); dot(kit, H, 'led', 0xffffff, z, v, .01, { off: .009 }); }
    } else if (htype === 'square') { // squinting box lamp: C-shaped light guide round two big projectors
      const e = .012;
      H.ribbon(D.drlKey || 'drl', 0xffffff, [[hl1 - .02, head(hl1 - .02)[0] + e], [hl0 + .02, head(hl0 + .02)[0] + e], [hl0 + .02, head(hl0 + .02)[1] - e], [hl1 - .02, head(hl1 - .02)[1] - e]], .012, { off: .006, thick: .004, n: 30 });
      for (const t of [.3, .68]) { const z = lerp(hl0, hl1, t), v = (head(z)[0] + head(z)[1]) / 2; dot(kit, H, 'chrome', 0x9aa3ad, z, v, .03, { off: .007 }); dot(kit, H, 'led', 0xffffff, z, v, .019, { off: .009 }); }
    } else if (htype === 'round') { // rally: twin round lamps and a light bar underneath
      for (const t of [.28, .7]) { const z = lerp(hl0, hl1, t), v = (head(z)[0] + head(z)[1]) / 2 - .01; dot(kit, H, 'chrome', 0x9aa3ad, z, v, .036, { off: .007 }); dot(kit, H, 'led', 0xffffff, z, v, .027, { off: .009 }); }
      H.ribbon(D.drlKey || 'drl', 0xffffff, [[hl0, head(hl0)[1] - .004], [hm, head(hm)[1] - .004], [hl1, head(hl1)[1] - .004]], .01, { off: .006, thick: .005 });
    }
    if (D.fenderLine !== false) H.ribbon('paint', 0xffffff, [[hl1, .63], [hl1 + .37, .61], [hl1 + .8, .62]], .012, { off: .002, thick: .006, taper: t => 1 - t });

    // ---------- front fascia ----------
    const zf = Z0 - .004, fang = D.fang || { key: 'paint', color: 0xffffff }, fascia = D.fascia || (front ? 'grille' : 'prow');
    if (fascia === 'grille') {
      kit.add('grille', frontPlate([[-.56, .44], [.56, .44], [.64, .6], [-.64, .6]], zf - .012, .012), 0xffffff);
      kit.add('gloss', frontPlate([[-.6, .6], [.6, .6], [.66, .63], [-.66, .63]], zf - .02, .02), D.grilleFrame ?? BLACK);
      kit.sym('grille', frontPlate([[.12, .19], [.72, .2], [.76, .34], [.62, .4], [.14, .38]], zf - .012, .012), 0xffffff);
      kit.sym(fang.key, frontPlate([[.32, .2], [.4, .2], [.44, .41], [.36, .41]], zf - .03, .03, { bevel: .006 }), fang.color);
      kit.add(fang.key, frontPlate([[-.1, .2], [.1, .2], [.06, .4], [-.06, .4]], zf - .03, .03, { bevel: .006 }), fang.color);
      kit.sym('drl', frontPlate([[.66, .42], [.8, .45], [.79, .47], [.65, .445]], zf - .014, .01), 0xffffff);
    } else if (fascia === 'muscle') { // tall full-width grille split by a body-colour bar, one wide lower mouth
      kit.add('grille', frontPlate([[-.66, .4], [.66, .4], [.7, .64], [-.7, .64]], zf - .012, .012), 0xffffff);
      kit.add('gloss', frontPlate([[-.7, .64], [.7, .64], [.72, .67], [-.72, .67]], zf - .02, .02), D.grilleFrame ?? BLACK);
      kit.add('paint', frontPlate([[-.6, .505], [.6, .505], [.6, .535], [-.6, .535]], zf - .03, .02, { bevel: .004 }), 0xffffff);
      kit.add('grille', frontPlate([[-.6, .17], [.6, .17], [.7, .24], [.66, .34], [-.66, .34], [-.7, .24]], zf - .012, .012), 0xffffff);
      kit.sym(fang.key, frontPlate([[.2, .17], [.26, .17], [.27, .34], [.21, .34]], zf - .03, .03, { bevel: .005 }), fang.color);
      kit.sym('drl', frontPlate([[.72, .26], [.82, .3], [.81, .32], [.71, .285]], zf - .014, .01), 0xffffff);
    } else if (fascia === 'wide') { // GT: one wide mouth with thin vanes, no centre prow
      kit.add('grille', frontPlate([[-.6, .15], [.6, .15], [.72, .26], [.6, .37], [-.6, .37], [-.72, .26]], zf - .012, .012), 0xffffff);
      for (const y of [.22, .3]) kit.add(fang.key, frontPlate([[-.62, y], [.62, y], [.62, y + .018], [-.62, y + .018]], zf - .03, .02, { bevel: .004 }), fang.color);
      kit.sym('drl', frontPlate([[.74, .2], [.77, .2], [.8, .33], [.77, .34]], zf - .016, .01), 0xffffff);
      kit.add('drl', frontPlate([[-.3, .41], [.3, .41], [.3, .418], [-.3, .418]], zf - .016, .008), 0xffffff);
    } else if (fascia === 'hex') { // super car: hexagonal intakes, diagonal blades
      for (const [cx, cy, rx, ry] of [[.5, .27, .2, .12], [0, .22, .16, .08]]) {
        const hex = Array.from({ length: 6 }, (_, k) => { const a = k / 6 * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
        if (cx) kit.sym('grille', frontPlate(hex, zf - .012, .012), 0xffffff); else kit.add('grille', frontPlate(hex, zf - .012, .012), 0xffffff);
      }
      kit.add(D.nose?.key || 'carbon', frontPlate([[-.12, .44], [.12, .44], [.05, .31], [-.05, .31]], zf - .045, .045, { bevel: .006 }), D.nose?.color ?? 0xffffff);
      kit.sym(fang.key, frontPlate([[.26, .42], [.33, .42], [.24, .13], [.18, .13]], zf - .035, .035, { bevel: .006 }), fang.color);
      kit.sym(fang.key, frontPlate([[.64, .4], [.72, .38], [.74, .16], [.68, .16]], zf - .035, .035, { bevel: .006 }), fang.color);
    } else { // 'prow': carbon centre prow between two intakes
      kit.sym('grille', frontPlate([[.1, .18], [.66, .19], [.72, .3], [.62, .38], [.36, .41], [.13, .34]], zf - .012, .012), 0xffffff);
      kit.add(D.nose?.key || 'carbon', frontPlate([[-.17, .4], [.17, .4], [.07, .12], [-.07, .12]], zf - .045, .045, { bevel: .006 }), D.nose?.color ?? 0xffffff);
      kit.sym(fang.key, frontPlate([[.38, .18], [.45, .18], [.42, .4], [.33, .39]], zf - .03, .03, { bevel: .006 }), fang.color);
      kit.sym('drl', frontPlate([[.69, .2], [.72, .2], [.76, .32], [.73, .33]], zf - .016, .01), 0xffffff);
    }
    H.patch('grille', 0xffffff, Z0 + .01, Z0 + .23, z => [lerp(.8, .86, smooth(Z0 + .01, Z0 + .23, z)), .98], { off: .003, nu: 10, nv: 6 });
    if (D.cornerAccent) H.ribbon(D.cornerAccent.key, D.cornerAccent.color, [[Z0 + .02, .78], [Z0 + .12, .8], [Z0 + .23, .86], [Z0 + .28, .97]], .012, { off: .005, thick: .005 });
    const sp = D.splitter || {};
    if (sp !== false && D.splitter !== false) splitter(kit, [[0, Z0 - (sp.reach ?? .14)], [.5, Z0 - (sp.reach ?? .14) + .01], [.86, Z0 - .04], [.99, Z0 + .1], [1.0, Z0 + .29], [.9, Z0 + .37], [0, Z0 + .32]], {
      key: sp.key || 'carbon', color: sp.color ?? 0x6a6a6a, lip: sp.lip, y: sp.y ?? .085,
      fences: sp.fences === false ? [] : [.3, .58].map(x => ({ x, pts: [[Z0 - .12, sp.y ?? .1], [Z0 + .18, sp.y ?? .1], [Z0 + .16, (sp.y ?? .1) + .1], [Z0 - .02, (sp.y ?? .1) + .1]] })),
      canards: sp.canards === false ? [] : sp.canards === 'big' ? [{ x: .93, y: .22, z: Z0 + .19, l: .3, d: .2 }, { x: .93, y: .33, z: Z0 + .19, l: .24, d: .18 }, { x: .92, y: .44, z: Z0 + .21, l: .16 }]
        : [{ x: .93, y: .24, z: Z0 + .19, l: .22 }, { x: .93, y: .33, z: Z0 + .19, l: .16 }] });

    // ---------- side ----------
    const [d0, d1] = L.door;
    for (const pts of [[[d0, .43], [d0 - .02, .7], [d0, .95]], [[d0, .43], [lerp(d0, d1, .5), .42], [d1, .44]], [[d1, .44], [d1 - .06, .7], [d1 - .03, .95]]]) H.ribbon('matte', 0x050505, pts, .005, { off: .0015, n: 20 });
    if (D.handle !== false) H.ribbon('gloss', BLACK, [[d1 - .2, .58], [d1 - .08, .58]], .018, { off: .003, thick: .004, n: 4 });
    const dTop = z => lerp(D.panel?.top?.[0] ?? .86, D.panel?.top?.[1] ?? .66, smooth(d0 + .05, L.intake[1], z));
    if (D.panel !== false) H.patch(D.panel?.key || 'gloss', D.panel?.color ?? NIGHT, D.panel?.z0 ?? d0 + .02, L.intake[1] - .02, z => [dTop(z), .955], { off: .003, nu: hi ? 40 : 14, nv: 8 });
    const intake = D.sideIntake || 'scoop';
    if (intake === 'scoop') H.patch('grille', 0xb0b6bc, L.intake[0], L.intake[1], z => [dTop(z) + .02, lerp(dTop(z) + .03, .9, smooth(L.intake[0], L.intake[0] + .45, z))], { off: .0045, nu: 20, nv: 8 });
    else if (intake === 'gills') for (let k = 0; k < 3; k++) { const z = A[0].z + A[0].r + .12 + k * .11; H.ribbon(D.gillKey || 'gloss', D.gillColor ?? BLACK, [[z, .6], [z + .03, .72], [z + .06, .84]], .05, { off: .004, thick: .012, n: 8 }); }
    else if (intake === 'pod') { // sidepod: a deep vertical inlet behind the door with a body-colour strake
      H.patch('grille', 0x9aa0a8, L.intake[0], L.intake[1], z => [lerp(.62, .58, smooth(L.intake[0], L.intake[1], z)), lerp(.7, .92, smooth(L.intake[0], L.intake[0] + .2, z))], { off: .0045, nu: 20, nv: 8 });
      H.ribbon('paint', 0xffffff, [[L.intake[0] - .05, .6], [lerp(L.intake[0], L.intake[1], .5), .74], [L.intake[1], .9]], .04, { off: .004, thick: .03, n: 16 });
    }
    const bl = D.blade || { key: 'paint', color: 0xffffff };
    if (D.blade !== false) H.ribbon(bl.key, bl.color, [d0 + .04, lerp(d0, L.intake[1], .33), lerp(d0, L.intake[1], .66), L.intake[1] - .02].map(z => [z, dTop(z) - .005]), .05, { off: .004, thick: .022, taper: t => .6 + .4 * Math.sin(t * Math.PI) });
    if (D.flash) H.ribbon(D.flash.key, D.flash.color, D.flash.pts, D.flash.w ?? .03, { off: .0045, thick: .003, taper: t => .3 + .7 * Math.sin(t * Math.PI) });
    const [f0, f1] = L.fenderVent || [0, 0];
    if (L.fenderVent && D.fenderVent !== false && intake !== 'gills') {
      H.patch('grille', 0xffffff, f0, f1, z => [lerp(.6, .64, smooth(f0, f1, z)), .9], { off: .004, nu: 6, nv: 8 });
      if (D.ventAccent !== false) H.ribbon(D.ventAccent?.key || 'drl', D.ventAccent?.color ?? 0xffffff, [[f0, .62], [f0 + .01, .78], [f0 + .04, .9]], .01, { off: .006, thick: .004 });
    }
    if (L.haunch) { H.patch('grille', 0xffffff, L.haunch[0], L.haunch[1], z => [.4, lerp(.47, .52, smooth(L.haunch[0], L.haunch[1], z))], { off: .004, nu: 10, nv: 4 });
      H.ribbon('gloss', BLACK, [[L.haunch[0] - .02, .4], [lerp(...L.haunch, .5), .41], [L.haunch[1] + .02, .4]], .014, { off: .006, thick: .008 }); }
    const sk = D.skirt || {};
    if (D.skirt !== false) skirt(kit, H, { hi, key: sk.key || 'carbon', color: sk.color ?? 0x6a6a6a, accent: sk.accent === undefined ? { key: AK, color: AC } : sk.accent, z0: A[0].z + A[0].r + .02, z1: A[1].z - A[1].r - .02, y: sk.y ?? .135 });
    const mr = D.mirror || {};
    // door mirror on a short stalk just outside the A-pillar base
    const mu = mr.u ?? L.CZ0 + (front ? .3 : .35), mv = mr.v ?? vB(mu) + .07, mb = H.p(mu, mv);
    mirrors(kit, H, { hi, u: mu, v: mv, pos: mr.pos ?? [Math.max(mb.x + .2, H.p(mu + .1, .62).x + .1), mb.y + (mr.rise ?? .08), mu + .12], bodyKey: mr.key || 'paint', bodyColor: mr.color ?? 0xffffff, stalkKey: 'gloss', stalkColor: BLACK, light: mr.light ?? 'drl' });

    // ---------- optional signature parts ----------
    if (D.overfenders) for (const a of A) overfender(kit, H, a, { hi, ...D.overfenders });
    if (D.fenderBlades) { const fb = D.fenderBlades; // raised blades riding the front fender peaks
      H.ribbon(fb.key || 'paint', fb.color ?? 0xffffff, [[Z0 + .12, .5], [-1.9, .49], [-1.44, .48], [-1.05, .5]], fb.w ?? .04, { off: .002, thick: fb.h ?? .05, taper: t => .4 + .6 * Math.sin(Math.PI * (.15 + .85 * t)) });
      if (fb.accent) H.ribbon(fb.accent.key, fb.accent.color, [[Z0 + .14, .485], [-1.9, .475], [-1.44, .465], [-1.06, .485]], .008, { off: .05, thick: .004 }); }
    if (D.scoop) roofScoop(kit, roofY, D.scoop);
    if (D.fin) fin(kit, roofY, { z1: (D.wing?.z ?? 1.96) + .1, top: (D.wing?.y ?? 1.19) + .03, ...D.fin });

    // ---------- rear ----------
    const zr = Z1 + .004, ty = D.tailY ?? (front ? .82 : .72), tc = D.tail || {}, tt = tc.type || 'bars';
    kit.add(tc.panelKey || 'lattice', frontPlate([[-.86, .27], [.86, .27], [.9, ty - .12], [.84, ty - .06], [-.84, ty - .06], [-.9, ty - .12]], zr, .008), tc.panelColor ?? 0xffffff);
    if (front) kit.add('paint', frontPlate([[-.9, ty - .06], [.9, ty - .06], [.92, ty + .09], [-.92, ty + .09]], zr - .004, .006), 0xffffff);
    const lamp = (pts, z = zr + .012) => kit.add('tail', frontPlate(pts, z, .008), 0xffffff), both = (pts, z) => { lamp(pts, z); lamp(pts.map(([x, y]) => [-x, y]).reverse(), z); };
    if (tt === 'bars' || tt === 'full') for (const s of [1, -1]) {
      const bar = [[.3, ty - .01], [.84, ty], [.9, ty + .04], [.32, ty + .02]].map(([x, y]) => [s * x, y]);
      kit.add('gloss', frontPlate([[.24, ty - .025], [.92, ty - .012], [.95, ty + .06], [.24, ty + .045]].map(([x, y]) => [s * x, y]), zr, .012), 0x050506);
      lamp(s > 0 ? bar : bar.reverse());
      if (tc.drop !== false && tt === 'bars') { const drop = [[.86, ty - .14], [.89, ty - .14], [.91, ty + .03], [.88, ty + .02]].map(([x, y]) => [s * x, y]); lamp(s > 0 ? drop : drop.reverse()); }
    }
    if (tt === 'full') { kit.add('gloss', frontPlate([[-.3, ty - .02], [.3, ty - .02], [.3, ty + .045], [-.3, ty + .045]], zr, .012), 0x050506); lamp([[-.32, ty + .004], [.32, ty + .004], [.32, ty + .02], [-.32, ty + .02]]); }
    else if (tt === 'quad') { // two stacked blades per side
      kit.add('gloss', frontPlate([[-.92, ty - .1], [.92, ty - .1], [.95, ty + .06], [-.95, ty + .06]], zr, .012), 0x050506);
      for (const dy of [0, -.07]) both([[.36, ty - .005 + dy], [.86, ty + .01 + dy], [.9, ty + .035 + dy], [.38, ty + .015 + dy]]);
    } else if (tt === 'tri') { // muscle: three vertical bars per side
      kit.add('gloss', frontPlate([[-.9, ty - .1], [.9, ty - .1], [.92, ty + .07], [-.92, ty + .07]], zr, .012), 0x050506);
      for (const x of [.5, .63, .76]) both([[x, ty - .08], [x + .07, ty - .08], [x + .07, ty + .05], [x, ty + .05]]);
    } else if (tt === 'c') { // hooked "]" signature per side
      kit.add('gloss', frontPlate([[-.92, ty - .11], [.92, ty - .11], [.95, ty + .06], [-.95, ty + .06]], zr, .012), 0x050506);
      both([[.42, ty + .02], [.88, ty + .03], [.88, ty + .045], [.42, ty + .035]]); both([[.86, ty - .09], [.89, ty - .09], [.89, ty + .04], [.86, ty + .04]]); both([[.6, ty - .09], [.88, ty - .09], [.88, ty - .075], [.6, ty - .075]]);
    } else if (tt === 'y') { // three blades meeting in a Y per side
      kit.add('gloss', frontPlate([[-.92, ty - .12], [.92, ty - .12], [.95, ty + .07], [-.95, ty + .07]], zr, .012), 0x050506);
      const cx = .68, cy = ty - .015, arm = (x, y) => { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy), nx = -dy / l * .012, ny = dx / l * .012; return [[cx - nx, cy - ny], [x - nx, y - ny], [x + nx, y + ny], [cx + nx, cy + ny]]; };
      for (const [x, y] of [[.4, ty + .04], [.92, ty + .05], [.74, ty - .11]]) { const p = arm(x, y); lamp(p); lamp(p.map(([a, b]) => [-a, b]).reverse()); }
    } else if (tt === 'x') { // crossing slashes
      kit.add('gloss', frontPlate([[-.92, ty - .11], [.92, ty - .11], [.95, ty + .06], [-.95, ty + .06]], zr, .012), 0x050506);
      both([[.4, ty - .08], [.44, ty - .08], [.88, ty + .04], [.84, ty + .04]]); both([[.4, ty + .04], [.44, ty + .04], [.88, ty - .08], [.84, ty - .08]]);
    }
    if (tc.center !== false) kit.add(tc.centerKey || 'tail', frontPlate([[-.2, ty + .05], [.2, ty + .05], [.2, ty + .064], [-.2, ty + .064]], zr + .01, .006), 0xffffff);
    kit.add('matte', frontPlate([[-.24, .38], [.24, .38], [.24, .49], [-.24, .49]], zr + .012, .01), 0x8c9096);
    if (tc.wrap !== false) H.ribbon('tail', 0xffffff, [[Z1 - .18, .55], [Z1 - .07, .6], [Z1 - .005, .66]], .014, { off: .004, thick: .005 });
    const df = D.diffuser || {};
    diffuser(kit, { key: df.key || 'matte', color: df.color ?? 0x141517, z0: Z1 - .62, z1: Z1 + .12, fins: df.fins || [.18, .42, .66], y1: df.y1 ?? .32,
      exhausts: df.exhausts || [-.11, .11].map(x => ({ x, y: .25, z: Z1 + .06, r: .058, seg: df.seg ?? 6, color: df.tip ?? 0x8d8378 })) });
    if (!front && D.rearVents !== false) for (let k = 0; k < 4; k++) H.ribbon('gloss', BLACK, [[1.74 + k * .1, .44], [1.77 + k * .1, .56]], .03, { off: .004, thick: .006, n: 6 });
    if (front || D.ducktail) H.ribbon(D.ducktail?.key || 'paint', D.ducktail?.color ?? 0xffffff, [[Z1 - .03, -.44], [Z1 - .03, 0], [Z1 - .03, .44]], .06, { off: .002, thick: D.ducktail?.h ?? .035, mirror: false, n: 20 });

    // ---------- wing ----------
    const wg = D.wing || {};
    if (D.wing !== false) {
      const type = wg.type || (front ? 'pedestal' : 'swan'), wy = wg.y ?? (front ? 1.18 : 1.19), wz = wg.z ?? (front ? 1.98 : 1.96), span = wg.span ?? (front ? .92 : .97);
      if (type === 'pedestal') wing(kit, { hi, key: wg.key || 'matte', color: wg.color ?? 0x151619, span, y: wy, z: wz, chord: wg.chord ?? .38, aoa: -.12, flap: wg.flap ? { chord: .12, y: wy + .08, z: wz + .34, aoa: -.5 } : null, light: wg.light ?? null, neckX: wg.neckX ?? .48, neckKey: wg.neckKey || 'matte', neckColor: wg.neckColor ?? 0x141517,
        neck: [[wz - .03, .9], [wz + .14, .9], [wz + .2, wy - .05], [wz + .08, wy - .01]],
        plate: [[1.9, 1.08], [2.38, 1.1], [2.4, 1.3], [2.3, 1.32], [1.94, 1.22]].map(([z, y]) => [z + wz - 1.98, y + wy - 1.18]) });
      else if (type === 'swan' || type === 'double') {
        const k = (wy - .855) / (1.19 - .855), nk = ([z, y]) => [z + wz - 1.96, .855 + (y - .855) * k];
        wing(kit, { hi, key: wg.key || 'matte', color: wg.color ?? 0x151619, span, y: wy, z: wz, chord: wg.chord ?? .38, light: wg.light ?? 'drl', neckKey: wg.neckKey || 'gloss', neckColor: wg.neckColor ?? BLACK, neckX: wg.neckX ?? .34,
          flap: { chord: .14, y: wy + .1, z: wz + .35, aoa: -.55 },
          neck: [[1.74, .855], [2.0, .86], [2.22, 1.12], [2.28, 1.26], [2.18, 1.3], [2.1, 1.24], [1.94, 1.0]].map(nk) });
        if (type === 'double') wing(kit, { hi, key: wg.key || 'matte', color: wg.color ?? 0x151619, span: span * .96, y: wy + .17, z: wz + .1, chord: .3, aoa: -.2, flap: null, light: null });
        const pl = wg.plate || { key: 'matte', color: 0x151619 }, ph = type === 'double' ? .17 : 0;
        kit.sym(pl.key, sidePlate([[1.9, 1.07], [2.42, 1.11], [2.46, 1.41 + ph], [2.34, 1.43 + ph], [1.98, 1.27], [1.88, 1.15]].map(([z, y]) => [z + wz - 1.96, y + wy - 1.19]), span, .014, { bevel: .003 }), pl.color);
      } else if (type === 'blade') { // low active spoiler on short struts behind the deck
        wing(kit, { hi, key: wg.key || 'paint', color: wg.color ?? 0xffffff, span, y: wy, z: wz, chord: wg.chord ?? .3, aoa: -.08, flap: null, light: wg.light ?? null, neckX: .3, neckKey: wg.neckKey || 'gloss', neckColor: wg.neckColor ?? BLACK,
          neck: [[wz - .02, wy - .2], [wz + .14, wy - .2], [wz + .17, wy - .01], [wz + .05, wy - .01]] });
        if (wg.plate) kit.sym(wg.plate.key, sidePlate([[wz - .02, wy - .06], [wz + .34, wy - .04], [wz + .36, wy + .07], [wz + .02, wy + .04]], span, .012, { bevel: .003 }), wg.plate.color);
      }
    }
    D.extra?.(c);
  });
}
