import {STMCircuit,solveSTMCircuit} from './stm32-runtime.js';
import {STM32_BOARDS} from './stm32-boards.js';
import {componentDefinition,validateProject} from './core.js';
import {emptyProject} from './templates.js';
import {machineSource} from './python-machine.js';

// Genuine MicroPython WASM with STM32 electrical adapters, not an ARM firmware port.
export class STMPythonCircuit {
 constructor(chip,project){this.chip=chip;this.board=STM32_BOARDS[chip];if(!this.board)throw Error('STM32 kartı geçersiz.');this.count=0;this.inputs={};this.modes=new Map();this.latches=new Map();this.circuitDefinition=this.board;this.partDefinition=componentDefinition;this.emulator={cycles:()=>this.count};this.circuitValidate=p=>validateProject({...emptyProject(),...p,code:'',language:'micropython',files:[],firmware:undefined,settings:{...emptyProject().settings,...p.settings}});this.circuitSolve=p=>solveSTMCircuit(p,chip);this.circuit=new STMCircuit(this,project);}
 pinID(id){if(typeof id==='number'){if(!Number.isInteger(id)||id<0||id>63)throw Error('STM32 pin numarası geçersiz.');id='P'+String.fromCharCode(65+(id>>4))+(id&15);}if(typeof id!=='string')throw Error('STM32 pin adı gerekli.');id=id.toUpperCase();const alias=this.board.pins.find(p=>p.id.toUpperCase()===id&&p.connectable!==false);if(alias)id=alias.net||alias.id;else if(/^[A-D]\d+$/.test(id))id='P'+id;if(!this.board.gpio.includes(id))throw Error(id+': kartta kullanıma açık GPIO yok.');return (id.charCodeAt(1)-65)*16+Number(id.slice(2));}
 name(id){id=this.pinID(id);return 'P'+String.fromCharCode(65+(id>>4))+(id&15);}
 configure(id,mode,pull,value){const p=this.name(id);if(![0,1,2,3].includes(mode)||![0,1,2].includes(pull))throw Error('GPIO modu/pull geçersiz.');this.modes.set(p,{mode,pull});if(value>=0)this.latches.set(p,value?1:0);this.advance(1);}
 pinStates(){return Object.fromEntries(this.board.gpio.map(p=>{const {mode=0,pull=0}=this.modes.get(p)||{},high=!!this.latches.get(p),outputEnabled=mode===1||mode===2&&!high;return[p,{high,outputEnabled,voltage:high?3.3:0,mode:outputEnabled?'OUTPUT':mode===3?'ANALOG':pull===1?'INPUT_PULLUP':pull===2?'INPUT_PULLDOWN':'INPUT'}];}));}
 write(id,value){this.latches.set(this.name(id),value?1:0);this.advance(1);}
 voltage(id){this.advance(1);const p=this.name(id),v=this.inputVoltages[p];if(!Number.isFinite(v))throw Error(p+' boşta; devre/pull bağlantısını kontrol edin.');return v;}
 read(id){return this.voltage(id)>=2.31?1:0;}
 adc(id){const pin=this.name(id);if(!/^P(A[0-7]|B[01]|C[0-5])$/.test(pin))throw Error(pin+': ADC1 girişi değil.');this.configure(id,3,0,-1);const raw=Math.round(Math.min(3.3,Math.max(0,this.voltage(id)))/3.3*4095);return Math.round(raw*65535/4095);}
 advance(us){if(!Number.isFinite(us)||us<0||us>10000000)throw Error('Bekleme aralığı geçersiz.');const target=this.count+Math.round(us*this.board.hz/1e6);let guard=0;while(guard++<100000){const event=Math.min(this.circuit.btEvents?.[0]?.at??Infinity,this.circuit.clockEvents?.[0]?.at??Infinity);if(event>target*16000000/this.board.hz)break;this.count=Math.max(this.count,Math.ceil(event*this.board.hz/16000000));this.circuit.stats.steps++;this.circuit.refresh(true);}if(guard>=100000)throw Error('Devre olay sınırı aşıldı.');this.count=target;this.circuit.stats.steps++;this.circuit.refresh(true);return null;}
}
export const stmMachineSource=machineSource.replace('self.id=int(id)','self.id=_cf.pin_id(id)').replace('    PULL_UP=1','    PULL_UP=1\n    PULL_DOWN=2').replace('pull==self.PULL_UP','0 if pull is None else pull')+String.raw`

class ADC:
    def __init__(self, pin):
        self.id=pin.id if isinstance(pin,Pin) else _cf.pin_id(pin)
        self.read_u16()
    def read_u16(self): return int(_cf.adc(self.id))
    def read(self): return (self.read_u16()*4095+32767)//65535
`;
