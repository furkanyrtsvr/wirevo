// Virtual single-link LE HCI. Real NimBLE ATT/GATT/SMP runs in each ARM CPU.
// Internal encrypted ACL frames are not an over-the-air Nordic RADIO model.
const BASE=0x5fffb000;
const le16=n=>[n&255,n>>>8&255];
export class NimbleHCI{
 constructor(r,role=0){this.r=r;this.role=role;this.enabled=false;this.events=[];this.busy=false;this.ptr=0;this.n=0;this.result=0;this.trace=[];this.public={};this.address=[role?2:1,0,0,0,0,0xc0];this.epoch=0;this.keys=new Map();}
 log(s){this.trace.push(s);this.trace=this.trace.slice(-128);}
 owns(a){return a>=BASE&&a<BASE+256;}
 read(a){const packet=this.events[0];return({0:0x424c0114,4:(packet?1:0)|(this.busy?0x80000000:0),8:packet?.bytes.length||0,12:packet?.kind||0,16:this.ptr,20:this.n,28:this.result,32:this.role,36:Math.floor(this.r.count/64000)})[a-BASE]||0;}
 write(a,v){switch(a-BASE){case 16:this.ptr=v>>>0;break;case 20:this.n=v>>>0;break;case 24:this.command(v);break;default:throw Error('HCI bridge write '+(a-BASE));}}
 packet(kind,bytes){if(this.events.length>=64)throw Error('HCI RX queue overflow');this.events.push({kind,bytes:[...bytes]});}
 event(event,data){this.packet(4,[event,data.length,...data]);}
 complete(op,params=[]){this.event(14,[1,...le16(op),0,...params]);}
 status(op,status=0){this.event(15,[status,1,...le16(op)]);}
 command(op){this.result=0;if(op===1){this.enabled=true;return;}if(op===5)throw Error('NimBLE C assertion line '+this.n);if(op===7){this.log('MIC FAILURE');this.disconnect(0x3d);return;}if(this.busy)throw Error('HCI busy');const p=this.ptr,n=this.n;if(n>512||p<0x20000000||p+n>0x20040000)throw Error('HCI buffer');this.busy=true;const epoch=this.epoch;if(op===12){if(n!==96)throw Error('P256 key buffer');this.nativeKey(p,epoch);return;}if(op===4){const e=this.events.shift();if(!e||e.bytes.length!==n)throw Error('HCI RX length');this.r.dmaWrite(p,e.bytes,()=>{if(this.epoch===epoch)this.busy=false;});}else this.r.dmaRead(p,n,bytes=>{if(this.epoch!==epoch)return;if(op===13){if(n!==128)throw Error('P256 DH buffer');this.nativeDH(p,bytes,epoch);return;}this.busy=false;if(op===2)this.hci(bytes);else if(op===3||op===8)this.acl(bytes,op===8);else if(op===6){this.public[bytes[0]]=(bytes[1]|bytes[2]<<8|bytes[3]<<16|bytes[4]<<24)>>>0;}else if(op===9)this.onNotification?.(bytes);else if(op===10)this.reportMap=[...bytes];else throw Error('HCI bridge operation '+op);});}
 async nativeKey(p,epoch){try{const pair=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);const raw=new Uint8Array(await crypto.subtle.exportKey('raw',pair.publicKey)),jwk=await crypto.subtle.exportKey('jwk',pair.privateKey);const d=Uint8Array.from(atob(jwk.d.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));const priv=[...d].reverse();const out=[...raw.slice(1,33)].reverse().concat([...raw.slice(33)].reverse(),priv);if(epoch!==this.epoch)return;this.keys.clear();this.keys.set(priv.join(','),pair.privateKey);this.r.dmaWrite(p,out,()=>{if(epoch===this.epoch)this.busy=false;});}catch(e){if(epoch!==this.epoch)return;this.result=3;this.busy=false;this.log('P256 key error');}}
 async nativeDH(p,bytes,epoch){try{const own=this.keys.get(bytes.slice(64,96).join(','));if(!own)throw Error('Unknown private key');const raw=Uint8Array.from([4,...bytes.slice(0,32).reverse(),...bytes.slice(32,64).reverse()]);const peer=await crypto.subtle.importKey('raw',raw,{name:'ECDH',namedCurve:'P-256'},false,[]);const bits=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:peer},own,256));if(epoch!==this.epoch)return;this.r.dmaWrite(p+96,[...bits].reverse(),()=>{if(epoch===this.epoch)this.busy=false;});}catch(e){if(epoch!==this.epoch)return;this.result=3;this.busy=false;this.log('P256 peer rejected');}}
 hci(b){const op=b[0]|b[1]<<8,p=b.slice(3);this.log('CMD '+op.toString(16));switch(op){
 case 0x202d:case 0x0c03:case 0x0c01:case 0x0c63:case 0x2001:case 0x200b:case 0x200c:case 0x2008:case 0x2009:case 0x2006:this.complete(op);break;
 case 0x2027:{this.identities??=new Map();const id=p.slice(0,7).join(',');if(this.identities.size>=4&&!this.identities.has(id)){this.event(14,[1,...le16(op),7]);break;}this.identities.set(id,p.slice(7));this.complete(op);break;}
 case 0x2028:this.identities?.delete(p.slice(0,7).join(','));this.complete(op);break;
 case 0x2029:this.identities?.clear();this.complete(op);break;
 case 0x1001:this.complete(op,[9,1,0,9,255,255,1,0]);break;
 case 0x1002:this.complete(op,Array(64).fill(0));break;
 case 0x1003:this.complete(op,[0,0,0,0,0x60,0,0,0]);break;
 case 0x2003:this.complete(op,[1,0,0,0,0,0,0,0]);break;
 case 0x2002:this.complete(op,[251,0,8]);break;
 case 0x1005:this.complete(op,[251,0,0,8,0,0,0]);break;
 case 0x1009:this.complete(op,this.address);break;
 case 0x2018:this.complete(op,crypto.getRandomValues(new Uint8Array(8)));break;
 case 0x2005:this.randomAddress=p;this.complete(op);break;
 case 0x200a:this.advertising=!!p[0];this.complete(op);break;
 case 0x200d:{this.status(op);if(!this.peer?.advertising){this.log('No advertiser');break;}this.public[8]=this.peer.public[8]=0;this.connected=this.peer.connected=true;this.peer.advertising=false;const event=(c,role,peer)=>c.event(0x3e,[1,0,1,0,role,0,...peer.address,24,0,0,0,200,0,0]);event(this,0,this.peer);event(this.peer,1,this);break;}
 case 0x2016:this.status(op);this.event(0x3e,[4,0,1,0,1,0,0,0,0,0,0,0]);break;
 case 0x041d:this.status(op);this.event(0xc,[0,1,0,9,255,255,1,0]);break;
 case 0x2013:this.status(op);this.event(0x3e,[3,0,1,0,24,0,0,0,200,0]);break;
 case 0x2019:this.status(op);this.pendingKey=p.slice(12,28);this.peer.event(0x3e,[5,1,0,...p.slice(2,12)]);break;
 case 0x201a:{this.complete(op,[1,0]);const central=this.peer;if(!central.pendingKey||central.pendingKey.some((v,i)=>v!==p[i+2])){this.event(8,[6,1,0,0]);central.event(8,[6,1,0,0]);break;}const skd=Array.from(crypto.getRandomValues(new Uint8Array(16))),iv=Array.from(crypto.getRandomValues(new Uint8Array(8)));for(const c of [this,central]){c.packet(8,[...central.pendingKey,...skd,...iv]);c.encrypted=true;c.event(8,[0,1,0,1]);c.log('ENCRYPTION ON');}central.pendingKey=null;break;}
 case 0x201b:this.complete(op,[1,0]);this.peer?.event(8,[6,1,0,0]);break;
 case 0x0406:this.status(op);this.disconnect(p[2]);break;

 default:this.log('UNSUPPORTED '+op.toString(16));this.event(14,[1,...le16(op),1]);
 }}
 acl(b,encrypted=false){if(b.length<4||b.length>512||(b[2]|b[3]<<8)!==b.length-4)throw Error('HCI ACL length');if(this.encrypted&&!encrypted){this.log('PLAINTEXT REJECTED');this.disconnect(0x3d);return;}this.log((encrypted?'ENC':'ACL')+' '+b.length);this.txPackets=(this.txPackets||0)+1;if(encrypted)this.encryptedPackets=(this.encryptedPackets||0)+1;this.onFrame?.({encrypted,bytes:[...b]});if(this.peer?.connected){const rx=[...b];if((rx[1]&0x30)===0)rx[1]|=0x20;this.peer.packet(encrypted?0x82:2,rx);}this.event(0x13,[1,1,0,1,0]);}
 disconnect(reason=0x13){for(const c of [this,this.peer].filter(Boolean)){c.connected=false;c.encrypted=false;c.pendingKey=null;c.packet(10,[]);c.event(5,[0,1,0,reason]);}}
 dispose(){this.epoch++;this.keys.clear();this.identities?.clear();this.pendingKey=null;this.events=[];this.peer=null;this.onNotification=null;this.onFrame=null;}

}
