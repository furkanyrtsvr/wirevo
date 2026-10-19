import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {CATALOG} from '../dist/core.js';
import {BOARDS} from '../dist/board-hardware.js';
import {EXPANSION_MODULES} from '../dist/expansion-hardware.js';
import {photoBody079} from '../scripts/photo-bodies079.mjs';
import {refinePackageArt078,screenExclusion078} from '../scripts/refine-package-art078.mjs';
const svg=id=>readFileSync('dist/assets/'+CATALOG[id].asset,'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const changed=['mcp2515','mfrc522','dfplayer','buzzerPassive','dht22','sht31','ky040','stepper28byj','hcSr04','ws2812','tft7735'];
test('v079 photographed redraw keeps saved-project electrical geometry unchanged',()=>{
 const data={parts:Object.fromEntries(Object.entries(CATALOG).map(([id,d])=>[id,[d.width,d.height,d.pinDefs]])),boards:Object.fromEntries(Object.entries(BOARDS).map(([id,d])=>[id,[d.width,d.height,d.pins]]))};
 assert.equal(hash(JSON.stringify(data)),'cfe3e1da2a5189980c4c5961f4ec66e38e4cf717e96dacc730cd8ffb35efd159');
});
test('v079 three replacement bodies are actually generated, not image cards or label rectangles',()=>{
 for(const id of ['mcp2515','mfrc522','dfplayer']){
  const m=EXPANSION_MODULES[id],s=svg(id);assert.ok(s.includes(photoBody079(id,m)),id);assert.match(s,new RegExp('data-photo-body="'+id+'"'));
  assert.doesNotMatch(s,/<image|data-live-value-space|scale\(1 \.56\)/);
  for(const p of m.pins)assert.ok(s.includes(`data-pin="${p.id}" data-x="${p.x}" data-y="${p.y}"`),id+':'+p.id);
 }
 assert.match(svg('mcp2515'),/8\.000/);assert.match(svg('mfrc522'),/RFID-RC522/);assert.match(svg('dfplayer'),/DFPlayer Mini/);
});
test('v079 piezo is a cylinder, RGB remains a bare clear package, no opaque black lens',()=>{
 assert.match(svg('buzzerPassive'),/rx="30" ry="14"/);assert.match(svg('buzzerPassive'),/data-bare-package="piezo"/);
 assert.match(svg('rgbled'),/data-bare-package="rgbled"|data-bare-package="rgb"/);
 const ui=readFileSync('dist/expansion-ui.js','utf8');assert.match(ui,/opacity="0"/);
});
test('v079 five sensor corrections are stable without rerunning any old test file',()=>{
 const ids=['dht22','sht31','ky040','stepper28byj','hcSr04'],before=ids.map(id=>hash(svg(id)));
 execFileSync(process.execPath,['scripts/refine-sensor-art078.mjs','--only='+ids.join(',')],{stdio:'pipe'});
 assert.deepEqual(ids.map(id=>hash(svg(id))),before);
 assert.match(svg('dht22'),/fill-rule="evenodd"/);assert.match(svg('sht31'),/#f0f0e4/);
 assert.match(svg('ky040'),/M28 10L31 7\.5H37/);assert.match(svg('stepper28byj'),/cx="161" cy="53" r="33"/);
 assert.match(svg('hcSr04'),/#18232b/);
});
test('v079 LED stick and TFT frame keep live pixel areas clear and reproduce identically',()=>{
 assert.deepEqual(refinePackageArt078(['ws2812-strip8.svg','st7735-tft128x160.svg']),[]);
 const st=svg('tft7735'),view=st.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
 assert.deepEqual(screenExclusion078(CATALOG.tft7735.asset,view),{x:18,y:16,width:108,height:135,path:'M0 0H144V194H0Z M18 16H126V151H18Z'});
 assert.match(st,/clip-path="url\(#art078-display-exclusion\)"/);assert.match(st,/#c98b29/);
 assert.match(svg('ws2812'),/height="26"/);
});
test('v079 changed SVGs contain no invalid coordinates or embedded remote photos',()=>{
 for(const id of changed){const s=svg(id);assert.doesNotMatch(s,/NaN|undefined|<script|<foreignObject|<image/,id);assert.match(s,/viewBox="[\d.\s]+"/,id);}
});
