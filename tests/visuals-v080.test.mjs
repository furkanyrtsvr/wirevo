import test from 'node:test';import assert from 'node:assert/strict';
import{readFileSync,statSync}from'node:fs';import{createHash}from'node:crypto';import{execFileSync}from'node:child_process';
import{CATALOG}from'../dist/core.js';import{EXPANSION_MODULES}from'../dist/expansion-hardware.js';
import{photoBody080,PHOTO_BODY080_IDS}from'../scripts/photo-bodies080.mjs';import{photoPackage080,PHOTO_PACKAGES080}from'../scripts/photo-packages080.mjs';
import{PACKAGE_ART080_PARTS,PACKAGE_ART080_ASSETS,refinePackageArt078,screenExclusion078}from'../scripts/refine-package-art078.mjs';
import{pinLabels,pinLabelLayout,pinCaptionY,hasPinLabels}from'../dist/pin-labels.js';import{expansionDisplay}from'../dist/expansion-ui.js';
const audit=JSON.parse(readFileSync('docs/qa/photo-audit-v080.json','utf8')),svg=id=>readFileSync('dist/assets/'+CATALOG[id].asset,'utf8'),sha=s=>createHash('sha256').update(s).digest('hex');
const sensors='ina219,max6675,l298n,loadcell,dht11,hx711,tm1637,keypad4x4,lm35,mq2,flame,sound,pir,irObstacle,tilt,hall,joystick,thermistor,soilCap,servo,bh1750,mpu6050,bmp280,ds18b20,tmp36,ldr,mhz19,rtc'.split(',');
test('v080 photograph audit covers every remaining physical part, with explicit package-family notes',()=>{
 const ids=Object.entries(CATALOG).filter(([id,d])=>d.asset&&id!=='board'&&!audit.previouslyCompleted.includes(id)).map(([id])=>id).sort();
 assert.equal(ids.length,111);assert.deepEqual(audit.records.map(r=>r.id).sort(),ids);assert.equal(new Set(audit.records.map(r=>r.id)).size,111);
 for(const r of audit.records){assert.equal(r.compared,true,r.id);assert.match(r.page,/^https:\/\//,r.id);assert.match(r.imageUrl,/^https:\/\//,r.id);assert.ok(r.changes?.length,r.id);assert.equal(r.asset,CATALOG[r.id].asset);}
 assert.equal(audit.records.filter(r=>r.updated).length,109);
});
test('v080 updated drawings keep the previous saved-project anchors and screen definitions',()=>{
 const old=new Set([...audit.previouslyCompleted,'board']),data=Object.fromEntries(Object.entries(CATALOG).filter(([id,d])=>d.asset&&!old.has(id)).map(([id,d])=>[id,[d.width,d.height,d.pinDefs,d.display]]));
 assert.equal(sha(JSON.stringify(data)),'1a79f24ad20889a232341e2e67c52b593d2d2340e8055fd1499e6e3fa30cf5d0');
});
test('v080 thirty photographed module bodies are wired into the actual generator output',()=>{
 assert.equal(PHOTO_BODY080_IDS.length,30);for(const id of PHOTO_BODY080_IDS){const m=EXPANSION_MODULES[id],s=svg(id);assert.ok(s.includes(photoBody080(id,m)),id);assert.match(s,/data-photo-body080=/,id);for(const p of m.pins)assert.ok(s.includes(`data-pin="${p.id}" data-x="${p.x}" data-y="${p.y}"`),id+':'+p.id);}
});
test('v080 fifteen bare/display packages have full generated bodies, including the formerly missing motor',()=>{
 assert.equal(PHOTO_PACKAGES080.length,15);for(const id of PHOTO_PACKAGES080)assert.ok(svg(id).includes(photoPackage080(id,EXPANSION_MODULES[id])),id);
 assert.match(svg('dcmotor'),/data-photo-package080="dcmotor"/);assert.match(svg('dcmotor'),/width="56" height="38"/);assert.match(svg('dcmotor'),/h15v6h-15Z/);
 const pressed=readFileSync('dist/assets/tact-6x6-pressed.svg','utf8');assert.ok(pressed.includes(photoPackage080('tact6',{...EXPANSION_MODULES.tact6,pressed:true})));
});
test('v080 four-digit body and active segment overlay use the same non-clipping scale',()=>{
 const m=EXPANSION_MODULES.segment4,s=svg('segment4'),ui=expansionDisplay({id:'display',type:'segment4'});for(let i=0;i<4;i++){
  const x=m.width/2-4*19*.76+i*38*.76,transform=`translate(${x} 23) scale(0.76 1)`;assert.ok(s.includes(transform));assert.ok(ui.includes(transform));assert.ok(x>=0&&x+34.5*.76<=m.width);
 }assert.equal((ui.match(/data-exp-led=/g)||[]).length,32);
});
test('v080 larger pin names remain complete and dense rows use steeper collision-resistant text',()=>{
 for(const r of audit.records){const d=CATALOG[r.id],c={id:'new',type:r.id},s=pinLabels(c,d);if(!hasPinLabels(c)){assert.equal(s,'');continue;}const pins=d.pinDefs.filter(p=>p.connectable!==false);assert.equal((s.match(/data-readable-pin=/g)||[]).length,pins.length,r.id);assert.doesNotMatch(s,/<rect|<foreignObject/);assert.match(s,/font-size="10" font-weight="600"/,r.id);assert.ok(pinCaptionY(c,d)>=d.height+20);for(const p of pins){const l=pinLabelLayout(p,d);assert.ok([l.x,l.y,l.angle].every(Number.isFinite));}}
 const d=CATALOG.pcf8574;assert.equal(pinLabelLayout(d.pinDefs[0],d).angle,70);
});
test('v080 only the newly changed sensor drawings reproduce without accumulating decorations',()=>{
 const before=sensors.map(id=>sha(svg(id)));execFileSync(process.execPath,['scripts/refine-sensor-art078.mjs','--only='+sensors.join(',')],{stdio:'pipe'});assert.deepEqual(sensors.map(id=>sha(svg(id))),before);for(const id of sensors)assert.equal((svg(id).match(/data-refinement078=/g)||[]).length,1,id);
});
test('v080 thirty-five package families and forty-eight state drawings are deterministic',()=>{
 assert.equal(Object.keys(PACKAGE_ART080_PARTS).length,35);assert.equal(PACKAGE_ART080_ASSETS.length,48);assert.deepEqual(refinePackageArt078(PACKAGE_ART080_ASSETS),[]);
 for(const file of PACKAGE_ART080_ASSETS){const s=readFileSync('dist/assets/'+file,'utf8');assert.equal((s.match(/data-art080=/g)||[]).length,1,file);const view=s.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number),ex=screenExclusion078(file,view);if(ex){assert.match(s,/clip-path="url\(#art078-display-exclusion\)"/);assert.ok(ex.width>0&&ex.height>0);}}
});
test('v080 new assets contain original vectors, not embedded photographs or invalid coordinates',()=>{
 for(const file of new Set(audit.records.filter(r=>r.updated).flatMap(r=>r.assets))){const s=readFileSync('dist/assets/'+file,'utf8');assert.doesNotMatch(s,/NaN|undefined|<script|<foreignObject|<image/,file);assert.match(s,/viewBox="[\d.\s]+"/,file);}
 const cache=JSON.parse(readFileSync('dist/app-cache-list.json'));assert.ok(cache.every(p=>!p.includes('reference-photos')));assert.ok(cache.reduce((n,p)=>n+statSync('dist/'+p).size,0)<=21*1024*1024);
});
