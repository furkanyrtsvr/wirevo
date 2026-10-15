import {TOOLCHAIN_POLICY} from './toolchain-policy.js';
import {ToolchainCache} from './toolchain-cache.js';
import {APP_CACHE as APP,APP_SHELL_LIMIT} from './app-shell.js';
const META='circuitforge-offline-settings-v1',root=new URL('./',self.location.href),modeKey=new URL('__offline_mode__',root).href;
const tools=new ToolchainCache({policy:TOOLCHAIN_POLICY,storage:caches});let mode,warmer=null,shellList=[];
const getMode=()=>mode??=(async()=>{const r=await(await caches.open(META)).match(modeKey);return r?(await r.json()).offline:false;})();
async function setMode(offline){if(offline&&(!(await tools.status()).ready||!await(await caches.open(APP)).match(root)))throw Error('Önce derleyici dosyalarını hazırlayın.');await(await caches.open(META)).put(modeKey,Response.json({offline}));mode=Promise.resolve(offline);}
async function shell(){if(!shellList.length){const r=await fetch(new URL('app-cache-list.json',root),{cache:'no-store'});if(!r.ok)throw Error('Uygulama listesi yüklenemedi.');shellList=await r.json();}const cache=await caches.open(APP);let size=0;
 for(const path of shellList){if(!/^[a-zA-Z0-9._/-]+$/.test(path)||path.includes('..'))throw Error('Cache yolu geçersiz.');const url=new URL(path,root),r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('Uygulama dosyası alınamadı: '+path);const bytes=await r.arrayBuffer();size+=bytes.byteLength;if(size>APP_SHELL_LIMIT)throw Error('Uygulama cache boyutu aşıldı.');await cache.put(url,new Response(bytes,{headers:r.headers}));}
 const index=await cache.match(new URL('index.html',root));await cache.put(root,index.clone());await cache.put(new URL('roadmap',root),await cache.match(new URL('roadmap.html',root)));return true;
}
self.addEventListener('install',e=>e.waitUntil((async()=>{try{await shell();}catch(error){await caches.delete(APP);throw error;}await self.skipWaiting();})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('circuitforge-app-')&&name!==APP)await caches.delete(name);await self.clients.claim();for(const client of await self.clients.matchAll())client.postMessage({type:'shell-ready',cache:APP});})()));
self.addEventListener('fetch',e=>{const url=e.request.url;if(e.request.method!=='GET')return;
 if(url.startsWith(TOOLCHAIN_POLICY.base)){e.respondWith((async()=>{try{return await tools.get(url,{offline:await getMode()});}catch(error){return new Response(error.message,{status:503,headers:{'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'}});}})());return;}
 if(new URL(url).origin!==root.origin)return;
 e.respondWith((async()=>{const cache=await caches.open(APP),key=new URL(url);key.search='';if(await getMode())return(await cache.match(key))||new Response('Çevrimdışı: uygulama dosyası eksik.',{status:503});try{return await fetch(e.request);}catch{return(await cache.match(key))||new Response('Bağlantı yok; önbelleği hazırlayın.',{status:503});}})());
});
self.addEventListener('message',e=>{const p=e.ports[0];if(!p)return;e.waitUntil((async()=>{try{const action=e.data?.action;let result;
 if(action==='status')result={...await tools.status(),offline:await getMode(),shellReady:!!await(await caches.open(APP)).match(root)};
 else if(action==='mode'){await setMode(!!e.data.offline);result={offline:await getMode()};}
 else if(action==='warm'){if(warmer)throw Error('İndirme zaten sürüyor.');if(await getMode())throw Error('İndirme için çevrimiçi modu seçin.');const controller=warmer=new AbortController();try{await shell();result=await tools.warm({signal:controller.signal,onProgress:data=>p.postMessage({progress:data})});}finally{warmer=null;}}
 else if(action==='cancel'){warmer?.abort();result={cancelled:true};}
 else if(action==='clear'){if(warmer)throw Error('Önce indirmeyi iptal edin.');await setMode(false);await tools.clear();result=await tools.status();}
 else throw Error('Bilinmeyen cache işlemi.');p.postMessage({ok:true,result});
 }catch(error){p.postMessage({ok:false,error:error.message});}})());});
