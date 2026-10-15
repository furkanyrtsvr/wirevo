import {routeProjectWires} from './wire-router.js';
self.onmessage=({data})=>{
 try {routeProjectWires(data,{force:true,recolor:true});self.postMessage({wires:data.wires});}
 catch(error){self.postMessage({error:error.message||'Kablolar düzenlenemedi.'});}
};
