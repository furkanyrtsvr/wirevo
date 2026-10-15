export const TOOL_CACHE='circuitforge-toolchain-0.2.0-v1',TOOL_LIMIT=64*1024*1024;
export class ToolchainCache {
  constructor({policy,storage,fetcher=(...args)=>fetch(...args),digest=bytes=>crypto.subtle.digest('SHA-256',bytes)}){this.policy=policy;this.storage=storage;this.fetcher=fetcher;this.digest=digest;this.inflight=new Map();this.total=policy.files.reduce((n,f)=>n+f.size,0);if(this.total>TOOL_LIMIT||policy.files.length>1000||new Set(policy.files.map(f=>f.path)).size!==policy.files.length)throw Error('Derleyici cache sınırı.');this.byURL=new Map(policy.files.map(f=>[new URL(f.path,policy.base).href,f]));}
  async verify(response,file){
    if(!response?.ok||response.type==='opaque')throw Error('Derleyici dosyası alınamadı: '+file.path);
    const reader=response.body.getReader(),chunks=[];let size=0;
    for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>file.size){await reader.cancel();throw Error('Derleyici boyutu değişti: '+file.path);}chunks.push(value);}
    if(size!==file.size)throw Error('Eksik derleyici dosyası: '+file.path);
    const bytes=new Uint8Array(size);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length;}
    const hash=Array.from(new Uint8Array(await this.digest(bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==file.sha256)throw Error('Derleyici sağlama toplamı: '+file.path);
    return new Response(bytes,{headers:{'Content-Type':response.headers.get('Content-Type')||'application/octet-stream','Access-Control-Allow-Origin':'*','X-CircuitForge-Verified':hash}});
  }
  async get(url,{offline=false,signal}={}){
    url=String(url);const file=this.byURL.get(url);if(!file)throw Error('Sabit toolchain dışında dosya.');
    const cache=await this.storage.open(TOOL_CACHE),hit=await cache.match(url);
    if(hit){try{return await this.verify(hit,file);}catch{await cache.delete(url);}}
    if(offline)throw Error('Çevrimdışı: önbellekte eksik '+file.path);
    if(!this.inflight.has(url))this.inflight.set(url,(async()=>{const result=await this.verify(await this.fetcher(url,{signal,cache:'no-store',credentials:'omit'}),file);await cache.put(url,result.clone());return result;})().finally(()=>this.inflight.delete(url)));
    return(await this.inflight.get(url)).clone();
  }
  async status(){const c=await this.storage.open(TOOL_CACHE);let count=0,bytes=0;for(const f of this.policy.files)if(await c.match(new URL(f.path,this.policy.base).href)){count++;bytes+=f.size;}return{count,bytes,total:this.policy.files.length,totalBytes:this.total,ready:count===this.policy.files.length};}
  async warm({onProgress=()=>{},signal}={}){let index=0,completed=0,failure;const task=async()=>{try{while(index<this.policy.files.length&&!failure){if(signal?.aborted)throw new DOMException('İndirme iptal edildi.','AbortError');const f=this.policy.files[index++];await this.get(new URL(f.path,this.policy.base).href,{signal});completed++;onProgress({count:completed,total:this.policy.files.length});}}catch(error){failure??=error;}};await Promise.all(Array.from({length:6},task));if(failure)throw failure;return this.status();}
  async clear(){await this.storage.delete(TOOL_CACHE);}
}
