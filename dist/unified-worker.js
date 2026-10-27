import {picoNetworkSource} from './pico-python-network.js';
import {PicoPythonCircuit,picoMachineSource,picoPythonBindings} from './pico-python.js';
import {PICO_BOARDS} from './pico-boards.js';
import {STMPythonCircuit,stmMachineSource} from './stm32-python.js';
import {STM32_BOARDS} from './stm32-boards.js';
import {attachMeasurementRuntime,measurementConfig} from './measurement.js';
import {ESPRuntime} from './esp-runtime.js';
import {PythonCircuit} from './python-circuit.js';
import {machineSource} from './python-machine.js';
import {decodeBytes} from './unified-project.js';

let measurementRuntime,measurementListener;
function configureMeasurement(d){const facade={cpu:{get cycles(){return runtime.circuit.cycle();}}},engine={get solution(){return runtime.circuit.solution;},subscribe(fn){measurementListener=fn;return()=>{measurementListener=null;};}};measurementRuntime?.dispose();measurementRuntime=attachMeasurementRuntime(facade,engine,d.measurement||measurementConfig(project),d.measurementId||0);}
let traceId=0,tracePins=[],traceLevels={},edges=[],traceDropped=0;
function trace(cycle,inputs){for(const pin of tracePins){const high=!!inputs[runtime.stm||runtime.pico?pin:Number(pin.slice(4))];if(traceLevels[pin]!==high){edges.push({pin,cycle,high,...(traceLevels[pin]===undefined?{seed:true}:{})});traceLevels[pin]=high;}}if(edges.length>30000){traceDropped+=edges.length-30000;edges.splice(0,edges.length-30000);}}
function configureTrace(d){traceId=d.traceId??traceId;tracePins=(d.pins||tracePins).filter(p=>runtime.stm?runtime.board.gpio.includes(p):runtime.pico?/^GPIO[0-9]+$/.test(p)&&runtime.board.gpio.includes(+p.slice(4)):/^GPIO([0-9]|[1-5][0-9]|6[0-3])$/.test(p));traceLevels={};edges=[];traceDropped=0;runtime.circuit.onTrace=(cycle,inputs)=>{trace(cycle,inputs);measurementListener?.();};trace(runtime.circuit.cycle(),runtime.inputs);}
function pythonCircuit(chip,p){const r=PICO_BOARDS[chip]?new PicoPythonCircuit(chip,p):STM32_BOARDS[chip]?new STMPythonCircuit(chip,p):new PythonCircuit(chip,p);r.stm=!!STM32_BOARDS[chip];return r;}
let runtime,mp,project,program,language,circuitId=0,running=false,timer,serial='',lastReport=0,started=false,paused=false;
const stop=()=>{running=false;clearTimeout(timer);};
function frame(type='snapshot'){
 const python=language==='micropython',state=python?null:runtime.snapshot(),c=runtime.circuit,dc=c.snapshot(),solution=c.solution;
 if(runtime?.pico&&runtime.serial){serial+=runtime.serial;runtime.serial='';}const pins=runtime.stm||runtime.pico?Object.fromEntries(Object.entries(c.pins).map(([p,s])=>[p,{...s,high:!!runtime.inputs[p],voltage:dc.voltages[solution.netlist.net(c.board.id+':'+p)]??null}])):Object.fromEntries(runtime.board.gpio.map(p=>{const s=python?{high:runtime.inputs[p],output:!!c.pins?.['GPIO'+p]?.outputEnabled,voltage:dc.partPins[c.board.id]?.['GPIO'+p]}:state.pins.find(s=>s.pin===p);return['GPIO'+p,{high:s.high,outputEnabled:s.output,mode:s.output?'OUTPUT':'INPUT',voltage:s.voltage??null}];}));
 const cycles=python?runtime.count*16000000/runtime.board.hz:state.cycles*16000000/runtime.board.hz;
 const displays=Object.fromEntries(Object.entries(dc.devices).filter(([,d])=>d.type==='oled').map(([id,d])=>[id,d]));
 postMessage({type,...(runtime.pico?{pico:{...runtime.native.services.snapshot(),execution:'micropython-wasm',cores:[],architecture:'wasm'}}:{}),bluetooth:runtime.circuit.bluetooth?.snapshot(),measurement:measurementRuntime?.drain(),traceId,edges,traceLevels:{...traceLevels},traceDropped,cycles,seconds:cycles/16000000,pins,circuitId,serial,flashBytes:python?0:program.length,running,finished:python&&started&&!running&&!paused,uart:{baudRate:115200,rxEnabled:!python},dc:{...dc,mode:dc.mode||'synchronous-dc',externalDevices:true,...Object.fromEntries(['ledResults','deviceResults','opampResults','contactResults','sensorResults'].map(k=>[k,Object.fromEntries(solution[k]||[])]))},i2c:{modules:dc.devices,displays},spi:{devices:dc.devices}});serial='';edges=[];traceDropped=0;lastReport=performance.now();
}
function emit(text){if(runtime?.pico&&runtime.serial){serial+=runtime.serial;runtime.serial='';}serial=(serial+text).slice(-40000);if(performance.now()-lastReport>40)frame();}
function tick(){if(!running||!runtime)return;try{const start=performance.now();do{emit(runtime.step(10000));}while(performance.now()-start<10);if(performance.now()-lastReport>40)frame();timer=setTimeout(tick,0);}catch(e){stop();postMessage({type:'error',message:e.message});}}
async function pythonInit(){
 const {loadMicroPython}=await import('./micropython/micropython.mjs');
 mp=await loadMicroPython({url:new URL('./micropython/micropython.wasm',import.meta.url).href,stdout:s=>emit(s+'\n'),stderr:s=>emit(s+'\n')});
 if(runtime.pico)mp.FS.writeFile('network.py',picoNetworkSource);mp.FS.writeFile('machine.py',(runtime.pico?picoMachineSource:runtime.stm?stmMachineSource:machineSource)+'\n'+Object.entries(runtime.board.aliases||{}).map(([k,v])=>k+'='+v).join('\n'));
 for(const f of project.files||[]){let dir='';for(const part of f.name.split('/').slice(0,-1)){dir+=part+'/';try{mp.FS.mkdir(dir);}catch{}}mp.FS.writeFile(f.name,f.content);}
 mp.registerJsModule('_cf',runtime.pico?picoPythonBindings(runtime):{configure:(p,m,pull,v)=>runtime.configure(p,m,pull,v),write:(p,v)=>runtime.write(p,v),read:p=>runtime.read(p),delay_us:us=>runtime.advance(us),...(runtime.stm?{pin_id:id=>runtime.pinID(id),adc:id=>runtime.adc(id)}:{})});
 globalThis.cf={sleep:async ms=>{if(!Number.isFinite(ms)||ms<0||ms>10000)throw Error('sleep: 0–10000 ms');await new Promise(r=>setTimeout(r,ms));while(paused)await new Promise(r=>setTimeout(r,20));runtime.advance(ms*1000);frame();return null;}};
 mp.runPython('import time, _cf\ntime.sleep_us=_cf.delay_us\ntime.sleep_ms=lambda ms: _cf.delay_us(ms*1000)\ntime.sleep=lambda seconds: _cf.delay_us(seconds*1000000)');
}
self.onmessage=async({data:d})=>{try{switch(d.type){
 case 'check':{project=d.project;language='micropython';runtime=pythonCircuit(d.chip,d.project);await pythonInit();mp.globals.set('_cf_check_source',d.source);await mp.runPythonAsync('compile(_cf_check_source, "main.py", "exec")');mp.globals.delete('_cf_check_source');postMessage({type:'checked'});break;}
 case 'load':{stop();project=d.circuit;project.files=d.files||[];language=d.language;circuitId=d.circuitId;program=language==='micropython'?d.hex:decodeBytes(d.hex);if(language==='micropython'){runtime=pythonCircuit(d.chip,project);if(runtime.pico&&d.picoNetwork)runtime.native.services.configureNetwork(d.picoNetwork);await pythonInit();}else{await ESPRuntime.initialize();runtime=new ESPRuntime(program,{chip:d.chip,bootFromROM:!!d.bootFromROM});runtime.attachCircuit(project);}started=false;configureTrace(d);configureMeasurement(d);frame('ready');break;}
 case 'run':running=true;paused=false;if(language==='micropython'){if(!started){started=true;Promise.resolve(mp.runPythonAsync(program)).then(()=>{running=false;frame();}).catch(e=>{stop();postMessage({type:'error',message:e.message||String(e)});});}timer=setInterval(()=>{if(running)frame();},40);}else{stop();running=true;tick();}break;
 case 'pause':if(language==='micropython'){paused=true;running=false;clearInterval(timer);frame();}else{stop();frame();}break;
 case 'step':if(language==='micropython')throw Error('MicroPython için işlemci adımlama desteklenmiyor.');stop();emit(runtime.step(10000));frame();break;
 case 'circuit':project=d.circuit;circuitId=d.circuitId;runtime.circuit.update(project);frame();break;
 case 'bluetooth':{try{const scan=runtime.circuit.bluetoothCommand(d);postMessage({type:'bluetooth',bluetooth:runtime.circuit.bluetooth.snapshot(),scan});}catch(e){postMessage({type:'bluetooth-error',message:e.message});}break;}case 'serial':if(language==='micropython'&&!runtime.pico)throw Error('MicroPython UART RX bu sürümde desteklenmiyor.');runtime.queueSerial(d.text);break;
 case 'pico-environment':if(runtime?.pico){runtime.native.configureEnvironment(d.config);project.settings.picoEnvironment={...runtime.native.environment};frame();}break;
 case 'reset':if(language==='micropython')throw Error('MicroPython sıfırlama için yeniden çalıştırın.');stop();runtime.reset();configureTrace(d);configureMeasurement(d);serial='';frame();break;
 case 'probe':configureTrace(d);frame();break;
 case 'measurement':configureMeasurement(d);frame();break;
 case 'trace':break;
 default:throw Error('Bilinmeyen çalışma komutu.');
 }}catch(e){stop();postMessage({type:'error',message:e.message||String(e)});}};

