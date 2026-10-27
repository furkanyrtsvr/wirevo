import {validateNativeSDKImage} from './pico-sdk-image.js';
import {validatePicoImage} from './pico-image.js';
import {isPico} from './unified-project.js';
import {validateTivaImage} from './tiva-image.js';
import {validateSTMImage} from './stm32-image.js';
import {projectBoard} from './board-hardware.js';
import {readZip,ZIP_LIMITS} from './zip-reader.js';
import {validateProject} from './core.js';
import {projectFiles,normalizeFiles,firmwareMatches,mainFile} from './source-files.js';
import {isNative as isESP,isSTM,isTiva,migrateESPProject,decodeBytes} from './unified-project.js';
import {parseESPProject} from './esp-project.js';
import {validateESPImage} from './esp-boards.js';
import {normalizeLibraries} from './libraries.js';
import {parseHex} from './uno-runtime.js';
import {projectZip} from './project-zip.js';
export function exportProjectZip(project){
 const p=validateProject(project),entries=projectFiles(p);entries.push({name:'circuit.json',content:JSON.stringify(p,null,2)});
 if(p.libraries)entries.push({name:'libraries.json',content:JSON.stringify(p.libraries,null,2)});
 if(firmwareMatches(p)){validFirmware(p);if(!isESP(p))entries.push({name:'firmware.hex',content:p.firmware.hex});}
 return projectZip(entries);
}
function sourceSnapshot(project){return JSON.stringify(projectFiles(project).sort((a,b)=>a.name.localeCompare(b.name,'en')));}
function validHex(hex,project){parseHex(hex,{flashSize:projectBoard(project).mcu==='ATmega2560'?262144:32768});if(hex.length>800000)throw Error('HEX dosyası çok büyük.');}
function validFirmware(p){if(!p.firmware)return;if(isPico(p)&&p.language==='micropython'){if(p.firmware.payload!==p.firmware.source)throw Error('Python programı kaynakla eşleşmiyor.');return;}if(isPico(p)&&p.firmware.format==='pico-sdk-bin'){validateNativeSDKImage(decodeBytes(p.firmware.payload),p.firmware.board);return;}if(isPico(p)){validatePicoImage(decodeBytes(p.firmware.payload),p.firmware.board);return;}if(isTiva(p)){validateTivaImage(decodeBytes(p.firmware.payload));return;}if(isSTM(p)){if(p.language==='micropython'){if(p.firmware.payload!==p.firmware.source)throw Error('Python programı kaynakla eşleşmiyor.');}else validateSTMImage(decodeBytes(p.firmware.payload),p.firmware.board);return;}if(!isESP(p))return validHex(p.firmware.hex,p);if(p.firmware.format==='esp-bin')validateESPImage(decodeBytes(p.firmware.payload),p.firmware.board,{bootFromROM:!!p.firmware.bootFromROM});else if(p.firmware.payload!==p.firmware.source)throw Error('Python programı kaynakla eşleşmiyor.');}
function projectJSON(text,name){const raw=parseJSON(text,name);return validateProject(raw.format==='circuitforge-esp'?migrateESPProject(parseESPProject(text)):raw);}
function parseJSON(text,name){try{return JSON.parse(text);}catch{throw Error(name+': JSON verisi geçersiz.');}}
/** Parsing never mutates the current project or browser storage. Sources in the
 * ZIP are authoritative, cached firmware is kept only when its source matches. */
export async function importProjectBytes(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);if(bytes.length>ZIP_LIMITS.archive)throw Error('Proje dosyası en fazla 2 MB olabilir.');
 const zip=bytes.length>=4&&bytes[0]===80&&bytes[1]===75;
 if(!zip){let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw Error('Proje UTF-8 değil.');}const project=projectJSON(text,'Proje');validFirmware(project);return{project,format:'JSON',warnings:[]};}
 let entries=await readZip(bytes);const warnings=[];
 if(!entries.has('circuit.json')){
  const candidates=[...entries.keys()].filter(k=>k.endsWith('/circuit.json'));if(candidates.length!==1)throw Error('ZIP: circuit.json bulunamadı.');
  const prefix=candidates[0].slice(0,-'circuit.json'.length);
  if([...entries.keys()].some(k=>!k.startsWith(prefix)))throw Error('ZIP: dosyalar tek proje klasöründe olmalı.');entries=new Map([...entries].map(([k,v])=>[k.slice(prefix.length),v]));
 }
 const raw=projectJSON(entries.get('circuit.json'),'circuit.json'),sources=[];
 const originalKey=sourceSnapshot(raw);
 for(const [name,content]of entries){if(['circuit.json','firmware.hex','libraries.json'].includes(name))continue;if(!(/\.(ino|cpp|c|h|hpp|py)$/.test(name)||isPico(raw)&&raw.language==='c'&&/(?:^|\/)(?:CMakeLists\.txt|[\w.-]+\.cmake|[\w.-]+\.h\.in)$/.test(name)))throw Error('ZIP: desteklenmeyen proje dosyası: '+name);sources.push({name,content});}
 const files=normalizeFiles(sources,{language:raw.language||'arduino',build:isPico(raw)});raw.code=files.find(f=>f.name===mainFile(raw)).content;raw.files=files.filter(f=>f.name!==mainFile(raw));
 if(entries.has('libraries.json')){const libraries=normalizeLibraries(parseJSON(entries.get('libraries.json'),'libraries.json'));if(raw.libraries&&JSON.stringify(normalizeLibraries(raw.libraries))!==JSON.stringify(libraries))throw Error('ZIP: kütüphane manifestleri eşleşmiyor.');raw.libraries=libraries;raw.schemaVersion=5;}
 const project=validateProject(raw),external=entries.get('firmware.hex');if(external!==undefined){if(isESP(project))throw Error('ESP projesinde AVR HEX kullanılamaz.');validHex(external,project);}validFirmware(project);
 if(external!==undefined&&project.firmware&&external!==project.firmware.hex)throw Error('ZIP: HEX ve devre firmware verisi eşleşmiyor.');
 if(project.firmware&&(originalKey!==sourceSnapshot(project)||!firmwareMatches(project))){delete project.firmware;warnings.push('Kaynak değişmiş; HEX yeniden derlenecek.');}
 else if(external!==undefined&&!project.firmware)warnings.push('HEX kaynak eşleşmesi yok; yeniden derlenecek.');
 return{project,format:'ZIP',warnings};
}
