import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {superminiVector} from '../scripts/art/supermini-vector.mjs';
import {NRF52_BOARDS} from '../dist/nrf52-boards.js';
test('SuperMini vector contains no embedded photo and preserves every contact and LED centre',async()=>{
 const svg=await readFile(new URL('../dist/assets/nrf52840-supermini.svg',import.meta.url),'utf8');
 assert.equal(svg,superminiVector());
 assert.doesNotMatch(svg,/<image|base64|data:image/);
 for(const p of NRF52_BOARDS['nrf52840-supermini'].pins.filter(p=>p.connectable!==false))assert.ok(svg.includes(`cx="${p.x}" cy="${p.y}"`),p.id);
 const led=NRF52_BOARDS['nrf52840-supermini'].leds['P0.15'];
 assert.ok(svg.includes(`cx="${led.x}" cy="${led.y}"`));
});
