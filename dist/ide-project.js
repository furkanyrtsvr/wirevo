import {projectFiles,normalizeFiles,mainFile} from './source-files.js';
export function mergeSourceFiles(project,incoming,{replace=false,prefix=''}={}){
 if(!Array.isArray(incoming)||!incoming.length)throw Error('İçe aktarılacak kaynak seçilmedi.');
 if(prefix&&!/^([A-Za-z_][\w-]*\/)*[A-Za-z_][\w-]*\/?$/.test(prefix))throw Error('Hedef klasör geçersiz.');
 const files=projectFiles(project).map(f=>({...f})),seen=new Set();
 for(const file of incoming){const name=(prefix?prefix.replace(/\/$/,'')+'/':'')+file.name;if(seen.has(name.toLowerCase()))throw Error('İçe aktarmada yinelenen dosya: '+name);seen.add(name.toLowerCase());const at=files.findIndex(f=>f.name.toLowerCase()===name.toLowerCase());if(at>=0&&!replace)throw Error('Dosya zaten var: '+name+'; değiştirme seçeneğiyle tekrar deneyin.');if(at>=0)files[at]={name:files[at].name,content:file.content};else files.push({name,content:file.content});}
 return normalizeFiles(files,{language:project.language||'arduino'});
}
export function includeLinks(project,name){
 const files=projectFiles(project),source=files.find(f=>f.name===name)?.content||'',directory=name.includes('/')?name.slice(0,name.lastIndexOf('/')+1):'',out=[];
 for(const m of source.matchAll(/^\s*#\s*include\s*([<"])([^>"\r\n]+)[>"]/gm)){
  const target=m[2],relative=directory+target,resolved=files.find(f=>f.name===relative)||files.find(f=>f.name===target);
  out.push({header:target,file:resolved?.name||null,line:source.slice(0,m.index).split('\n').length,local:m[1]==='"'});
 }return out;
}
export function debugText(project,snapshot,state){
 const pins=snapshot?.pins||{},rows=['Durum: '+state,'Kaynak: '+mainFile(project),'Model çevrimi (16 MHz): '+(Number.isFinite(snapshot?.cycles)?Math.floor(snapshot.cycles):'—'),'Model zamanı: '+(Number.isFinite(snapshot?.seconds)?snapshot.seconds.toFixed(6)+' s':'—'),...(snapshot?.debug?.registers?['CPU çevrimi: '+snapshot.debug.cpuCycles,'PC: 0x'+snapshot.debug.pc.toString(16),...snapshot.debug.registers.map((v,i)=>'R'+i+' = 0x'+(v>>>0).toString(16).padStart(8,'0'))]:[]),'','GPIO izleme (son worker örneği):'];
 for(const[name,p]of Object.entries(pins))if(p.mode==='OUTPUT'||p.mode==='INPUT_PULLUP'||p.outputEnabled)rows.push(name.padEnd(9)+String(p.mode||'—').padEnd(16)+(Number.isFinite(p.voltage)?p.voltage.toFixed(3)+' V':'—'));
 if(snapshot?.debug?.available){const d=snapshot.debug;rows.push('','Pico C · DWARF kaynak debugger',d.location?d.location.file+':'+d.location.line:'Kaynak dışı CPU adresi','Duruş: '+(d.reason||'manuel'));for(const v of [...(d.watches||[]),...(d.variables||[])])rows.push(v.name+' = '+(v.unavailable?'Kullanılamıyor: '+v.unavailable:String(v.value)));}else rows.push('','Kaynak debugger: Pico C için yeniden derleyin. Diğer mimarilerde henüz desteklenmiyor.');rows.push('◆ gezinme işaretidir; ● gerçek Pico breakpointidir.');return rows.join('\n');
}
