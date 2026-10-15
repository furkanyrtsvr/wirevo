import {ESP_BOARDS} from './esp-boards.js';
import {ESPCircuitRuntime} from './esp-circuit-runtime.js';
export class PythonCircuit {
 constructor(chip,project){this.chip=chip;this.board=ESP_BOARDS[chip];this.inputs={};this.count=0;this.gpio=new Uint32Array(4);this.modes=new Map();this.latches=new Map();this.mux=new Uint8Array((Math.max(...this.board.gpio)+1)*4);this.emulator={cycles:()=>this.count,gpio_state:()=>this.gpio,read_memory:()=>this.mux,gpio_set_input:(p,h)=>this.inputs[p]=h};this.circuit=new ESPCircuitRuntime(this,project);}
 check(p){if(!this.board.gpio.includes(p))throw Error('Kart üzerinde GPIO'+p+' yok.');}
 configure(p,mode,pull,value){this.check(p);if(![0,1,2].includes(mode))throw Error('GPIO modu desteklenmiyor.');this.modes.set(p,{mode,pull});if(value>=0)this.latches.set(p,value);this.apply(p);}
 apply(p){const {mode,pull}=this.modes.get(p)||{mode:0,pull:false},value=this.latches.get(p)||0,bank=p<32?0:1,bit=1<<(p%32),enabled=mode===1||mode===2&&!value;this.gpio[bank+2]=enabled?this.gpio[bank+2]|bit:this.gpio[bank+2]&~bit;this.gpio[bank]=value?this.gpio[bank]|bit:this.gpio[bank]&~bit;new DataView(this.mux.buffer).setUint32(p*4,pull?256:0,true);this.advance(1);}
 write(p,v){this.check(p);this.latches.set(p,v?1:0);this.apply(p);}
 read(p){this.check(p);this.advance(1);const dc=this.circuit.solution,v=dc.voltages.get(dc.netlist.net(this.circuit.board.id+':GPIO'+p));if(!Number.isFinite(v))throw Error('GPIO'+p+' boşta; besleme ve pull-up bağlantısını kontrol edin.');return this.inputs[p]?1:0;}
 advance(us){if(!Number.isFinite(us)||us<0||us>10000000)throw Error('Bekleme aralığı geçersiz.');const target=this.count+Math.round(us*this.board.hz/1e6);while(this.circuit.btEvents?.length&&this.circuit.btEvents[0].at<=target*16000000/this.board.hz){const next=this.circuit.btEvents[0].at;this.count=Math.max(this.count,Math.ceil(next*this.board.hz/16000000));this.circuit.stats.steps++;this.circuit.refresh(true);}this.count=target;this.circuit.stats.steps++;this.circuit.refresh(true);return null;}
}
