import {validateSDKConnection} from './pico-sdk-bridge.js';
const PENDING='wirevo-sdk-pending-v1';
export function forgetSDKPairing(storage=globalThis.sessionStorage){try{storage?.removeItem(PENDING);}catch{}}
export function rememberSDKPairing(connection,storage=globalThis.sessionStorage,now=Date.now()){try{storage?.setItem(PENDING,JSON.stringify({at:now,connection:validateSDKConnection(connection)}));}catch{}}
export function readSDKPairing(storage=globalThis.sessionStorage,now=Date.now()){try{const saved=JSON.parse(storage?.getItem(PENDING)||'null');if(!saved||!Number.isFinite(saved.at)||now-saved.at>600000||saved.at>now+60000)throw Error();return validateSDKConnection(saved.connection);}catch{forgetSDKPairing(storage);return null;}}
// The fragment never enters the HTTP request. Consume it before any async work.
export function takeSDKPairing(location,history){
 if(!location.hash.startsWith('#wirevo-sdk='))return null;
 const fragment=location.hash;history.replaceState(null,'',location.pathname+location.search);
 if(fragment.length>180)throw Error('Yardımcı bağlantısı geçersiz. Yardımcıyı yeniden başlatın.');
 try{const raw=decodeURIComponent(fragment.slice(12)),match=/^([0-9]{1,5}):([A-Za-z0-9_-]{32,100})$/.exec(raw);if(!match)throw Error();const connection=validateSDKConnection({protocol:1,port:Number(match[1]),token:match[2]});rememberSDKPairing(connection);return connection;}catch{forgetSDKPairing();throw Error('Yardımcı bağlantısı geçersiz. Yardımcıyı yeniden başlatın.');}
}
export async function autoPairSDK(connection,{connect,onConnecting=()=>{},onConnected=()=>{},onError=()=>{}}){onConnecting();try{const status=await connect(validateSDKConnection(connection));onConnected(status);return true;}catch(error){onError(error);return false;}}
