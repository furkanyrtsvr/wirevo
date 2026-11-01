import {NRF52Runtime} from './nrf52-runtime.js';
import {NIMBLE_HOST_SHA256} from './nrf52-nimble-host-integrity.js';
// The receiver is a second ARM CPU running a pinned, actual NimBLE central C app.
export class NimbleSession{
 static async create(runtime,image){
  const session=new NimbleSession(runtime);runtime.nimbleSession=session;
  try{image??=new Uint8Array(await(await fetch(new URL('./nrf52-nimble-host.bin',import.meta.url))).arrayBuffer());
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',image)),b=>b.toString(16).padStart(2,'0')).join('');
   if(hash!==NIMBLE_HOST_SHA256)throw Error('NimBLE alıcı firmware bütünlük kontrolü başarısız.');
   const peer=await new NRF52Runtime(image,'nrf52840-supermini').load();
   if(session.disposed||runtime.hci!==session.controller){peer.dispose();return session;}
   session.peer=peer;peer.hci.role=1;peer.hci.address=[2,0,0,0,0,0xc0];runtime.hci.peer=peer.hci;peer.hci.peer=runtime.hci;
   peer.hci.onNotification=bytes=>{if(!session.secure())return;const ch=runtime.keyboard.ble,leds=ch.leds;runtime.keyboard.accept(ch,bytes);if(ch.leds!==leds)peer.hci.packet(9,[2,ch.leds]);};
   session.refresh();return session;
  }catch(e){session.dispose();if(runtime.nimbleSession===session)runtime.nimbleSession=null;throw e;}
 }
 constructor(runtime){this.r=runtime;this.controller=runtime.hci;this.peer=null;this.disposed=false;}
 secure(){return !!(this.peer&&this.controller.connected&&this.peer.hci.connected&&(this.controller.public[5]&3)===3&&(this.peer.hci.public[5]&3)===3);}
 step(n){if(this.peer&&!this.disposed){this.peer.step(n);this.refresh();}}
 refresh(){const p=this.controller,c=this.peer?.hci,ch=this.r.keyboard.ble;
  ch.backend='Apache NimBLE 1.8.0 / real SMP + GATT / virtual encrypted HCI';ch.name='Wirevo BLE Keyboard';ch.initialized=!!(p.enabled&&c?.public[1]);ch.advertising=!!p.advertising;ch.connected=!!(p.connected&&c?.connected);ch.subscribed=!!(this.secure()&&p.public[6]&&c?.public[6]);
  if(!ch.connected)ch.report=Array(8).fill(0);
  if(p.public[7]!==undefined)ch.leds=p.public[7];
 }
 host(d){const p=this.controller,c=this.peer?.hci,ch=this.r.keyboard.ble;this.refresh();
  switch(d.action){
   case 'connect':if(!c?.public[1]||!p.advertising||p.connected)throw Error('Önce NimBLE firmware’ini çalıştırıp reklam yayınının hazır olmasını bekleyin.');c.packet(9,[3,1]);break;
   case 'confirm':if(!p.public[12]||!c?.public[12])throw Error('İki tarafın doğrulama kodunu bekleyin.');if(![true,false].includes(d.accept))throw Error('Eşleştirmeyi kabul veya reddedin.');if(d.accept&&p.public[4]!==c.public[4])throw Error('Doğrulama kodları uyuşmuyor. Eşleştirmeyi reddedin.');p.packet(9,[1,+d.accept]);c.packet(9,[1,+d.accept]);break;
   case 'disconnect':if(p.connected)p.disconnect();break;
   case 'leds':if(!this.secure()||!Number.isInteger(d.value)||d.value<0||d.value>31)throw Error('LED raporu için doğrulanmış şifreli bağlantı ve 0..31 gerekir.');c.packet(9,[2,d.value]);break;
   case 'subscribe':if(!this.secure())throw Error('Önce güvenli eşleştirmeyi tamamlayın.');c.packet(9,[4,+!!d.enabled]);break;
   case 'clear':ch.text='';ch.events=[];break;
   default:throw Error('Bu işlem NimBLE HIDS profilinde desteklenmiyor.');
  }
 }
 snapshot(){this.refresh();const p=this.controller,c=this.peer?.hci;return{enabled:p.enabled,backend:'Apache NimBLE 1.8.0 / ARM C / virtual HCI',ready:!!c?.public[1],connected:!!p.connected,pairing:!!(p.public[12]&&c?.public[12]),deviceCode:p.public[12]?String(p.public[4]??0).padStart(6,'0'):null,receiverCode:c?.public[12]?String(c.public[4]??0).padStart(6,'0'):null,encrypted:!!p.encrypted,authenticated:this.secure(),bonded:!!(this.secure()&&(p.public[5]&4)&&(c?.public[5]&4)),bondStorage:'RAM; reset/reload clears keys',error:p.public[8]||c?.public[8]||0,unauthenticatedReadError:c?.public[11]??null,reportMap:c?.reportMap?[...c.reportMap]:[],encryptedPackets:(p.encryptedPackets||0)+(c?.encryptedPackets||0),trace:[...p.trace.slice(-12).map(s=>'Device: '+s),...(c?.trace.slice(-12)||[]).map(s=>'Receiver: '+s)]};}
 dispose(){if(this.disposed)return;this.disposed=true;this.controller.peer=null;this.peer?.dispose();this.peer=null;}
}
