import test from 'node:test';
import assert from 'node:assert/strict';
import {installROM} from '../dist/stm32-rom.js';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {STM_SCOPE,STM_SCOPE_POLICY,showSTMScope} from '../dist/stm32-scope.js';

// A bridge double tests JS transaction semantics only, not ST firmware or native timing.
function fixture(board){
 const calls=[],r={board,cpu:1,exports:{memory:new WebAssembly.Memory({initial:1}),allocate:()=>16,deallocate:()=>{},rom_load:(...args)=>{calls.push(args);return 1;}},system:{bootMode:'flash',requestReset:n=>calls.push(['reset',n])}};
 installROM(r);return{r,calls};
}
function dump(board,marker=1){const f4=board.cpu==='cortex-m4f',base=f4?0x1fff0000:0x1ffff000,data=new Uint8Array(f4?30720:2048),v=new DataView(data.buffer);v.setUint32(0,0x20000000+board.ram,true);v.setUint32(4,base+257,true);data[256]=marker;return data;}

for(const[id,board]of Object.entries(STM32_BOARDS)){
 test(id+' v069 failed ROM replacement preserves the prior image and fingerprint',async()=>{
  const{r}=fixture(board);assert.equal(r.romInfo().compatibility,'functional-model');
  const first=await r.setSystemROM(dump(board)),previous=r.systemROM;
  assert.equal(first.compatibility,'unverified-vendor-rom');
  r.exports.rom_load=()=>0;
  await assert.rejects(r.setSystemROM(dump(board,2)),/haritası/);
  assert.equal(r.systemROM,previous);assert.deepEqual(r.romInfo(),first);
 });
 test(id+' v069 scope dialog separates supported models from accepted physical limits',()=>{
  const previous=globalThis.document;let title,body,styled=false;
  globalThis.document={getElementById:()=>({classList:{add:()=>{styled=true;}}})};
  try{showSTMScope(id,(t,b)=>{title=t;body=b;});}finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
  assert.match(title,/STM32/);assert.match(body,/işlevsel simülatör profili/);
  assert.match(body,/zorunlu kapanış şartı değildir/);assert.match(body,/gerçek hatalar normal bakım/);
  assert.match(body,/Model sınırı \/ isteğe bağlı ayrıntı/);assert.doesNotMatch(body,/denetimi yeniden açıldı/);assert.ok(styled);
 });
}
test('v069 failed ROM detach keeps the active metadata and does not request reset',async()=>{
 const{r,calls}=fixture(Object.values(STM32_BOARDS)[0]);await r.setSystemROM(dump(r.board));const before=r.romInfo();calls.length=0;r.exports.rom_load=()=>0;
 await assert.rejects(r.setSystemROM(null),/kaldırılamadı/);assert.deepEqual(r.romInfo(),before);assert.equal(calls.length,0);
});
test('v069 a newer ROM operation cancels an in-flight older digest',async()=>{
 const{r,calls}=fixture(Object.values(STM32_BOARDS)[0]);const a=r.setSystemROM(dump(r.board)),rejected=assert.rejects(a,/yeni bir istek/),b=r.setSystemROM(dump(r.board,2));
 await Promise.all([rejected,b]);assert.equal(r.systemROM.bytes[256],2);assert.equal(calls.filter(c=>c[2]>0).length,1);
 const pending=r.setSystemROM(dump(r.board,3)),cancelled=assert.rejects(pending,/yeni bir istek/);await r.setSystemROM(null);await cancelled;
 assert.equal(r.romInfo().mode,'functional-service');assert.equal(r.romInfo().compatibility,'functional-model');
});
test('v069 accepted exclusions do not claim physical completeness or hide partial models',()=>{
 assert.equal(STM_SCOPE_POLICY.profile,'functional-simulator');assert.equal(STM_SCOPE_POLICY.physicalSiliconEquivalent,false);
 assert.equal(STM_SCOPE_POLICY.originalROMRequired,false);assert.equal(STM_SCOPE_POLICY.cycleExactRequired,false);
 assert.ok(Object.isFrozen(STM_SCOPE_POLICY));assert.ok(Object.isFrozen(STM_SCOPE_POLICY.deferred));
 assert.ok(STM_SCOPE_POLICY.deferred.includes('silicon-cycle-equivalence'));
 assert.ok(STM_SCOPE.some(r=>r[1]==='Kısmi model'));assert.ok(STM_SCOPE.some(r=>r[1]==='Destekleniyor'));assert.ok(STM_SCOPE.some(r=>r[1]==='Çipte yok'));
});
