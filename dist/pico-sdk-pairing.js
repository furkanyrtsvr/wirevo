import {validateSDKConnection} from './pico-sdk-bridge.js';
// The fragment never enters the HTTP request. Consume it before any async work.
export function takeSDKPairing(location,history){
 if(!location.hash.startsWith('#wirevo-sdk='))return null;
 const fragment=location.hash;history.replaceState(null,'',location.pathname+location.search);
 if(fragment.length>180)throw Error('Yardımcı bağlantısı geçersiz. Yardımcıyı yeniden başlatın.');
 try{const raw=decodeURIComponent(fragment.slice(12)),match=/^([0-9]{1,5}):([A-Za-z0-9_-]{32,100})$/.exec(raw);if(!match)throw Error();return validateSDKConnection({protocol:1,port:Number(match[1]),token:match[2]});}catch{throw Error('Yardımcı bağlantısı geçersiz. Yardımcıyı yeniden başlatın.');}
}
export async function autoPairSDK(connection,{connect,onConnecting=()=>{},onConnected=()=>{},onError=()=>{}}){onConnecting();try{const status=await connect(validateSDKConnection(connection));onConnected(status);return true;}catch(error){onError(error);return false;}}
