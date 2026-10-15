export function normalizeESPFiles(source,files=[]){
 if(!Array.isArray(files)||files.length>15)throw Error('En fazla 16 kaynak dosyası desteklenir.');const seen=new Set();let bytes=0;
 const result=[{name:'sketch.ino',content:source},...files].map(f=>{if(!f||typeof f.name!=='string'||f.name.length>100||!/^([A-Za-z_][\w-]*\/)*[A-Za-z_][\w.-]*\.(ino|cpp|h|hpp)$/.test(f.name)||f.name.split('/').some(p=>p==='.'||p==='..')||seen.has(f.name.toLowerCase())||['arduino.h','wire.h','spi.h'].includes(f.name.split('/').at(-1).toLowerCase())||typeof f.content!=='string')throw Error('Kaynak dosya adı veya içeriği geçersiz.');seen.add(f.name.toLowerCase());bytes+=new TextEncoder().encode(f.content).length;return{name:f.name,content:f.content};});
 if(result.filter(f=>f.name.endsWith('.ino')).length!==1||bytes>100000)throw Error('Tek sketch.ino ve toplam 100 KB kaynak sınırı geçerlidir.');return result;
}
export function espSourceKey(chip,source,files=[]){return JSON.stringify({chip,files:normalizeESPFiles(source,files).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)});}
