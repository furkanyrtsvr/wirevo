// Explicit binary upgrade over the same USB SETUP/OUT/IN path as the panel.
// No direct access to the simulated Flash or implicit synthetic success.
export async function flashSTMDFU(command,bytes,{address=0x08000000,leave=true,log=()=>{}}={}){
 if(!(bytes instanceof Uint8Array)||bytes.length<8||bytes.length>524288||!Number.isInteger(address)||address<0x08000000||address+bytes.length>0x08080000)throw Error('DFU için geçerli Flash adresi ve 8..524288 bayt ham ARM .bin gerekli.');
 const checked=async(op,args={})=>{const p=await command(op,args);if(p.status!=='ACK')throw Error('DFU '+op+': '+p.status);return p;};
 await command('boot-system');const reset=await command('reset');if(reset.status!=='ACK')throw Error('Bu çipin fabrika ROM’unda USB DFU yok; F103 için USART boot kullanın.');
 const control=async(type,request,value=0,length=0,data=[])=>{await checked('setup',{data:[type,request,value&255,value>>>8,0,0,length&255,length>>>8]});if(type&128){const all=[];while(all.length<length){const p=await checked('in');all.push(...p.data);if(p.data.length<64)break;}await checked('out',{data:[]});return all;}for(let i=0;i<data.length;i+=64)await checked('out',{data:[...data.slice(i,i+64)]});await checked('in');return [];};
 const status=async()=>{for(let i=0;i<20;i++){const p=await control(0xa1,3,0,6);if(p[0]||p[4]===10)throw Error('DFU durum hatası '+p[0]);if(![3,4,6].includes(p[4]))return p[4];}throw Error('DFU işlem zaman aşımı.');},download=async(block,data)=>{await control(0x21,1,block,data.length,data);return status();};
 const pointer=async a=>download(0,[0x21,a&255,a>>>8&255,a>>>16&255,a>>>24&255]);
 await control(0,9,1);await pointer(address);await pointer(address+bytes.length-1+(bytes.length%2048===1?1:0));await download(0,[0x41]);
 for(let at=0;at<bytes.length;at+=2048){let part=bytes.slice(at,at+2048);if(part.length===1)part=Uint8Array.of(part[0],255);await pointer(address+at);await download(2,part);log('DFU '+Math.min(at+part.length,bytes.length)+'/'+bytes.length);}
 // AN3156 uses this request's transfer length in block addressing: reset the
 // pointer per read chunk, including a short final chunk, before verification.
 for(let at=0;at<bytes.length;at+=2048){await control(0x21,6);await pointer(address+at);await control(0x21,6);const n=Math.min(2048,bytes.length-at),read=await control(0xa1,2,2,Math.max(2,n));if(read.length!==Math.max(2,n)||read.slice(0,n).some((v,i)=>v!==bytes[at+i]))throw Error('DFU readback uyuşmazlığı: '+at);}
 await control(0x21,6);await download(0,[0x21,address&255,address>>>8&255,address>>>16&255,address>>>24&255]);if(leave){await control(0x21,1,0,0);const state=await control(0xa1,3,0,6);if(state[4]!==7)throw Error('DFU uygulamaya geçiş başarısız.');}return {bytes:bytes.length,address,verified:true};
}
