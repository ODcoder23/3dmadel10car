// Registry of the HD cars (carimg/ designs). Each entry: the catalogue spec and its builder.
import { ZEPHYR, buildZephyr } from './zephyr.js';
import { VOLTEX, buildVoltex } from './voltex.js';
import { RAVEN, buildRaven } from './raven.js';
import { INFERNO, buildInferno } from './inferno.js';
import { CYCLONE, buildCyclone } from './cyclone.js';
import { ORBIT, buildOrbit } from './orbit.js';
import { PHANTOM, buildPhantom } from './phantom.js';
import { NOVA, buildNova } from './nova.js';
import { TITAN, buildTitan } from './titan.js';
import { VELOCITY, buildVelocity } from './velocity.js';

export const HD_CARS = [
  { spec: ZEPHYR, build: buildZephyr },
  { spec: VOLTEX, build: buildVoltex },
  { spec: RAVEN, build: buildRaven },
  { spec: INFERNO, build: buildInferno },
  { spec: CYCLONE, build: buildCyclone },
  { spec: ORBIT, build: buildOrbit },
  { spec: PHANTOM, build: buildPhantom },
  { spec: NOVA, build: buildNova },
  { spec: TITAN, build: buildTitan },
  { spec: VELOCITY, build: buildVelocity },
];
