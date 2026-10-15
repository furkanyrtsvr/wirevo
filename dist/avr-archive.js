// GNU/SysV indexed ar archive. AVR linker extracts only object members needed
// by real symbol references, instead of retaining every library constructor.
const encoder=new TextEncoder(),decoder=new TextDecoder();
export function elfDefinedSymbols(bytes){
  if(bytes.length<52||bytes[0]!==127||bytes[1]!==69||bytes[2]!==76||bytes[3]!==70||bytes[4]!==1||bytes[5]!==1)throw Error('ELF32 object geçersiz.');
  const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),offset=d.getUint32(32,true),size=d.getUint16(46,true),count=d.getUint16(48,true);if(size<40||offset+size*count>bytes.length)throw Error('ELF object bölüm tablosu geçersiz.');
  const section=i=>{if(i>=count)throw Error('ELF string section geçersiz.');const a=offset+i*size;return{type:d.getUint32(a+4,true),offset:d.getUint32(a+16,true),size:d.getUint32(a+20,true),link:d.getUint32(a+24,true),entry:d.getUint32(a+36,true)};};
  const names=[];
  for(let i=0;i<count;i++){const s=section(i);if(s.type!==2)continue;const strings=section(s.link);if(s.entry!==16||s.size%16||strings.type!==3||s.offset+s.size>bytes.length||strings.offset+strings.size>bytes.length)throw Error('ELF object sembol tablosu geçersiz.');
    for(let at=s.offset;at<s.offset+s.size;at+=16){const binding=bytes[at+12]>>4,index=d.getUint16(at+14,true),nameOffset=d.getUint32(at,true);if(![1,2].includes(binding)||!index||!nameOffset)continue;if(nameOffset>=strings.size)throw Error('ELF sembol adı geçersiz.');let end=strings.offset+nameOffset;while(end<strings.offset+strings.size&&bytes[end])end++;if(end===strings.offset+strings.size)throw Error('ELF sembol adı sonlandırılmadı.');names.push(decoder.decode(bytes.subarray(strings.offset+nameOffset,end)));}
  }return names;
}
export function indexedAVRArchive(objects){
  const entries=[],longNames=[],memberNames=[];let longSize=0;
  for(let i=0;i<objects.length;i++){const o=objects[i],name=o.path.split('/').at(-1);if(!/^[A-Za-z0-9_.-]+$/.test(name))throw Error('Archive object adı geçersiz.');if(name.length>15){memberNames.push('/'+longSize);const b=encoder.encode(name+'/\n');longNames.push(b);longSize+=b.length;}else memberNames.push(name+'/');for(const symbol of elfDefinedSymbols(o.bytes))entries.push({member:i,name:encoder.encode(symbol+'\0')});}
  const align=n=>n+(n&1),symbolSize=4+entries.length*4+entries.reduce((n,e)=>n+e.name.length,0),offsets=[];let total=8+60+align(symbolSize)+(longSize?60+align(longSize):0);
  for(const o of objects){offsets.push(total);total+=60+align(o.bytes.length);}const result=new Uint8Array(total);result.set(encoder.encode('!<arch>\n'));let cursor=8;
  const append=(name,bytes)=>{const header=name.padEnd(16)+'0'.padEnd(12)+'0'.padEnd(6)+'0'.padEnd(6)+'100644'.padEnd(8)+String(bytes.length).padEnd(10)+'`\n';if(header.length!==60)throw Error('Archive header sınırı.');result.set(encoder.encode(header),cursor);cursor+=60;result.set(bytes,cursor);cursor+=bytes.length;if(bytes.length&1)result[cursor++]=10;};
  const symbols=new Uint8Array(symbolSize),table=new DataView(symbols.buffer);table.setUint32(0,entries.length);let namesAt=4+entries.length*4;entries.forEach((e,i)=>{table.setUint32(4+i*4,offsets[e.member]);symbols.set(e.name,namesAt);namesAt+=e.name.length;});append('/',symbols);
  if(longSize){const b=new Uint8Array(longSize);let at=0;for(const n of longNames){b.set(n,at);at+=n.length;}append('//',b);}objects.forEach((o,i)=>append(memberNames[i],o.bytes));return result;
}
