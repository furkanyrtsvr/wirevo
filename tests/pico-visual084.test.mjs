import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PICO_BOARDS} from '../dist/pico-boards.js';
for(const b of Object.values(PICO_BOARDS))test(b.id+' photo-informed SVG preserves all 40 connection centres and distinguishes hardware variants',()=>{
 const svg=readFileSync(new URL('../dist/assets/'+b.asset,import.meta.url),'utf8');
 assert.match(svg,/viewBox="0 0 85 216"/);assert.match(svg,new RegExp('data-photo-profile="'+b.id+'"'));
 const pads=[...svg.matchAll(/data-pad="([^"]+)" data-x="([^"]+)" data-y="([^"]+)"/g)];assert.equal(pads.length,40);
 for(const p of b.pins){const actual=pads.find(m=>m[1]===p.id);assert.ok(actual,p.id);assert.equal(+actual[2],p.x);assert.equal(+actual[3],p.y);}
 assert.match(svg,new RegExp('data-chip="'+b.mcu+'"'));assert.equal(svg.includes('data-detail="cyw43439-shield"'),b.wireless);assert.equal(svg.includes('data-detail="antenna"'),b.wireless);
 assert.equal(svg.includes('data-detail="swd-connector"'),b.headers);assert.equal(svg.includes('data-detail="swd-pads"'),!b.headers);
 if(!b.headers){const group=svg.match(/<g data-detail="swd-pads">(.*?)<\/g>/)[1],circles=[...group.matchAll(/<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g)];assert.equal(circles.length,6);for(let i=0;i<6;i+=2){assert.equal(circles[i][1],circles[i+1][1]);assert.equal(circles[i][2],circles[i+1][2]);}}
 for(const feature of ['micro-usb','bootsel','external-flash','power-regulator','crystal','onboard-led'])assert.ok(svg.includes('data-detail="'+feature+'"'),feature);
 assert.match(svg,/>ADC REF<\/text>/);assert.match(svg,/font-size="3\.2"[^>]*font-weight="600"/);assert.doesNotMatch(svg,/<image\b|data:image/);
});
