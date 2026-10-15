/** Real GCC WASM compilation. All source remains in the browser. */
import {normalizeFiles} from './source-files.js';
import {normalizeLibraries} from './libraries.js';
export const COMPILER_CDN='https://cdn.jsdelivr.net/npm/@horang-corp/avr-gcc-wasm@0.2.0/';
export function compileSketch(source,{assetsBase=COMPILER_CDN,timeout=120000,onProgress=()=>{},signal,libraries,board='uno'}={}) {
  if(libraries!==undefined){try{libraries=normalizeLibraries(libraries);}catch(e){return Promise.reject(e);}}
  let files=null;if(Array.isArray(source)){try{files=normalizeFiles(source);}catch(e){return Promise.reject(e);}}
  else if(typeof source!=='string'||source.length>100000) return Promise.reject(new Error('Kaynak kod geçersiz veya çok büyük.'));
  if(signal?.aborted)return Promise.reject(new DOMException('Derleme iptal edildi.','AbortError'));
  const base=new URL(String(assetsBase),import.meta.url);
  const worker=new Worker(new URL('./compiler-worker.js',import.meta.url),{type:'module'});
  const prepared='#include <Arduino.h>\n#line 1 "sketch.ino"\n'+source;
  return new Promise((resolve,reject)=>{
    let finished=false;
    const finish=(error,result)=>{if(finished)return;finished=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);worker.terminate();if(error)reject(error);else resolve(result);};
    const abort=()=>finish(new DOMException('Derleme iptal edildi.','AbortError'));
    const timer=setTimeout(()=>finish(new Error('Derleme süre sınırı aşıldı.')),timeout);
    signal?.addEventListener('abort',abort,{once:true});
    try{onProgress('GCC WebAssembly');}catch(error){finish(error);return;}
    if(signal?.aborted){abort();return;}
    worker.onmessage=event=>{
      if(event.data.progress){try{onProgress(event.data.progress);}catch(e){finish(e);}return;}
      const {ok,result,error}=event.data;
      if(!ok)return finish(new Error(error?.message||'Derleme başarısız.'));
      if(!result?.hex)return finish(new Error('Derleyici firmware üretmedi.'));
      if(result.fitsRam===false)return finish(new Error(`Statik SRAM ${result.staticRamBytes} bayt; SRAM sınırı ${result.ramLimit||2048} bayt.`));
      if(!result.fitsTarget)return finish(new Error(`Firmware ${result.flashBytes} bayt; Flash sınırı ${result.flashLimit||32256} bayt.`));
      finish(null,result);
    };
    worker.onerror=event=>finish(new Error(event.message||'Derleyici yüklenemedi.'));
    worker.postMessage({id:1,board,...(files?{files}:libraries!==undefined?{files:[{name:'sketch.ino',content:source}]}:{source:prepared}),...(libraries!==undefined?{libraries}:{}),sensors:[],assetsBase:String(base)});
  });
}
