import {readZip} from './zip-reader.js';
import {PICO_BOARDS} from './pico-boards.js';
export const PACKAGE_FORMAT='wirevo-pico-source-v1';
const safe=s=>typeof s==='string'&&s.length<=180&&/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(s)&&s.split('/').every(x=>x!=='.'&&x!=='..');
export function validateSourcePackage(raw,board){
 if(!raw||raw.format!==PACKAGE_FORMAT||typeof raw.name!=='string'||!raw.name.trim()||raw.name.length>80)throw Error('Geçerli wirevo-pico-source-v1 paket tanımı gerekli. JSON tek başına SDK sağlamaz.');
 if(!Array.isArray(raw.boards)||!raw.boards.length||raw.boards.some(b=>!Object.hasOwn(PICO_BOARDS,b))||board&&!raw.boards.includes(board))throw Error('Paket seçilen Pico kartını desteklemiyor.');
 if(!Array.isArray(raw.files)||!raw.files.length||raw.files.length>60)throw Error('Paket 1–60 metin dosyası içermeli.');
 const seen=new Set();let bytes=0;const files=raw.files.map(f=>{if(!f||!safe(f.name)||!/\.(c|h)$/.test(f.name)||seen.has(f.name.toLowerCase())||typeof f.content!=='string'||f.content.includes('\0'))throw Error('Paket yalnız benzersiz, güvenli C / H kaynakları içerebilir.');seen.add(f.name.toLowerCase());bytes+=new TextEncoder().encode(f.content).length;return {name:f.name,content:f.content};}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0);
 if(bytes>1500000)throw Error('Paket kaynakları 1.5 MB sınırını aşıyor.');
 if(!Array.isArray(raw.includeDirs)||!raw.includeDirs.length||raw.includeDirs.length>16||raw.includeDirs.some(d=>d!=='.'&&!safe(d)))throw Error('Başlık klasörleri geçersiz.');
 if(!Array.isArray(raw.sources)||raw.sources.length>24||raw.sources.some(s=>!safe(s)||!s.endsWith('.c')||!files.some(f=>f.name===s))||new Set(raw.sources).size!==raw.sources.length)throw Error('Derlenecek C dosyaları pakette bulunmalı.');
 if(typeof raw.probe!=='string'||raw.probe.length>16000||!raw.probe.trim())throw Error('Paket bağımlılıklarını kullanan probe C kodu gerekli.');
 return {format:PACKAGE_FORMAT,name:raw.name.trim(),boards:[...new Set(raw.boards)].sort(),includeDirs:[...new Set(raw.includeDirs)],sources:[...raw.sources],probe:raw.probe,files};
}
export async function packageIdentity(raw){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(validateSourcePackage(raw))))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function packageFromEntries(entries,board){
 const manifests=[...entries].filter(([n])=>n==='wirevo-sdk.json'||n.endsWith('/wirevo-sdk.json'));
 if(manifests.length!==1)throw Error('Klasör / ZIP içinde tek wirevo-sdk.json gerekli. Ham resmi SDK arşivi otomatik kurulmaz; yardım bölümündeki kaynak paketi düzenini kullanın.');
 const prefix=manifests[0][0].slice(0,-'wirevo-sdk.json'.length);let m;try{m=JSON.parse(manifests[0][1]);}catch{throw Error('Paket tanımı JSON olarak okunamadı.');}
 if(!Array.isArray(m.files)||m.files.some(x=>typeof x!=='string'||!safe(x)))throw Error('JSON files listesi C/H dosya yolları içermeli.');
 return validateSourcePackage({...m,files:m.files.map(n=>{const content=entries.get(prefix+n);if(content===undefined)throw Error('Paket dosyası eksik: '+n);return {name:n,content};})},board);
}
export async function readSourcePackage(files,board){
 if(files.length===1&&files[0].name.endsWith('.zip')){if(files[0].size>2000000)throw Error('ZIP en fazla 2 MB olabilir.');return packageFromEntries(await readZip(new Uint8Array(await files[0].arrayBuffer())),board);}
 if(!files.length||files.length>64)throw Error('En fazla 64 dosyalık bir kaynak paketi seçin.');
 let total=0;const entries=new Map();for(const f of files){total+=f.size;if(total>2000000)throw Error('Seçilen paket en fazla 2 MB olabilir.');const name=f.webkitRelativePath||f.name;if(entries.has(name))throw Error('Yinelenen paket dosyası.');entries.set(name,await f.text());}return packageFromEntries(entries,board);
}
const session=new Map();
function database(){return new Promise((resolve,reject)=>{if(!globalThis.indexedDB)return reject(Error('Bu tarayıcı kalıcı paket saklamayı desteklemiyor.'));const r=indexedDB.open('wirevo-pico-source-packages',1);r.onupgradeneeded=()=>r.result.createObjectStore('packages');r.onerror=()=>reject(r.error);r.onsuccess=()=>resolve(r.result);});}
async function disk(mode,action){const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('packages',mode),r=action(tx.objectStore('packages'));let value;r.onsuccess=()=>value=r.result;tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
export async function saveSourcePackage(raw,remember=false){const p=validateSourcePackage(raw),id=await packageIdentity(p);if(remember)await disk('readwrite',s=>s.put(p,id));session.set(id,p);return {id,name:p.name};}
export async function loadSourcePackage(ref,board){if(!ref)return null;let p=session.get(ref.id);if(!p){try{p=await disk('readonly',s=>s.get(ref.id));}catch{}}if(!p)throw Error('Bu proje SDK kaynak paketi istiyor: '+ref.name+'. SDK paketi ekle bölümünden aynı klasör / ZIP dosyasını yeniden seçin veya Tarayıcı derleyicisi seçin.');p=validateSourcePackage(p,board);if(await packageIdentity(p)!==ref.id)throw Error('SDK paketi kimliği eşleşmiyor.');session.set(ref.id,p);return p;}
export async function removeSourcePackage(ref){if(!ref)return;session.delete(ref.id);try{await disk('readwrite',s=>s.delete(ref.id));}catch(e){if(globalThis.indexedDB)throw e;}}
