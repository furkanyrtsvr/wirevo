import {attachBluetooth} from './bluetooth-avr.js';
import {boardKey,projectBoard} from './board-hardware.js';
import {attachShiftRuntime} from './shift-runtime.js';
import {attachThermocoupleRuntime} from './thermocouple-runtime.js';
import {attachSPIGPIORuntime} from './spi-gpio-runtime.js';
import {attachTFTRuntime} from './tft-runtime.js';
import {attachActuatorRuntime} from './actuator-devices.js';
import {attachDigitalRuntime} from './digital-devices.js';
import {attachPulseRuntime} from './pulse-devices.js';
import {attachSPIRuntime} from './spi-runtime.js';
import {attachInstrumentRuntime} from './instruments.js';
import {attachBasicRuntime} from './basic-devices.js';
import {attachOneWireRuntime} from './onewire-runtime.js';
import {attachUARTDevices} from './uart-device-runtime.js';
import {attachGPIOEdges} from './gpio-edges.js';
import {UnoRuntime,UNO_HZ} from './uno-runtime.js';
import {validateProject,pinExists} from './core.js';
import {attachCircuitRuntime} from './circuit-runtime.js';
import {attachI2CRuntime} from './i2c-runtime.js';
import {attachMeasurementRuntime,measurementConfig,validMeasurement} from './measurement.js';
let runtime=null,hex='',running=false,timer=null,baseCycles=0,baseTime=0,speed=1,lastReport=0,serial='',tracePins=['D13'],traceId=0,edges=[],traceDropped=0,gpioTrace=null;
let serialPorts=['','','',''];
let circuit=null,circuitRuntime=null,circuitId=0;
let bluetooth=null;
let i2cRuntime=null,spiRuntime=null,onewireRuntime=null,uartDevices=null;
let measurement=null,measurementId=0,measurementRuntime=null;
let shiftDevices=null,thermocouple=null,spiGPIO=null,tftDevices=null,actuatorDevices=null,digitalDevices=null,instruments=null,basicDevices=null,pulseDevices=null;
const selectMeasurement=raw=>{const next=raw||measurementConfig(circuit);if(!validMeasurement(circuit,next,pinExists))throw Error('Geçersiz ölçüm probu.');measurement=next;};
const validateCircuit=raw=>validateProject({...raw,schemaVersion:3,name:'Worker circuit',model:'custom',code:'',firmware:undefined});
const publish=()=>{
  if(!runtime)return;
  const snapshot=runtime.snapshot(true),captured=gpioTrace?.drain();if(captured){edges.push(...captured.events.map(e=>({...e,time:e.cycle/UNO_HZ})));traceDropped+=captured.dropped;}
  postMessage({type:'snapshot',...snapshot,serial:serialPorts[0],serialPorts,running,edges,traceDropped,traceLevels:captured?.startLevels||{},traceId,circuitId,dc:circuitRuntime?.snapshot(true)||null,i2c:i2cRuntime?.snapshot(true)||null,spi:spiRuntime?.snapshot(true)||null,onewire:onewireRuntime?.snapshot(true)||null,bluetooth:bluetooth?.snapshot()||null,uartDevices:uartDevices?.snapshot(true)||null,basicDevices:basicDevices?.snapshot()||null,shiftDevices:shiftDevices?.snapshot()||null,thermocouple:thermocouple?.snapshot()||null,spiGPIO:spiGPIO?.snapshot()||null,tftDevices:tftDevices?.snapshot()||null,actuatorDevices:actuatorDevices?.snapshot()||null,digitalDevices:digitalDevices?.snapshot()||null,pulseDevices:pulseDevices?.snapshot()||null,measurement:measurementRuntime?.drain()||null});serial='';serialPorts=['','','',''];edges=[];traceDropped=0;
};
function stop(){running=false;clearTimeout(timer);timer=null;}
function inject(inputs={}) {
  if(!runtime)return;
  if(circuitRuntime){circuitRuntime.solve();return;}
  runtime.replaceInputs(inputs);
}
const pinValid=p=>projectBoard(circuit).pins.some(pin=>pin.port&&(pin.net||pin.id)===p);
const selectPins=pins=>{if(!Array.isArray(pins)||!pins.length||pins.length>4||pins.some(p=>!pinValid(p)))throw Error('Geçersiz analizör kanalı.');tracePins=[...new Set(pins)];};
function seed(){edges=runtime?tracePins.map(pin=>({pin,high:runtime.readPin(pin).high,cycle:runtime.cpu.cycles,time:runtime.cpu.cycles/UNO_HZ,seed:true})):[];traceDropped=0;}
function create(){serialPorts=['','','',''];bluetooth?.dispose();shiftDevices?.dispose();thermocouple?.dispose();spiGPIO?.dispose();tftDevices?.dispose();actuatorDevices?.dispose();digitalDevices?.dispose();pulseDevices?.dispose();instruments?.dispose();basicDevices?.dispose();measurementRuntime?.dispose();i2cRuntime?.dispose();spiRuntime?.dispose();onewireRuntime?.dispose();uartDevices?.dispose();circuitRuntime?.dispose();runtime=new UnoRuntime(hex,{board:boardKey(circuit),onSerialPort:(port,byte)=>{serialPorts[port]=(serialPorts[port]+String.fromCharCode(byte)).slice(-16000);}});gpioTrace=attachGPIOEdges(runtime,{pins:tracePins,capacity:8192});seed();circuitRuntime=circuit?attachCircuitRuntime(runtime,circuit):null;instruments=circuitRuntime?attachInstrumentRuntime(runtime,circuitRuntime,circuit):null;basicDevices=circuitRuntime?attachBasicRuntime(runtime,circuitRuntime,circuit):null;shiftDevices=circuitRuntime?attachShiftRuntime(runtime,circuitRuntime,circuit):null;thermocouple=circuitRuntime?attachThermocoupleRuntime(runtime,circuitRuntime,circuit):null;spiGPIO=circuitRuntime?attachSPIGPIORuntime(runtime,circuitRuntime,circuit):null;tftDevices=circuitRuntime?attachTFTRuntime(runtime,circuitRuntime,circuit):null;actuatorDevices=circuitRuntime?attachActuatorRuntime(runtime,circuitRuntime,circuit):null;digitalDevices=circuitRuntime?attachDigitalRuntime(runtime,circuitRuntime,circuit):null;pulseDevices=circuitRuntime?attachPulseRuntime(runtime,circuitRuntime,circuit):null;i2cRuntime=circuitRuntime?attachI2CRuntime(runtime,circuitRuntime,circuit):null;spiRuntime=circuitRuntime?attachSPIRuntime(runtime,circuitRuntime,circuit):null;onewireRuntime=circuitRuntime?attachOneWireRuntime(runtime,circuitRuntime,circuit):null;uartDevices=circuitRuntime?attachUARTDevices(runtime,circuitRuntime,circuit):null;bluetooth=circuitRuntime?attachBluetooth(runtime,circuitRuntime,circuit):null;measurementRuntime=circuitRuntime?attachMeasurementRuntime(runtime,circuitRuntime,measurement,measurementId):null;}
function tick(){
  if(!running||!runtime)return;
  try{
    const now=performance.now(),target=baseCycles+(now-baseTime)/1000*UNO_HZ*speed;
    if(runtime.cpu.cycles<target)runtime.stepCycles(Math.min(160000,target-runtime.cpu.cycles));
    if(now-lastReport>=33){publish();lastReport=now;}
    timer=setTimeout(tick,0);
  }catch(error){stop();postMessage({type:'error',message:error.message});}
}
self.onmessage=({data})=>{
  try{
    switch(data.type){
      case 'load':stop();circuit=data.circuit?validateCircuit(data.circuit):null;selectPins(data.pins||[pinValid(data.probe)?data.probe:'D13']);traceId=data.traceId||0;circuitId=data.circuitId||0;circuit=data.circuit?validateCircuit(data.circuit):null;if(circuit)selectMeasurement(data.measurement);measurementId=data.measurementId||0;hex=data.hex;serial='';create();inject(data.inputs);postMessage({type:'ready',...runtime.snapshot(),circuitId,dc:circuitRuntime?.snapshot()||null,i2c:i2cRuntime?.snapshot(true)||null,spi:spiRuntime?.snapshot(true)||null,onewire:onewireRuntime?.snapshot(true)||null,bluetooth:bluetooth?.snapshot()||null,uartDevices:uartDevices?.snapshot(true)||null,basicDevices:basicDevices?.snapshot()||null,shiftDevices:shiftDevices?.snapshot()||null,thermocouple:thermocouple?.snapshot()||null,spiGPIO:spiGPIO?.snapshot()||null,tftDevices:tftDevices?.snapshot()||null,actuatorDevices:actuatorDevices?.snapshot()||null,digitalDevices:digitalDevices?.snapshot()||null,pulseDevices:pulseDevices?.snapshot()||null,measurement:measurementRuntime?.drain()||null});break;
      case 'run':if(!runtime)throw new Error('Önce firmware derleyin veya HEX yükleyin.');stop();speed=Math.max(.1,Math.min(10,Number(data.speed)||1));running=true;baseCycles=runtime.cpu.cycles;baseTime=performance.now();lastReport=0;tick();break;
      case 'pause':stop();publish();break;
      case 'reset':stop();traceId=data.traceId??traceId;circuitId=data.circuitId??circuitId;if(data.circuit)circuit=validateCircuit(data.circuit);if(circuit)selectMeasurement(data.measurement);measurementId=data.measurementId??measurementId;if(hex){serial='';create();inject(data.inputs);publish();}break;
      case 'circuit':circuit=validateCircuit(data.circuit);circuitId=data.circuitId??circuitId;if(runtime){measurementRuntime?.resetIntegral();if(circuitRuntime)circuitRuntime.updateProject(circuit);else{circuitRuntime=attachCircuitRuntime(runtime,circuit);instruments=attachInstrumentRuntime(runtime,circuitRuntime,circuit);basicDevices=attachBasicRuntime(runtime,circuitRuntime,circuit);shiftDevices=attachShiftRuntime(runtime,circuitRuntime,circuit);thermocouple=attachThermocoupleRuntime(runtime,circuitRuntime,circuit);spiGPIO=attachSPIGPIORuntime(runtime,circuitRuntime,circuit);tftDevices=attachTFTRuntime(runtime,circuitRuntime,circuit);actuatorDevices=attachActuatorRuntime(runtime,circuitRuntime,circuit);digitalDevices=attachDigitalRuntime(runtime,circuitRuntime,circuit);pulseDevices=attachPulseRuntime(runtime,circuitRuntime,circuit);i2cRuntime=attachI2CRuntime(runtime,circuitRuntime,circuit);spiRuntime=attachSPIRuntime(runtime,circuitRuntime,circuit);onewireRuntime=attachOneWireRuntime(runtime,circuitRuntime,circuit);uartDevices=attachUARTDevices(runtime,circuitRuntime,circuit);bluetooth=attachBluetooth(runtime,circuitRuntime,circuit);selectMeasurement();measurementRuntime=attachMeasurementRuntime(runtime,circuitRuntime,measurement,measurementId);}instruments?.updateProject(circuit);basicDevices?.updateProject(circuit);shiftDevices?.updateProject(circuit);thermocouple?.updateProject(circuit);spiGPIO?.updateProject(circuit);tftDevices?.updateProject(circuit);actuatorDevices?.updateProject(circuit);digitalDevices?.updateProject(circuit);pulseDevices?.updateProject(circuit);i2cRuntime?.updateProject(circuit);spiRuntime?.updateProject(circuit);onewireRuntime?.updateProject(circuit);uartDevices?.updateProject(circuit);bluetooth?.updateProject(circuit);if(!running)publish();}break;
      case 'measure':if(!circuitRuntime)throw Error('Önce devreyi çalıştırın.');selectMeasurement(data.measurement);measurementId=data.measurementId??measurementId;measurementRuntime.reconfigure(measurement,measurementId);publish();break;
      case 'inputs':inject(data.inputs);if(!running)publish();break;
      case 'bluetooth':{try{if(!bluetooth)throw Error('Önce simülasyonu çalıştırın.');const scan=bluetooth.command(data);postMessage({type:'bluetooth',bluetooth:bluetooth.snapshot(),scan});}catch(e){postMessage({type:'bluetooth-error',message:e.message});}break;}case 'serial':if(!runtime)throw new Error('Firmware yüklenmedi.');runtime.queueSerial(data.text||'',data.port??0);if(!running)publish();break;
      case 'step':stop();if(!runtime)throw new Error('Firmware yüklenmedi.');runtime.stepCycles(data.cycles||16000);publish();break;
      case 'probe':selectPins(data.pins||[data.pin]);traceId=data.traceId??traceId;gpioTrace?.select(tracePins);seed();publish();break;
      case 'snapshot':publish();break;
      default:throw new Error('Bilinmeyen simülasyon komutu.');
    }
  }catch(error){stop();postMessage({type:'error',message:error.message});}
};
