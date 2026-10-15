import {ESPRuntime} from './esp-runtime.js';
let runtime=null,running=false,timer=null,generation=0,sessionId=0,lastReport=0,serial='',lastCycle=0,lastWall=0;
const stop=()=>{running=false;clearTimeout(timer);timer=null;};
const report=()=>{if(!runtime)return;const state=runtime.snapshot(),now=performance.now(),rate=lastWall?(state.cycles-lastCycle)/(now-lastWall)/1000:0;lastWall=now;lastCycle=state.cycles;postMessage({type:'snapshot',sessionId,...state,...(runtime.circuit?{circuit:runtime.circuit.snapshot()}:{}),running,serial,mips:rate});serial='';};
const step=count=>{serial=(serial+runtime.step(count)).slice(-40000);if(runtime.emulator.needs_restart()){runtime.reset();serial+='\r\n[MCU reset]\r\n';}};
function tick(){if(!running||!runtime)return;try{const start=performance.now();do{step(10000);}while(performance.now()-start<10);if(performance.now()-lastReport>40){report();lastReport=performance.now();}const drift=runtime.emulator.throttle_delay_ms(performance.now());timer=setTimeout(tick,Math.max(0,Math.min(1000,drift)));}catch(error){stop();postMessage({type:'error',sessionId,message:error.message});}}
self.onmessage=async({data})=>{const requestSession=data.type==='load'?(data.sessionId||0):sessionId;try{switch(data.type){
 case 'load':{stop();const ticket=++generation;sessionId=data.sessionId||0;await ESPRuntime.initialize();if(ticket!==generation)return;runtime?.dispose();runtime=null;runtime=new ESPRuntime(data.image,{chip:data.chip,bootFromROM:data.bootFromROM,inputs:data.inputs});if(data.circuit)runtime.attachCircuit(data.circuit);serial='';lastWall=0;lastCycle=0;postMessage({type:'ready',sessionId});report();break;}
 case 'run':if(!runtime)throw Error('Önce firmware hazırlayın.');stop();running=true;tick();break;
 case 'pause':stop();report();break;
 case 'reset':stop();if(!runtime)throw Error('Firmware yüklenmedi.');runtime.reset();serial='';lastWall=0;report();break;
 case 'step':stop();if(!runtime)throw Error('Firmware yüklenmedi.');step(data.count||100000);report();break;
 case 'input':if(!runtime)throw Error('Önce firmware çalıştırın.');runtime.setInput(data.pin,data.high);report();break;
 case 'serial':if(!runtime)throw Error('Firmware yüklenmedi.');runtime.queueSerial(data.text);break;
 case 'memory':if(!runtime)throw Error('Firmware yüklenmedi.');postMessage({type:'memory',sessionId,address:data.address,bytes:runtime.readMemory(data.address,data.length)});break;
 case 'circuit':if(!runtime?.circuit)throw Error('ESP devresi yüklenmedi.');runtime.circuit.update(data.circuit);report();break;
 case 'dispose':stop();++generation;runtime?.dispose();runtime=null;break;
 default:throw Error('Bilinmeyen ESP komutu.');}
 }catch(error){if(requestSession!==sessionId)return;stop();postMessage({type:'error',sessionId:requestSession,fatal:!['input','serial','memory'].includes(data.type),message:error.message});}};
