// DWARF v4, emitted by our Clang -O0 profile. No source interpretation.
const decoder=new TextDecoder();
class Reader{
 constructor(bytes,pos=0){this.b=bytes;this.p=pos;this.v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);}
 u8(){return this.v.getUint8(this.p++);} u16(){const n=this.v.getUint16(this.p,true);this.p+=2;return n;} u32(){const n=this.v.getUint32(this.p,true);this.p+=4;return n;}
 str(){const s=this.p;while(this.u8()){}return decoder.decode(this.b.subarray(s,this.p-1));}
 leb(signed=false){let n=0,shift=0,c;do{c=this.u8();n+=(c&127)*2**shift;shift+=7;if(shift>49)throw Error('DWARF LEB sınırı.');}while(c&128);return signed&&(c&64)?n-2**shift:n;}
 block(n){const b=Array.from(this.b.subarray(this.p,this.p+n));this.p+=n;return b;}
}
export function readDebugELF(bytes,sourceFiles){
 const r=new Reader(bytes),v=r.v,sections={},table=v.getUint32(32,true),size=v.getUint16(46,true),count=v.getUint16(48,true),names=table+v.getUint16(50,true)*size,strings=bytes.subarray(v.getUint32(names+16,true),v.getUint32(names+16,true)+v.getUint32(names+20,true));
 for(let i=0;i<count;i++){const h=table+i*size,n=new Reader(strings,v.getUint32(h,true)).str();sections[n]=bytes.subarray(v.getUint32(h+16,true),v.getUint32(h+16,true)+v.getUint32(h+20,true));}
 const lines=[],dies=[],byOffset=new Map(),lineData=sections['.debug_line']||new Uint8Array();
 const resolve=(dir,name)=>{const path=(dir?dir+'/':'')+name;return sourceFiles.find(f=>path===f||path.endsWith('/'+f))||null;};
 const l=new Reader(lineData);
 while(l.p<lineData.length){const end=l.u32()+l.p,version=l.u16();if(version!==4)throw Error('DWARF satır sürümü desteklenmiyor: '+version);const headerEnd=l.u32()+l.p,min=l.u8(),max=l.u8(),defaultStmt=l.u8(),base=(l.u8()<<24)>>24,range=l.u8(),opcodeBase=l.u8(),lengths=[0];for(let i=1;i<opcodeBase;i++)lengths.push(l.u8());const dirs=[''];for(let s;(s=l.str());)dirs.push(s);const files=[null];const readFile=()=>{const name=l.str();if(!name)return false;const dir=dirs[l.leb()];l.leb();l.leb();files.push(resolve(dir,name));return true;};while(readFile()){}l.p=headerEnd;let address=0,line=1,file=1,column=0,stmt=defaultStmt,opIndex=0;
 const emit=endSequence=>{lines.push({address,file:files[file],line,column,end:!!endSequence,stmt:!!stmt});};
 const advance=n=>{address+=min*Math.floor((opIndex+n)/max);opIndex=(opIndex+n)%max;};
 while(l.p<end){const op=l.u8();if(!op){const n=l.leb(),stop=l.p+n,ext=l.u8();if(ext===1){emit(true);address=0;line=1;file=1;column=0;stmt=defaultStmt;opIndex=0;}else if(ext===2){address=l.u32();opIndex=0;}else if(ext===3)readFile();l.p=stop;}else if(op>=opcodeBase){const adjusted=op-opcodeBase;advance(Math.floor(adjusted/range));line+=base+adjusted%range;emit(false);}else switch(op){case 1:emit(false);break;case 2:advance(l.leb());break;case 3:line+=l.leb(true);break;case 4:file=l.leb();break;case 5:column=l.leb();break;case 6:stmt=!stmt;break;case 8:advance(Math.floor((255-opcodeBase)/range));break;case 9:address+=l.u16();opIndex=0;break;default:for(let i=0;i<lengths[op];i++)l.leb();}}l.p=end;
 }
 const info=sections['.debug_info']||new Uint8Array(),abbrev=sections['.debug_abbrev'],str=sections['.debug_str'];const d=new Reader(info);
 while(d.p<info.length){const unit=d.p,end=d.u32()+d.p,version=d.u16(),abbrevOffset=d.u32(),addressSize=d.u8();if(version!==4||addressSize!==4)throw Error('DWARF bilgi profili desteklenmiyor.');const a=new Reader(abbrev,abbrevOffset),defs=new Map();for(let code;(code=a.leb());){const tag=a.leb(),children=a.u8(),attrs=[];for(;;){const at=a.leb(),form=a.leb();if(!at&&!form)break;attrs.push([at,form]);}defs.set(code,{tag,children,attrs});}
 const formValue=form=>{switch(form){case 1:return d.u32();case 3:return d.block(d.u16());case 4:return d.block(d.u32());case 5:return d.u16();case 6:return d.u32();case 7:{const lo=d.u32(),hi=d.u32();return lo+hi*4294967296;}case 8:return d.str();case 9:return d.block(d.leb());case 10:return d.block(d.u8());case 11:case 12:return d.u8();case 13:return d.leb(true);case 14:return new Reader(str,d.u32()).str();case 15:return d.leb();case 16:return d.u32();case 17:return unit+d.u8();case 18:return unit+d.u16();case 19:return unit+d.u32();case 21:return unit+d.leb();case 22:return formValue(d.leb());case 23:return d.u32();case 24:return d.block(d.leb());case 25:return 1;default:throw Error('DWARF formu desteklenmiyor: '+form);}};
 const parents=[];while(d.p<end){const offset=d.p,code=d.leb();if(!code){parents.pop();continue;}const def=defs.get(code);if(!def)throw Error('DWARF abbreviation bulunamadı.');const attrs={},forms={};for(const[at,f]of def.attrs){attrs[at]=formValue(f);forms[at]=f;}const die={offset,tag:def.tag,attrs,forms,parent:parents.at(-1)?.offset};dies.push(die);byOffset.set(offset,die);if(def.children)parents.push(die);}d.p=end;
 }
 const bounds=die=>{for(let p=die;p;p=byOffset.get(p.parent)){const a=p.attrs;if(a[17]!==undefined&&a[18]!==undefined)return[a[17],p.forms[18]===1?a[18]:a[17]+a[18]];}return null;};
 const typeOf=(ref,depth=0)=>{if(depth>12)return{name:'?',size:0};const t=byOffset.get(ref);if(!t)return{name:'?',size:0};const a=t.attrs;if([22,38,53,55].includes(t.tag))return typeOf(a[73],depth+1);if(t.tag===15)return{name:'pointer',size:a[11]||4,encoding:7};if(t.tag===36||t.tag===4)return{name:a[3]||'enum',size:a[11]||4,encoding:a[62]||5};return{name:a[3]||'aggregate',size:a[11]||0,encoding:0};};
 const variables=dies.filter(d=>[52,5].includes(d.tag)&&d.attrs[3]).flatMap(d=>{let p=byOffset.get(d.parent),frame,local=false,cu;while(p){if(p.tag===46){frame=p.attrs[64];local=true;}if(p.tag===17)cu=p;p=byOffset.get(p.parent);}if(!sourceFiles.some(f=>cu?.attrs[3]===f||cu?.attrs[3]?.endsWith('/'+f)))return[];return[{name:d.attrs[3],type:typeOf(d.attrs[73]),location:d.attrs[2],frame,scope:local?bounds(d):null,parameter:d.tag===5}];});
 // Keep sequence boundaries so gaps and generated runtime code cannot inherit a user's line.
 const rows=lines.sort((a,b)=>a.address-b.address);return{version:1,lines:rows.map((x,i)=>({...x,to:rows[i+1]?.address??x.address+2})).filter(x=>x.file&&!x.end&&x.line>0&&x.to>x.address),variables};
}
