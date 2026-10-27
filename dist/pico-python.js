import {picoTimerSource} from './pico-python-timers.js';
import {picoPythonPIO} from './pico-python-pio.js';
import {picoPythonWLAN} from './pico-python-network.js';
import {validateProject} from './core.js';
import {emptyProject} from './templates.js';
import {PicoRuntime} from './pico-runtime.js';
import {PICO_BOARDS} from './pico-boards.js';
import {packPicoImage} from './pico-image.js';
import {machineSource} from './python-machine.js';
// Genuine MicroPython WASM, with a stopped native chip used for peripheral/electrical state.
// This is a simulator machine module, not the original RP2 MicroPython firmware.
export class PicoPythonCircuit {
 constructor(id,project){this.board=PICO_BOARDS[id];const stub=new Uint8Array(12),v=new DataView(stub.buffer);v.setUint32(0,0x20000000+this.board.ram,true);v.setUint32(4,0x10000009,true);v.setUint16(8,0xe7fe,true);this.native=new PicoRuntime(packPicoImage(stub,id),id);this.native.circuitValidate=p=>validateProject({...emptyProject(),...p,language:'micropython',firmware:undefined});this.native.attachCircuit({...project,language:'micropython'});this.circuit=this.native.circuit;this.inputs=this.native.inputs;this.count=0;this.pico=true;this.modes=new Map();this.latches=new Map();this.irqMasks=new Map();this.irqQueue=[];const rp=this.native.rp,input=rp.gpioInputValueHasBeenSet.bind(rp);this.levels=rp.gpio.map(g=>g.inputValue);rp.gpioInputValueHasBeenSet=p=>{input(p);const level=rp.gpio[p].inputValue,old=this.levels[p];this.levels[p]=level;if(old!==level&&((this.irqMasks.get(p)||0)&(level?8:4))&&this.irqQueue.length<64)this.irqQueue.push((p<<4)|(level?8:4));};this.uartRx=[[],[]];rp.uart.forEach(u=>u.onByte=c=>{this.serial=(this.serial||'')+String.fromCharCode(c);});}
 pinID(id){if(id===-1&&this.board.wireless)return -1;if(id==='LED')return this.board.wireless?-1:25;if(typeof id==='string')id=Number(id.replace(/^(GPIO|GP)/i,''));if(!Number.isInteger(id)||id<0||id>29)throw Error('Pico GPIO 0…29 veya LED gerekli.');return id;}
 configure(p,mode,pull,value){p=this.pinID(p);if(![0,1,2].includes(mode)||![0,1,2].includes(pull))throw Error('GPIO modu/pull geçersiz.');this.modes.set(p,{mode,pull});if(value>=0)this.latches.set(p,+!!value);this.apply(p);}
 apply(p){const r=this.native,rp=r.rp,{mode=0,pull=0}=this.modes.get(p)||{},value=this.latches.get(p)||0;if(p===-1){r.cyw43.power(true);r.cyw43.setLED(value);return;}const g=rp.gpio[p];g.ctrl=5;g.padValue=(g.padValue&~(128|256|12))|64|(pull===1?8:pull===2?4:0);g.checkForUpdates();const newer=this.board.mcu==='RP2350',bit=1<<p;rp.writeUint32(value?(newer?0xd0000018:0xd0000014):(newer?0xd0000020:0xd0000018),bit);const out=mode===1||mode===2&&!value;rp.writeUint32(out?(newer?0xd0000038:0xd0000024):(newer?0xd0000040:0xd0000028),bit);r.circuit.refresh(true);}
 write(p,v){p=this.pinID(p);this.latches.set(p,+!!v);this.apply(p);}
 read(p){p=this.pinID(p);this.advance(1);if(p===-1)return +this.native.cyw43.led;this.native.circuit.refresh(true);return +this.native.rp.gpio[p].inputValue;}
 adc(id){id=id>=26?id-26:id;if(!Number.isInteger(id)||id<0||id>4)throw Error('ADC 0…4 veya GP26…GP29 gerekli.');const r=this.native,base=this.board.mcu==='RP2350'?0x400a0000:0x4004c000;if(id<3)this.configure(26+id,0,0,-1);r.rp.writeUint32(base,1|(id===4?2:0)|(id<<12)|4);this.advance(3);return Math.round((r.rp.adc.result&4095)*65535/4095);}
 pwm(p,hz,duty){p=this.pinID(p);if(p<0)throw Error('Kablosuz LED PWM çıkışı değildir.');if(!Number.isInteger(hz)||hz<1||hz>1000000||!Number.isInteger(duty)||duty<0||duty>65535)throw Error('PWM frekans/duty sınırı.');const r=this.native,base=this.board.mcu==='RP2350'?0x400a8000:0x40050000,slice=(p>>1)&7,a=base+slice*20,div=Math.max(16,Math.ceil(this.board.hz*16/(hz*65536))),top=Math.min(65535,Math.max(1,Math.round(this.board.hz*16/(hz*div))-1));if(div>4095)throw Error('PWM frekansı bu saat bölücüsünde çok düşük.');r.rp.gpio[p].ctrl=4;r.rp.gpio[p].padValue|=64;r.rp.gpio[p].checkForUpdates();r.rp.writeUint32(a,0);r.rp.writeUint32(a+4,div);r.rp.writeUint32(a+16,top);const shift=(p&1)*16,level=Math.round(duty*(top+1)/65535);r.rp.writeUint32(a+12,(r.rp.readUint32(a+12)&~(65535<<shift))|Math.min(65535,level)<<shift);r.rp.writeUint32(a,1);}
 pwmOff(p){p=this.pinID(p);this.native.rp.writeUint32((this.board.mcu==='RP2350'?0x400a8000:0x40050000)+((p>>1)&7)*20,0);this.configure(p,0,0,-1);}
 advance(us){if(!Number.isFinite(us)||us<0||us>10000000)throw Error('Bekleme 0…10000000 µs olmalı.');const r=this.native,target=r.rp.clock.nanos+us*1000;let steps=0;while(r.rp.clock.nanos<target){if(++steps>100000)throw Error('Pico Python devre olay sınırı.');const next=Math.min(this.circuit.btEvents?.[0]?.at??Infinity,this.circuit.clockEvents?.[0]?.at??Infinity),end=Math.min(target,next/0.016),dt=Math.max(1,end-r.rp.clock.nanos);if(r.rp.pio.some(p=>p.machines.some(m=>m.enabled))){r.rp.stepThings(Math.min(1000000,Math.ceil(dt*this.board.hz/1e9)));}else r.rp.clock.tick(dt);r.referenceCycles=r.rp.clock.nanos*.016;this.count=r.rp.clock.nanos*this.board.hz/1e9;this.circuit.stats.steps++;r.gpioVersion++;this.circuit.refresh(true);}return null;}
 memory(address,value,size=4){const a=address>>>0,rp=this.native.rp;if(![1,2,4].includes(size)||(a&(size-1)))throw Error('Hizalı 8/16/32-bit erişim gerekli.');if(!(a>=0x20000000&&a+size<=0x20000000+this.board.ram||a>=0x40000000&&a+size<0x60000000||a>=0xd0000000&&a+size<0xd0000200))throw Error('Pico RAM/peripheral adresi gerekli.');if(value===undefined)return size===1?rp.readUint8(a):size===2?rp.readUint16(a):rp.readUint32(a);if(size===1)rp.writeUint8(a,value);else if(size===2)rp.writeUint16(a,value);else rp.writeUint32(a,value);return null;}
 uart(id,value=-1){if(id!==0&&id!==1)throw Error('UART 0/1 gerekli.');if(value>=0){this.serial=(this.serial||'')+String.fromCharCode(value&255);return 1;}return this.uartRx[id].length?this.uartRx[id].shift():-1;}
 queueSerial(text){this.uartRx[0].push(...new TextEncoder().encode(text));}
 dispose(){this.native.dispose();}
}
export const picoMachineSource=machineSource.replace('if not 1000<=freq<=10000','if not 1000<=freq<=400000').replace('self.delay=500000//freq','self.delay=max(1,500000//freq)').replace('self.id=int(id)','self.id=_cf.pin_id(id)').replace('    PULL_UP=1','    PULL_UP=1\n    PULL_DOWN=2').replace('pull==self.PULL_UP','0 if pull is None else pull')+String.raw`

_irq_handlers={}
_draining=False
def _drain_irq():
    global _draining
    if _draining:return
    _draining=True
    try:
        for _ in range(64):
            event=int(_cf.irq_pop())
            if event<0:break
            pin=event>>4
            if pin in _irq_handlers:
                p,handler=_irq_handlers[pin]
                if handler:handler(p)
    finally:_draining=False
class Pin(Pin):
    IRQ_FALLING=4
    IRQ_RISING=8
    def toggle(self):self.value(not self.value())
    def irq(self,handler=None,trigger=12,*,hard=False):
        if hard:raise NotImplementedError('Python IRQ cooperative callback; hard IRQ yok')
        _irq_handlers[self.id]=(self,handler);_cf.irq_config(self.id,int(trigger) if handler else 0)
    def value(self,v=None):
        result=super().value(v);_drain_irq();return result
    __call__=value
def _sleep_us(us):_cf.delay_us(us);_drain_irq()
time.sleep_us=_sleep_us
time.sleep_ms=lambda ms:_sleep_us(ms*1000)
time.sleep=lambda sec:_sleep_us(sec*1000000)
class SoftSPI:
    MSB=0
    LSB=1
    def __init__(self,*,baudrate=20000,polarity=0,phase=0,bits=8,firstbit=0,sck,mosi,miso):
        if not 1000<=baudrate<=1000000 or polarity not in (0,1) or phase not in (0,1) or bits!=8 or firstbit not in (0,1):raise ValueError('SPI: 8-bit, mode 0..3, 1k..1MHz')
        self.cp=polarity;self.ph=phase;self.order=firstbit;self.sck=sck;self.mosi=mosi;self.miso=miso;self.delay=500000/baudrate
        sck.init(Pin.OUT,value=polarity);mosi.init(Pin.OUT,value=0);miso.init(Pin.IN,Pin.PULL_UP)
    def _byte(self,b):
        value=0
        for k in range(8):
            bit=k if self.order else 7-k
            if not self.ph:self.mosi((b>>bit)&1)
            _cf.delay_us(self.delay);self.sck(1-self.cp)
            if self.ph:self.mosi((b>>bit)&1)
            else:value|=self.miso()<<bit
            _cf.delay_us(self.delay);self.sck(self.cp)
            if self.ph:value|=self.miso()<<bit
        return value
    def write(self,buf):
        for b in buf:self._byte(b)
    def read(self,n,write=0):return bytes(self._byte(write) for _ in range(n))
    def readinto(self,buf,write=0):buf[:]=self.read(len(buf),write)
    def write_readinto(self,buf,out):
        if len(buf)!=len(out):raise ValueError('buffer length')
        for i,b in enumerate(buf):out[i]=self._byte(b)

class ADC:
    def __init__(self,id): self.id=id.id if isinstance(id,Pin) else int(id)
    def read_u16(self): return int(_cf.adc(self.id))
    def read(self): return (self.read_u16()*4095+32767)//65535
class PWM:
    def __init__(self,pin,*,freq=1000,duty_u16=0):
        self.pin=pin.id if isinstance(pin,Pin) else _cf.pin_id(pin);self.hz=freq;self.duty=duty_u16;self._apply()
    def _apply(self): _cf.pwm(self.pin,self.hz,self.duty)
    def freq(self,v=None):
        if v is None:return self.hz
        self.hz=int(v);self._apply()
    def duty_u16(self,v=None):
        if v is None:return self.duty
        self.duty=int(v);self._apply()
    def deinit(self): _cf.pwm_off(self.pin)
class I2C(SoftI2C):
    def __init__(self,id=0,*,scl=None,sda=None,freq=10000,timeout=50000):
        if id not in (0,1):raise ValueError('I2C 0/1')
        super().__init__(scl=Pin(1 if id==0 else 3) if scl is None else scl,sda=Pin(0 if id==0 else 2) if sda is None else sda,freq=freq,timeout=timeout)
class SPI(SoftSPI):
    def __init__(self,id=0,*,baudrate=20000,polarity=0,phase=0,bits=8,firstbit=0,sck=None,mosi=None,miso=None):
        if id not in (0,1):raise ValueError('SPI 0/1')
        super().__init__(baudrate=baudrate,polarity=polarity,phase=phase,bits=bits,firstbit=firstbit,sck=Pin(18 if id==0 else 10) if sck is None else sck,mosi=Pin(19 if id==0 else 11) if mosi is None else mosi,miso=Pin(16 if id==0 else 12) if miso is None else miso)
class UART:
    def __init__(self,id=0,baudrate=115200,*,tx=None,rx=None,**kw):
        if id not in (0,1) or baudrate<=0:raise ValueError('UART 0/1 baudrate')
        if tx is not None or rx is not None or kw:raise NotImplementedError('UART bu profilde terminal bağlantısı; harici pin adaptörü yok')
        self.id=id;self.baudrate=baudrate;self.pending=[]
    def write(self,data):
        if isinstance(data,str):data=data.encode()
        for b in data:_cf.uart(self.id,b)
        return len(data)
    def any(self):
        for _ in range(4096):
            b=int(_cf.uart(self.id,-1))
            if b<0:break
            self.pending.append(b)
        return len(self.pending)
    def read(self,n=None):
        self.any();n=len(self.pending) if n is None else n;out=bytes(self.pending[:n]);self.pending=self.pending[n:];return out if out else None
    def readinto(self,buf):
        data=self.read(len(buf))
        if data is None:return None
        buf[:len(data)]=data;return len(data)
class _Mem:
    def __init__(self,size):self.size=size
    def __getitem__(self,a):return int(_cf.mem_read(a,self.size))
    def __setitem__(self,a,v):_cf.mem_write(a,v,self.size)
mem8=_Mem(1);mem16=_Mem(2);mem32=_Mem(4)
def freq(value=None):
    if value is not None:raise NotImplementedError('Saat değiştirme bu profilde yok')
    return int(_cf.cpu_freq())
`+picoTimerSource;
export function picoPythonBindings(r){return{ticks_us:()=>Math.floor(r.native.rp.clock.nanos/1000),unique_id:()=>Array.from(new TextEncoder().encode(r.board.id.padEnd(8,'0').slice(0,8)),b=>b.toString(16).padStart(2,'0')).join(''),pio:(...a)=>picoPythonPIO(r,...a),configure:(...a)=>r.configure(...a),write:(...a)=>r.write(...a),read:p=>r.read(p),delay_us:us=>r.advance(us),pin_id:p=>r.pinID(p),adc:id=>r.adc(id),pwm:(...a)=>r.pwm(...a),pwm_off:p=>r.pwmOff(p),uart:(...a)=>r.uart(...a),mem_read:(a,s)=>r.memory(a,undefined,s),mem_write:(a,v,s)=>r.memory(a,v,s),irq_config:(p,mask)=>r.irqMasks.set(r.pinID(p),mask&12),irq_pop:()=>r.irqQueue.length?r.irqQueue.shift():-1,wlan:(...a)=>picoPythonWLAN(r,...a),cpu_freq:()=>r.board.hz};}
