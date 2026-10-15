import {crc32} from './project-zip.js';
export const ZIP_LIMITS={archive:2000000,expanded:2000000,entries:64};
const fail=message=>{throw Error('ZIP: '+message);};
const utf8=new TextDecoder('utf-8',{fatal:true});
const safeName=name=>name.length<=200&&!/[\\:\x00-\x1f\x7f]/.test(name)&&!name.startsWith('/')&&name.replace(/\/$/,'').split('/').every(p=>p&&p!=='.'&&p!=='..');
/** ZIP32 stored/deflate; no filesystem extraction, no multi-disk/ZIP64/encryption.
 * Central/local agreement, bounded streaming output and CRC before returning. */
export async function readZip(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
 if(bytes.length<22||bytes.length>ZIP_LIMITS.archive)fail('arşiv en fazla 2 MB olabilir.');
 const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),range=(at,size)=>{if(!Number.isSafeInteger(at)||at<0||size<0||at+size>bytes.length)fail('kesilmiş arşiv.');};
 let end=-1;for(let at=bytes.length-22;at>=Math.max(0,bytes.length-65557);at--)if(d.getUint32(at,true)===0x06054b50&&at+22+d.getUint16(at+20,true)===bytes.length){end=at;break;}
 if(end<0)fail('merkez dizin bulunamadı.');
 const count=d.getUint16(end+10,true),centralSize=d.getUint32(end+12,true),centralOffset=d.getUint32(end+16,true);
 if(d.getUint16(end+4,true)||d.getUint16(end+6,true)||d.getUint16(end+8,true)!==count||count===65535||centralOffset===0xffffffff||centralSize===0xffffffff)fail('ZIP64 veya çok diskli arşiv desteklenmiyor.');
 if(!count||count>ZIP_LIMITS.entries||centralOffset+centralSize!==end)fail('dizin boyutu veya dosya sınırı geçersiz.');
 let at=centralOffset,total=0;const entries=[],names=new Set(),ranges=[];
 for(let i=0;i<count;i++){
  range(at,46);if(d.getUint32(at,true)!==0x02014b50)fail('merkez kayıt geçersiz.');
  const flags=d.getUint16(at+8,true),method=d.getUint16(at+10,true),crc=d.getUint32(at+16,true),packed=d.getUint32(at+20,true),size=d.getUint32(at+24,true),nameLength=d.getUint16(at+28,true),extraLength=d.getUint16(at+30,true),commentLength=d.getUint16(at+32,true),local=d.getUint32(at+42,true),external=d.getUint32(at+38,true);
  range(at+46,nameLength+extraLength+commentLength);
  if(flags&~0x080e||flags&1||![0,8].includes(method)||method===0&&(flags&6)||d.getUint16(at+34,true)||packed===0xffffffff||size===0xffffffff||local===0xffffffff)fail('şifreleme veya sıkıştırma türü desteklenmiyor.');
  const rawName=bytes.subarray(at+46,at+46+nameLength);
  if(!(flags&0x800)&&rawName.some(b=>b>127))fail('dosya adı UTF-8 olmalı.');
  let name;try{name=utf8.decode(rawName);}catch{fail('dosya adı UTF-8 değil.');}
  const normalized=name.normalize('NFC').toLowerCase();if(!safeName(name)||names.has(normalized))fail('güvensiz veya yinelenen dosya yolu.');names.add(normalized);
  if((external>>>16&0xf000)===0xa000)fail('sembolik bağlantı desteklenmiyor.');
  total+=size;if(total>ZIP_LIMITS.expanded)fail('açılmış dosyalar 2 MB sınırını aşıyor.');
  range(local,30);if(d.getUint32(local,true)!==0x04034b50||d.getUint16(local+6,true)!==flags||d.getUint16(local+8,true)!==method)fail('yerel başlık eşleşmiyor.');
  const ln=d.getUint16(local+26,true),le=d.getUint16(local+28,true),start=local+30+ln+le,finish=start+packed;
  range(local+30,ln+le);range(start,packed);
  if(ln!==nameLength||rawName.some((b,j)=>bytes[local+30+j]!==b)||finish>centralOffset)fail('dosya adı veya veri aralığı eşleşmiyor.');
  if(!(flags&8)&&(d.getUint32(local+14,true)!==crc||d.getUint32(local+18,true)!==packed||d.getUint32(local+22,true)!==size))fail('yerel boyut/CRC eşleşmiyor.');
  let boundary=finish;
  if(flags&8){range(finish,12);const signed=d.getUint32(finish,true)===0x08074b50,descriptor=finish+(signed?4:0);range(descriptor,12);if(d.getUint32(descriptor,true)!==crc||d.getUint32(descriptor+4,true)!==packed||d.getUint32(descriptor+8,true)!==size)fail('veri tanımı eşleşmiyor.');boundary=descriptor+12;if(boundary>centralOffset)fail('veri tanımı dizini aşıyor.');}
  ranges.push([local,boundary]);entries.push({name,method,crc,size,start,finish});at+=46+nameLength+extraLength+commentLength;
 }
 if(at!==end)fail('dizin uzunluğu eşleşmiyor.');
 ranges.sort((a,b)=>a[0]-b[0]);for(let i=1;i<ranges.length;i++)if(ranges[i][0]<ranges[i-1][1])fail('çakışan dosya aralıkları.');
 const result=new Map();
 for(const e of entries){
  const packed=bytes.subarray(e.start,e.finish);let content;
  if(e.method===0){if(packed.length!==e.size)fail('dosya boyutu eşleşmiyor.');content=packed;}
  else{
   let stream;try{stream=new DecompressionStream('deflate-raw');}catch{fail('bu tarayıcı Deflate ZIP açamıyor.');}
   const reader=new Blob([packed]).stream().pipeThrough(stream).getReader(),parts=[];let length=0;
   try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>e.size||length>ZIP_LIMITS.expanded){await reader.cancel();fail('sıkıştırılmış veri boyut sınırını aşıyor.');}parts.push(value);}if(length!==e.size)fail('açılmış boyut eşleşmiyor.');}
   catch(error){await reader.cancel().catch(()=>{});if(error.message?.startsWith('ZIP:'))throw error;throw Error('ZIP: Deflate verisi geçersiz.');}finally{reader.releaseLock();}
   content=new Uint8Array(length);let offset=0;for(const part of parts){content.set(part,offset);offset+=part.length;}
  }
  if(crc32(content)!==e.crc)fail('CRC doğrulaması başarısız: '+e.name);
  if(e.name.endsWith('/')){if(content.length)fail('klasör verisi geçersiz.');continue;}
  let text;try{text=utf8.decode(content);}catch{fail('dosya UTF-8 değil: '+e.name);}result.set(e.name,text);
 }
 return result;
}
