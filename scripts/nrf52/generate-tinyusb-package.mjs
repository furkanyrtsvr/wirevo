import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../src/vendor/tinyusb-0.18.0/',import.meta.url),files={};
async function visit(url,prefix=''){for(const e of (await readdir(url,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){if(e.isDirectory())await visit(new URL(e.name+'/',url),prefix+e.name+'/');else if(/\.[ch]$/.test(e.name))files[prefix+e.name]=(await readFile(new URL(e.name,url),'utf8')).replace(/\r\n/g,'\n');}}
await visit(root);
await writeFile(new URL('../../dist/nrf52-tinyusb-sources.js',import.meta.url),'// TinyUSB 0.18.0, MIT. Unmodified upstream sources.\nexport const TINYUSB_FILES='+JSON.stringify(files)+';\n');
const hashes=Object.fromEntries(Object.entries(files).map(([p,s])=>[p,createHash('sha256').update(s).digest('hex')]));
await writeFile(new URL('../../dist/notices/TINYUSB-SOURCES.json',import.meta.url),JSON.stringify({version:'0.18.0',source:'https://github.com/hathach/tinyusb/tree/0.18.0/src',license:'MIT',hashEncoding:'UTF-8 LF',files:hashes},null,2)+'\n');
console.log('TinyUSB 0.18.0:',Object.keys(files).length,'upstream files packaged');
