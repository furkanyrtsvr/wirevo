import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createCipheriv,createDecipheriv} from 'node:crypto';
import {compileNRF52} from '../src/nrf52-compiler.js';
import {NRF52Runtime} from '../dist/nrf52-runtime.js';
import {NimbleSession} from '../dist/nrf52-nimble-session.js';
import {NRF52_BOARDS} from '../dist/nrf52-boards.js';
import {createNRF52Project} from '../dist/nrf52-project.js';
const module=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
await NRF52Runtime.initialize(readFileSync(new URL('../dist/nrf52-cpu.wasm',import.meta.url)));
const hostImage=readFileSync(new URL('../dist/nrf52-nimble-host.bin',import.meta.url));
const pause=()=>new Promise(resolve=>setImmediate(resolve));
async function setup(board='nrf52840-supermini',transform=s=>s){const project=createNRF52Project({board,starter:'nimble'}),f=await compileNRF52(module,transform(project.code),board,project.files),r=await new NRF52Runtime(f.image,board).load();r.attachCircuit(project);r.setDebugInfo(f.debugInfo);const session=await NimbleSession.create(r,hostImage);return{r,session,project,f};}
async function until(x,fn,label){for(let i=0;i<16000&&!fn();i++){x.r.step(1000);x.session.step(1000);await pause();}assert.ok(fn(),label+' '+JSON.stringify(x.session.snapshot()));}
const command=(x,action,extra={})=>x.r.keyboard.host({transport:'ble',action,...extra});
const key=(x,id,pressed)=>{x.project.components.find(c=>c.id===id).params.pressed=pressed;x.r.circuit.update(x.project);};
async function connect(x){await until(x,()=>x.r.hci.advertising&&x.session.peer.hci.public[1],'advertising + actual central sync');command(x,'connect');await until(x,()=>x.session.snapshot().pairing,'SMP Numeric Comparison');const s=x.session.snapshot();assert.equal(s.deviceCode,s.receiverCode);assert.match(s.deviceCode,/^\d{6}$/);assert.equal(s.authenticated,false);assert.equal(s.unauthenticatedReadError,0x105,'ATT refuses protected Report Map before authentication');}
async function confirm(x){command(x,'confirm',{accept:true});await until(x,()=>x.r.keyboard.ble.subscribed,'encrypted authenticated CCCD subscription');assert.equal(x.session.snapshot().bonded,true);assert.equal(x.session.snapshot().reportMap.length,63);}
for(const board of Object.keys(NRF52_BOARDS))test('114 actual NimBLE SMP/GATT + GPIO HIDS, RAM bond reconnect: '+board,async()=>{
 const x=await setup(board);try{
  await connect(x);key(x,'keyA',true);for(let i=0;i<30;i++){x.r.step(1000);x.session.step(1000);}assert.equal(x.r.keyboard.ble.text,'','no input before confirmation');key(x,'keyA',false);
  await confirm(x);key(x,'keyA',true);await until(x,()=>x.r.keyboard.ble.text==='a','encrypted A notification');const count=x.r.keyboard.ble.reports;for(let i=0;i<40;i++){x.r.step(1000);x.session.step(1000);}assert.equal(x.r.keyboard.ble.reports,count,'held GPIO does not flood notifications');
  key(x,'keyA',false);await until(x,()=>!x.r.keyboard.ble.report[2],'release');key(x,'keyShift',true);key(x,'keyB',true);await until(x,()=>x.r.keyboard.ble.text==='aB','shift B');key(x,'keyShift',false);key(x,'keyB',false);await until(x,()=>!x.r.keyboard.ble.report[2],'release shift');
  command(x,'leds',{value:2});await until(x,()=>x.r.hci.public[7]===2,'encrypted GATT output report');await until(x,()=>x.r.pinStates()[x.r.board.ledPin].high===!x.r.board.ledChannels[0].activeLow,'board LED reacts after GATT callback returns');
  command(x,'subscribe',{enabled:false});await until(x,()=>!x.r.hci.public[6],'real CCCD disable');key(x,'keyA',true);for(let i=0;i<100;i++){x.r.step(1000);x.session.step(1000);}assert.equal(x.r.keyboard.ble.text,'aB');command(x,'subscribe',{enabled:true});await until(x,()=>x.r.keyboard.ble.text==='aBA','CCCD resume + Caps Lock state');key(x,'keyA',false);
  command(x,'disconnect');await until(x,()=>x.r.hci.advertising&&!x.session.peer.hci.public[3],'disconnect callbacks');command(x,'connect');await until(x,()=>x.r.keyboard.ble.subscribed,'bonded session reconnect without another confirmation');assert.equal(x.session.snapshot().pairing,false);
  const snapshot=JSON.stringify(x.r.keyboard.snapshot());assert.ok(!/pendingKey|privateKey|session_schedule|identities/.test(snapshot));assert.ok(x.session.snapshot().encryptedPackets>4);
  x.r.reset();assert.equal(x.r.nimbleSession,null);assert.equal(x.r.hci.enabled,false,'reset requires fresh pairing; no fake persisted bond');
 }finally{x.r.dispose();}
});
test('114 rejecting numeric comparison keeps HID unauthenticated',async()=>{const x=await setup();try{await connect(x);command(x,'confirm',{accept:false});await until(x,()=>!!x.session.snapshot().error,'pairing failure callback');key(x,'keyA',true);for(let i=0;i<100;i++){x.r.step(1000);x.session.step(1000);}assert.equal(x.r.keyboard.ble.reports,0);assert.equal(x.session.snapshot().authenticated,false);assert.throws(()=>command(x,'leds',{value:2}),/doğrulanmış/);}finally{x.r.dispose();}});
async function attack(replay){const x=await setup(),frames=[];let config;try{
 const packet=x.r.hci.packet.bind(x.r.hci);x.r.hci.packet=(kind,b)=>{if(kind===8)config=Buffer.from(b);packet(kind,b);};x.r.hci.onFrame=f=>{if(f.encrypted)frames.push(f.bytes);};
 await connect(x);await confirm(x);
 // An independent OpenSSL implementation validates the C TinyCrypt CCM frame.
 const aes=createCipheriv('aes-128-ecb',config.subarray(0,16).reverse(),null);aes.setAutoPadding(false);const sk=Buffer.concat([aes.update(config.subarray(16,32).reverse()),aes.final()]);
 const frame=Buffer.from(frames[0]),iv=Buffer.alloc(13);iv[4]=0x80;config.copy(iv,5,32,40);const decipher=createDecipheriv('aes-128-ccm',sk,iv,{authTagLength:4});decipher.setAuthTag(frame.subarray(-4));decipher.setAAD(Buffer.from([2]),{plaintextLength:frame.length-8});const plain=Buffer.concat([decipher.update(frame.subarray(4,-4)),decipher.final()]);assert.ok(plain.length>=5);
 const bad=[...frames.at(-1)];if(!replay)bad[bad.length-1]^=1;x.session.peer.hci.packet(0x82,bad);
 await until(x,()=>!x.r.hci.connected,'MIC/replay disconnect');assert.ok(x.session.peer.hci.trace.includes('MIC FAILURE'));assert.equal(x.r.keyboard.ble.subscribed,false);
 }finally{x.r.dispose();}}
test('114 C AES-CCM agrees with independent implementation; corrupted MIC is rejected',()=>attack(false));
test('114 replayed encrypted packet is rejected by implicit packet counter',()=>attack(true));
test('114 LE SC-only port rejects short encryption keys instead of falling through',async()=>{const x=await setup();try{
 await until(x,()=>x.r.hci.advertising&&x.session.peer.hci.public[1],'ready');const peer=x.session.peer.hci,acl=peer.acl.bind(peer);peer.acl=(b,e)=>{if(!e&&b[6]===6&&b[7]===0&&b[8]===1){b=[...b];b[12]=7;}return acl(b,e);};command(x,'connect');await until(x,()=>!!x.session.snapshot().error,'short key pairing rejected');assert.equal(x.session.snapshot().authenticated,false);assert.equal(x.r.keyboard.ble.reports,0);
 }finally{x.r.dispose();}});
test('114 SC-only rejects a peer that omits Secure Connections',async()=>{const x=await setup();try{
 await until(x,()=>x.r.hci.advertising&&x.session.peer.hci.public[1],'ready');const peer=x.session.peer.hci,acl=peer.acl.bind(peer);peer.acl=(b,e)=>{if(!e&&b[6]===6&&b[7]===0&&b[8]===1){b=[...b];b[11]&=~8;}return acl(b,e);};command(x,'connect');await until(x,()=>!!x.session.snapshot().error,'non-SC pairing rejected');assert.equal(x.session.snapshot().authenticated,false);assert.equal(x.r.keyboard.ble.reports,0);
 }finally{x.r.dispose();}});
test('114 newly implemented wide REV family executes inside the ARM CPU',async()=>{
 const source='#include <stdint.h>\nvolatile uint32_t word,half,signed_half,done;int main(void){uint32_t a=0x11223384,b;__asm volatile("rev.w %0,%1":"=r"(b):"r"(a));word=b;__asm volatile("rev16.w %0,%1":"=r"(b):"r"(a));half=b;__asm volatile("revsh.w %0,%1":"=r"(b):"r"(a));signed_half=b;done=1;while(1){}}';
 const f=await compileNRF52(module,source),r=await new NRF52Runtime(f.image,'nrf52840-supermini').load();r.setDebugInfo(f.debugInfo);const v=n=>r.debugger.readVariable(f.debugInfo.variables.find(v=>v.name===n)).value;try{r.step(10000);assert.equal(v('done'),1);assert.equal(v('word')>>>0,0x84332211);assert.equal(v('half')>>>0,0x22118433);assert.equal(v('signed_half')>>>0,0xffff8433);}finally{r.dispose();}
});
test('114 encrypted link cannot silently downgrade to plaintext ACL',async()=>{const x=await setup();try{await connect(x);await confirm(x);x.r.hci.acl([1,0,4,0,0,0,4,0],false);assert.equal(x.r.hci.connected,false);assert.ok(x.r.hci.trace.includes('PLAINTEXT REJECTED'));assert.equal(x.session.snapshot().authenticated,false);}finally{x.r.dispose();}});

test('114 hosted compiler loads the SDK beside itself at the public root',async()=>{
 const text=readFileSync(new URL('../dist/nrf52-compiler.js',import.meta.url),'utf8');const imports=[...text.matchAll(/import\(["']([^"']*nrf52-nimble-sdk\.js)["']\)/g)];assert.equal(imports.length,1);const url=new URL(imports[0][1],'https://wirevo.example/nrf52-compiler.js');assert.equal(url.pathname,'/nrf52-nimble-sdk.js','public static root must not gain a /dist directory');const file=new URL('../dist/'+url.pathname.slice(1),import.meta.url);assert.ok(readFileSync(file).length>1000);
});
