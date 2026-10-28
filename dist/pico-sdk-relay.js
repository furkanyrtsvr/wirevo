// Explicit, user-opened local companion window. No network permission or security settings are changed.
let active=null;
const ORIGIN='https://wirevo-furka.equalwood4.chatgpt.site';
export function closeSDKRelay(){active?.close();active=null;}
export function relayPath(path,method){return method==='GET'&&(path==='/v1/status'||/^\/v1\/jobs\/[0-9a-f-]{36}\?cursor=\d+$/.test(path))||method==='POST'&&(path==='/v1/jobs'||/^\/v1\/jobs\/[0-9a-f-]{36}\/cancel$/.test(path));}
export function openSDKRelay(connection,{host=window,timeoutMs=20000}={}){
 closeSDKRelay();if(host.location.origin!==ORIGIN&&!['http://127.0.0.1:4173','http://localhost:4173'].includes(host.location.origin))return Promise.reject(Error('SDK bağlantı penceresi bu sitede kullanılamaz.'));
 const origin='http://127.0.0.1:'+connection.port,nonce=crypto.randomUUID();
 return new Promise((resolve,reject)=>{let popup,timer,watch,ready=false,closed=false;const pending=new Map();
  function close(){if(closed)return;closed=true;clearTimeout(timer);clearInterval(watch);host.removeEventListener('message',receive);for(const p of pending.values())p.fail(Error('Yerel SDK bağlantı penceresi kapandı.'));pending.clear();try{popup?.close();}catch{}if(active?.nonce===nonce)active=null;if(!ready)reject(Error('Yerel SDK bağlantı penceresi açılamadı veya zaman aşımına uğradı. Yardımcı açık olmalı; açılır pencereye izin verip yeniden bağlanın.'));}
  function receive(event){if(event.origin!==origin||event.source!==popup||event.data?.nonce!==nonce)return;const m=event.data;
   if(m.type==='wirevo-sdk-ready'){popup.postMessage({type:'wirevo-sdk-pair',nonce,token:connection.token},origin);return;}
   if(m.type==='wirevo-sdk-paired'){if(ready)return;if(m.error){reject(Error(m.error));close();return;}if(m.status?.protocol!==1||m.status?.engine!=='official-pico-sdk'){reject(Error('SDK yardımcısının sürümü uyumlu değil.'));close();return;}ready=true;clearTimeout(timer);active={nonce,port:connection.port,token:connection.token,close,request};resolve(m.status);return;}
   if(m.type==='wirevo-sdk-response'){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.fail(Error(m.error)):p.done(m.data);}
  }
  function request(path,{method='GET',body,signal}={}){if(closed||popup.closed)return Promise.reject(Error('Yerel SDK bağlantı penceresi kapandı. Yeniden bağlanın.'));if(!relayPath(path,method))return Promise.reject(Error('SDK işlem yolu geçersiz.'));if(signal?.aborted)return Promise.reject(new DOMException('İptal edildi.','AbortError'));const id=crypto.randomUUID();return new Promise((done,fail)=>{let timeout;const cleanup=()=>{clearTimeout(timeout);signal?.removeEventListener('abort',abort);pending.delete(id);},abort=()=>{cleanup();fail(new DOMException('İptal edildi.','AbortError'));};pending.set(id,{done:d=>{cleanup();done(d);},fail:e=>{cleanup();fail(e);}});signal?.addEventListener('abort',abort,{once:true});timeout=setTimeout(()=>{cleanup();fail(Error('SDK penceresi yanıt vermedi. Yeniden bağlanın.'));},30000);popup.postMessage({type:'wirevo-sdk-request',nonce,id,path,method,body},origin);});}
  host.addEventListener('message',receive);popup=host.open(origin+'/sdk-connect#'+nonce,'wirevo-sdk-'+nonce,'popup,width=540,height=360');if(!popup){close();return;}timer=setTimeout(close,timeoutMs);watch=setInterval(()=>{if(popup.closed)close();},300);
 });
}
export function requestSDKRelay(connection,path,options){if(!active||active.port!==connection.port||active.token!==connection.token)throw Error('Yerel SDK bağlantı penceresini yeniden açın.');return active.request(path,options);}
