import {loadPicoROM} from './pico-rom-assets.js';
import {PicoROMRuntime} from './pico-rom-runtime.js';
import {parseROMUF2,programROMBlock,verifyROMFlash} from './pico-rom-uf2.js';
let runtime,busy=false,written=false,lastWrite=null;
self.onmessage=async({data:d})=>{
 if(busy){postMessage({type:'rom-error',message:'Özgün ROM işlemi sürüyor.'});return;}busy=true;
 try{
  if(d.type==='load'){runtime=null;written=false;lastWrite=null;runtime=new PicoROMRuntime(d.chip,d.automatic?await loadPicoROM(d.chip.startsWith('pico-2')?'RP2350':'RP2040'):new Uint8Array(d.rom));for(let i=0;i<400&&!runtime.usbHost.initialized;i++)runtime.step(10000);if(!runtime.usbHost.initialized){runtime=null;throw Error('ROM USB açılışı süre sınırını aştı.');}}
  else{
   if(!runtime)throw Error('Önce ROM dosyası seçin.');
   if(d.type==='command'){if(!['msc-capacity','msc-inquiry','msc-read'].includes(d.action))throw Error('Yazma için doğrulanan UF2 dosyası seçin.');const t=runtime.usbHost.command(d);for(let i=0;i<1500&&!t.done;i++)runtime.step(1000);if(!t.done||t.status!==0)throw Error('ROM USB işlemi tamamlanmadı.');}
   else if(d.type==='write'){
    if(written)throw Error('Bu ROM oturumu yüklendi. Flash’ı indirin; yeni yükleme için ROM dosyasını yeniden seçin.');
    const parsed=parseROMUF2(new Uint8Array(d.bytes),runtime.board);written=true;lastWrite=null;
    for(let i=0;i<parsed.blocks.length;i++){programROMBlock(runtime,parsed.blocks[i]);if((i+1)%16===0){postMessage({type:'rom-progress',done:i+1,total:parsed.blocks.length});await new Promise(resolve=>setTimeout(resolve,0));}}
    lastWrite=verifyROMFlash(runtime,parsed.pages);
   }else if(d.type==='export'){const bytes=runtime.rp.flash.slice(0,runtime.board.flashSize);postMessage({type:'rom-flash',bytes},[bytes.buffer]);return;}
   else throw Error('ROM komutu geçersiz.');
  }
  postMessage({type:'rom-snapshot',...runtime.snapshot(),lastWrite});
 }catch(e){postMessage({type:'rom-error',message:e.message});}finally{busy=false;}
};
