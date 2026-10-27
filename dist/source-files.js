import {boardKey,projectBoard} from './board-hardware.js';
import {normalizeLibraries} from './libraries.js';
// User-owned sources only. The Arduino core and compiler live upstream.
export function normalizeFiles(files,{language='arduino',build=false}={}){
  const main=language==='c'?'main.c':language==='cpp'?'main.cpp':language==='micropython'?'main.py':'sketch.ino';
  if(!Array.isArray(files)||!files.length||files.length>16)throw Error('1–16 kaynak dosyası desteklenir.');
  let bytes=0;const seen=new Set();
  const normalized=files.map(f=>{
    if(!f||typeof f.name!=='string'||f.name.length>100||!(/^([A-Za-z_][\w-]*\/)*[A-Za-z_][\w.-]*\.(ino|cpp|c|h|hpp|py)$/.test(f.name)||build&&language==='c'&&/^([A-Za-z_][\w-]*\/)*(CMakeLists\.txt|[A-Za-z_][\w.-]*\.cmake|[A-Za-z_][\w.-]*\.h\.in)$/.test(f.name))||f.name.split('/').some(p=>p==='.'||p==='..')||seen.has(f.name.toLowerCase()))throw Error('Dosya adı geçersiz veya yineleniyor.');
    if(['c','cpp'].includes(language)&&['cf_hal.h','stdint.h','stdio.h','stddef.h','stdbool.h',...(language==='cpp'?['stdlib.h','string.h']:[])].includes(f.name))throw Error('Bu başlık derleyici tarafından sağlanır: '+f.name);if(language==='micropython'&&f.name==='machine.py')throw Error('machine.py devre modeli tarafından sağlanır.');seen.add(f.name.toLowerCase());if(typeof f.content!=='string')throw Error('Kaynak kod geçersiz.');bytes+=new TextEncoder().encode(f.content).length;
    return{name:f.name,content:f.content};
  });
  if(bytes>100000)throw Error('Kaynak dosyaları toplam 100 KB sınırını aşıyor.');
  if(!normalized.some(f=>f.name===main)||normalized.filter(f=>f.name.endsWith('.ino')).length!==(language==='arduino'?1:0)||normalized.some(f=>language==='micropython'?!f.name.endsWith('.py'):language==='c'?/\.(ino|cpp|py)$/.test(f.name):language==='cpp'?/\.(ino|py)$/.test(f.name):/\.(c|py)$/.test(f.name)))throw Error('Ana kaynak '+main+' olmalı; ek dosyalar seçilen dile uygun olmalı.');
  return normalized;
}
export function projectFiles(p){return normalizeFiles([{name:mainFile(p),content:p.code},...(p.files||[])],{language:p.language||'arduino',build:projectBoard(p).architecture==='pico'});}
export function sourceKey(p){const files=projectFiles(p).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0);if(projectBoard(p).architecture==='pico')return JSON.stringify({board:boardKey(p),language:p.language,architecture:p.settings?.picoArchitecture||'arm',pythonEngine:p.settings?.picoPythonEngine||'wasm',buildEngine:p.settings?.picoBuildEngine||'browser',sdkTarget:p.settings?.picoSDKTarget||'',core:'wirevo-pico-sdk-bridge-0.95',files});if(projectBoard(p).architecture==='tiva')return JSON.stringify({board:boardKey(p),language:p.language,core:'wirevo-tiva-c-0.1',files});if(projectBoard(p).architecture==='stm32')return JSON.stringify({board:boardKey(p),language:p.language,core:p.language==='micropython'?'cf-stm32-python-0.1':'cf-stm32-0.20',files});return JSON.stringify(p.language&&p.language!=='arduino'?{board:boardKey(p),language:p.language,files}:boardKey(p)==='uno'?(p.libraries===undefined?files:{files,libraries:normalizeLibraries(p.libraries)}):{board:boardKey(p),files,...(p.libraries!==undefined?{libraries:normalizeLibraries(p.libraries)}:{})});}
export function firmwareMatches(p){try{if(p.language==='micropython'&&p.firmware?.payload!==p.code)return false;return !!p.firmware&&(p.firmware.board||'uno')===boardKey(p)&&(p.firmware.imported||(p.firmware.sourceKey?p.firmware.sourceKey===sourceKey(p):p.libraries===undefined&&!(p.files?.length)&&p.firmware.source===p.code));}catch{return false;}}
export function fileContent(p,name){return name===mainFile(p)?p.code:p.files?.find(f=>f.name===name)?.content;}
export function setFileContent(p,name,content){if(name===mainFile(p))p.code=content;else{const f=p.files?.find(f=>f.name===name);if(!f)throw Error('Dosya bulunamadı.');f.content=content;}}

export const mainFile=p=>p.language==='c'?'main.c':p.language==='cpp'?'main.cpp':p.language==='micropython'?'main.py':'sketch.ino';
