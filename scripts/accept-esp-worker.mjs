import {Worker} from 'node:worker_threads';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {ESP_BOARDS} from '../dist/esp-boards.js';
import {createUnifiedProject} from '../dist/unified-project.js';
const fixtures=JSON.parse(await readFile('tests/fixtures/esp-board-profiles.json'));
const records=[];
for(const board of (process.argv.slice(2).length?process.argv.slice(2):Object.keys(ESP_BOARDS)))for(const language of ['arduino','c','micropython']){
 const worker=new Worker(new URL('./esp-worker-harness.mjs',import.meta.url),{type:'module'}),queue=[];let waits=[],error;
 worker.on('message',data=>{queue.push(data);for(const w of [...waits])if(w.p(data)){waits=waits.filter(x=>x!==w);clearTimeout(w.timer);w.resolve(data);}});
 worker.on('error',e=>{error=e;for(const w of waits){clearTimeout(w.timer);w.reject(e);}waits=[];});
 const next=p=>new Promise((resolve,reject)=>{if(error)return reject(error);const w={p,resolve,reject,timer:setTimeout(()=>{waits=waits.filter(x=>x!==w);reject(Error('worker timeout '+board+' '+language+' '+JSON.stringify(queue.slice(-2))));},15000)};waits.push(w);});
 const send=async(data,p)=>{const awaited=next(d=>d.type==='error'||p(d));worker.postMessage(data);const r=await awaited;if(r.type==='error')throw Error(r.message);return r;};
 try{
  if(!queue.some(d=>d.type==='harness-ready'))await next(d=>d.type==='harness-ready');
  const p=createUnifiedProject({board,language}),f=fixtures[board+':'+language];if(f){p.code=f.source;p.files=f.files;}
  if(language==='micropython'){await send({type:'check',chip:board,source:p.code,project:p},d=>d.type==='checked');}
  const ready=await send({type:'load',hex:language==='micropython'?p.code:f.bin,chip:board,language,circuit:p,circuitId:1,files:p.files||[],pins:[p.settings.probe],traceId:1},d=>d.type==='ready');assert.equal(ready.running,false);
  const running=await send({type:'run'},d=>d.type==='snapshot'&&d.running);assert.ok(running.cycles>0||language==='micropython');
  const paused=await send({type:'pause'},d=>d.type==='snapshot'&&!d.running);assert.equal(paused.running,false);
  if(language!=='micropython'){
   const stepped=await send({type:'step'},d=>d.type==='snapshot'&&!d.running&&d.cycles>paused.cycles);assert.ok(stepped.cycles>paused.cycles);
   const reset=await send({type:'reset',circuit:p,circuitId:1,traceId:2},d=>d.type==='snapshot'&&d.cycles===0);assert.equal(reset.running,false);
   const again=await send({type:'run'},d=>d.type==='snapshot'&&d.running&&d.cycles>0);assert.ok(again.cycles>0);
  }else{
   // The UI resets Python by terminating its VM; prove a blocked loop is terminable.
   await worker.terminate();const blocked=new Worker(new URL('./esp-worker-harness.mjs',import.meta.url),{type:'module'});
   try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('blocked worker load timeout')),15000);blocked.on('error',reject);blocked.on('message',d=>{if(d.type==='harness-ready')blocked.postMessage({type:'load',hex:'while True:\n    pass\n',chip:board,language,circuit:p,circuitId:1});if(d.type==='ready'){clearTimeout(timer);blocked.postMessage({type:'run'});resolve();}if(d.type==='error'){clearTimeout(timer);reject(Error(d.message));}});});
    // Permit the worker to enter its synchronous loop; the main thread remains responsive.
    await new Promise(resolve=>setTimeout(resolve,30));await blocked.terminate();
   }finally{await blocked.terminate();}
  }
  records.push({board,language,status:'passed',load:true,run:true,pause:true,step:language!=='micropython',reset:language!=='micropython',terminate:true,blockedPythonTerminable:language==='micropython'});console.log('PASS',board,language);
 }catch(e){records.push({board,language,status:'failed',error:e.message});console.log('FAIL',board,language,e.message);}finally{await worker.terminate();await writeFile('docs/esp32-worker-acceptance.json',JSON.stringify(records,null,2));}
}
assert.ok(records.every(r=>r.status==='passed'));console.log('WORKER CASES',records.length);
