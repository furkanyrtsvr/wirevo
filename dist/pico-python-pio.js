import {picoDMASource} from './pico-python-dma.js';
// Original PIO assembler and native register adapter; no vendor ROM required.
export function picoPythonPIO(r,id,op,...args){
 if(!Number.isInteger(id)||id<0||id>=(r.board.mcu==='RP2350'?12:8))throw Error('PIO state machine numarası geçersiz.');
 const unit=id>>2,sm=id&3,base=0x50200000+unit*0x100000,a=base+0xc8+sm*24,rp=r.native.rp,rd=x=>rp.readUint32(x),wr=(x,v)=>rp.writeUint32(x,v>>>0);
 if(op==='init'){const [program,config]=args,code=Array.from(program),c=Array.from(config);if(!code.length||code.length>32)throw Error('PIO programı 1..32 komut olmalı.');r.pioPrograms??=[[],[],[]];let entry=r.pioPrograms[unit].find(p=>p.code.join(',')===code.join(','));if(!entry){const off=r.pioPrograms[unit].reduce((n,p)=>Math.max(n,p.off+p.code.length),0);if(off+code.length>32)throw Error('PIO komut belleği dolu.');entry={off,code};r.pioPrograms[unit].push(entry);code.forEach((v,i)=>wr(base+0x48+(off+i)*4,(v&0xe000)?v:(v&~31)|((v+off)&31)));}const off=entry.off;wr(base,rd(base)&~(1<<sm));wr(a,c[0]);wr(a+4,(c[1]&~0x1ff80)|((((c[1]>>7)&31)+off)<<7)|((((c[1]>>12)&31)+off)<<12));wr(a+8,c[2]^(1<<31));wr(a+8,c[2]);wr(a+20,c[3]);wr(base,rd(base)|(1<<(sm+4)));wr(a+16,off);r.native.gpioVersion++;r.circuit.refresh(true);return off;}
 if(op==='pin'){const[p,init]=args;r.configure(p,(init&2)?1:0,0,init&1);rp.gpio[p].ctrl=6+unit;rp.gpio[p].checkForUpdates();const old=rd(a+20);wr(a+20,(old&~((31<<5)|(7<<26)))|(p<<5)|(1<<26));wr(a+16,0xe080|((init&2)?1:0));wr(a+16,0xe000|(init&1));wr(a+20,old);r.native.gpioVersion++;r.circuit.refresh(true);return null;}
 if(op==='active'){if(args[0]>=0)wr(base,(rd(base)&~(1<<sm))|(args[0]?1<<sm:0));return !!(rd(base)&(1<<sm));}
 if(op==='exec'){wr(a+16,args[0]);r.native.gpioVersion++;r.circuit.refresh(true);return null;}
 if(op==='restart'){wr(base,rd(base)|(1<<(sm+4))|(1<<(sm+8)));return null;}
 if(op==='irq'){const mask=1<<sm,hit=!!(rd(base+0x30)&mask);if(hit)wr(base+0x30,mask);return hit;}
 if(op==='tx_fifo')return(rd(base+12)>>(sm*8))&15;
 if(op==='rx_fifo')return(rd(base+12)>>(sm*8+4))&15;
 if(op==='put'||op==='get'){const flag=op==='put'?16+sm:8+sm;let n=0;while(rd(base+4)&(1<<flag)){if(++n>10000)throw Error('PIO FIFO bekleme sınırı; SM programını/active durumunu kontrol edin.');r.advance(1);}if(op==='put'){wr(base+0x10+sm*4,args[0]);return null;}return rd(base+0x20+sm*4);}
 throw Error('PIO işlemi desteklenmiyor.');
}
export const picoRP2Source=String.raw`
import _cf
from machine import Pin
class PIO:
    IN_LOW=0;IN_HIGH=1;OUT_LOW=2;OUT_HIGH=3
    SHIFT_LEFT=0;SHIFT_RIGHT=1;JOIN_NONE=0;JOIN_TX=1;JOIN_RX=2
class PIOASMError(Exception):pass
class _Instruction:
    def __init__(self,asm,word):self.asm=asm;self.word=word;self.delay=0;self.side_value=None
    def __getitem__(self,n):self.delay=n;return self
    def side(self,n):self.side_value=n;return self
class _Assembler:
    def __init__(self):self.code=[];self.labels={};self.bottom=0;self.top=None
    def emit(self,word):
        i=_Instruction(self,word);self.code.append(i);return i
    def label(self,name):
        if name in self.labels:raise PIOASMError('duplicate label')
        self.labels[name]=len(self.code)
    def wrap_target(self):self.bottom=len(self.code)
    def wrap(self):self.top=len(self.code)-1
    def jmp(self,cond,label=None):return self.emit(('jump',0 if label is None else cond,cond if label is None else label))
    def wait(self,polarity,src,index):return self.emit(0x2000|(polarity<<7)|((1 if src==6 else 0 if src==0 else 2)<<5)|index)
    def in_(self,src,n):
        if not 1<=n<=32:raise PIOASMError('bit count')
        return self.emit(0x4000|(src<<5)|(n&31))
    def out(self,dst,n):
        if not 1<=n<=32:raise PIOASMError('bit count')
        return self.emit(0x6000|((7 if dst==8 else dst)<<5)|(n&31))
    def set(self,dst,n):
        if not 0<=n<=31:raise PIOASMError('set value')
        return self.emit(0xe000|(dst<<5)|n)
    def mov(self,dst,src):return self.emit(0xa000|((4 if dst==8 else dst)<<5)|src)
    def nop(self):return self.emit(0xa042)
    def push(self,a=0,b=0):return self.emit(0x8000|((a|b)&96)|(0 if (a|b)&1 else 32))
    def pull(self,a=0,b=0):return self.emit(0x8080|((a|b)&96)|(0 if (a|b)&1 else 32))
    def irq(self,mod,index=None):return self.emit(0xc000|((mod&96) if index is not None else 0)|(mod if index is None else index))
    def word(self,word):return self.emit(word)
_symbols={'pins':0,'x':1,'y':2,'null':3,'pindirs':4,'pc':5,'isr':6,'osr':7,'exec':8,'status':5,'pin':6,'gpio':0,'not_x':1,'x_dec':2,'not_y':3,'y_dec':4,'x_not_y':5,'not_osre':7,'block':32,'noblock':1,'iffull':64,'ifempty':64,'clear':64,'rel':lambda n:n|16,'invert':lambda n:n|8,'reverse':lambda n:n|16}
def _environment(assembler):
    d=dict(_symbols)
    for name in ('label','wrap','wrap_target','jmp','wait','in_','out','set','mov','nop','push','pull','irq','word'):d[name]=getattr(assembler,name)
    return d
def _encoded(asm,options):
    count=len(options.get('sideset_init',())) if isinstance(options.get('sideset_init'),tuple) else int(options.get('sideset_init') is not None)
    optional=bool(count and (options.get('_sideset_opt',False) or any(i.side_value is None for i in asm.code)));bits=count+int(optional)
    if bits>5:raise PIOASMError('sideset bits')
    result=[]
    for i in asm.code:
        word=i.word
        if isinstance(word,tuple):
            label=word[2];target=asm.labels[label] if isinstance(label,str) else label
            if not 0<=target<=31:raise PIOASMError('jump target')
            word=(word[1]<<5)|target
        if not 0<=i.delay<(1<<(5-bits)):raise PIOASMError('delay too large')
        word|=i.delay<<8
        if i.side_value is not None:
            if not count or not 0<=i.side_value<(1<<count):raise PIOASMError('sideset value')
            word|=(i.side_value<<(13-bits))|(4096 if optional else 0)
        if not 0<=word<=65535:raise PIOASMError('instruction range')
        result.append(word)
    if not 1<=len(result)<=32:raise PIOASMError('1..32 instructions')
    return result,count,optional
def asm_pio(**options):
    allowed=('out_init','set_init','sideset_init','side_pindir','in_shiftdir','out_shiftdir','autopush','autopull','push_thresh','pull_thresh','fifo_join')
    if any(k not in allowed for k in options):raise TypeError('unknown asm_pio option')
    def decorate(fn):
        asm=_Assembler();env=fn.__globals__;replace=_environment(asm);old={k:env[k] for k in replace if k in env}
        try:env.update(replace);fn()
        finally:
            for k in replace:
                if k in old:env[k]=old[k]
                else:env.pop(k,None)
        code,count,optional=_encoded(asm,options)
        return {'code':code,'options':options,'bottom':asm.bottom,'top':len(code)-1 if asm.top is None else asm.top,'side_count':count,'side_optional':optional}
    return decorate
def asm_pio_encode(instruction,sideset_count,sideset_opt=False):
    asm=_Assembler();eval(instruction,_environment(asm));options={'sideset_init':tuple(0 for _ in range(sideset_count)),'_sideset_opt':sideset_opt} if sideset_count else {}
    return _encoded(asm,options)[0][0]
_sm_irqs={}
def _poll_irqs():
    _poll_dma_irqs()
    for sm,handler in tuple(_sm_irqs.values()):
        if _cf.pio(sm.id,'irq'):handler(sm)
class StateMachine:
    def __init__(self,id,program=None,**kw):
        self.id=id;self.offset=0;_cf.pio(id,'active',-1)
        if program is not None:self.init(program,**kw)
    def init(self,program,freq=-1,*,in_base=None,out_base=None,set_base=None,jmp_pin=None,sideset_base=None,in_shiftdir=None,out_shiftdir=None,push_thresh=None,pull_thresh=None):
        o=dict(program['options']);n=program['side_count'];optional=program['side_optional']
        for key,value in (('in_shiftdir',in_shiftdir),('out_shiftdir',out_shiftdir),('push_thresh',push_thresh),('pull_thresh',pull_thresh)):
            if value is not None:o[key]=value
        div=256 if freq==-1 else round(_cf.cpu_freq()*256/freq)
        if not 256<=div<=16777215:raise ValueError('PIO frequency divider range')
        def pin(p):
            n=0 if p is None else p.id if isinstance(p,Pin) else int(p)
            if not 0<=n<=29:raise ValueError('PIO pin 0..29')
            return n
        ec=(program['bottom']<<7)|(program['top']<<12)|(pin(jmp_pin)<<24)|(bool(o.get('side_pindir',False))<<29)|(optional<<30)
        sc=(o.get('fifo_join',0)<<30)|((o.get('pull_thresh',32)&31)<<25)|((o.get('push_thresh',32)&31)<<20)|(o.get('out_shiftdir',0)<<19)|(o.get('in_shiftdir',0)<<18)|(bool(o.get('autopull',False))<<17)|(bool(o.get('autopush',False))<<16)
        def count(key):
            value=o.get(key);return len(value) if isinstance(value,tuple) else int(value is not None)
        if count('set_init')>5:raise ValueError('SET supports at most 5 pins')
        pc=pin(out_base)|(pin(set_base)<<5)|(pin(sideset_base)<<10)|(pin(in_base)<<15)|(count('out_init')<<20)|(count('set_init')<<26)|((n+optional)<<29)
        self.offset=int(_cf.pio(self.id,'init',program['code'],[div<<8,ec,sc,pc]))
        for key,base in (('out_init',out_base),('set_init',set_base),('sideset_init',sideset_base)):
            initial=o.get(key)
            if initial is not None:
                for i,v in enumerate(initial if isinstance(initial,tuple) else (initial,)):_cf.pio(self.id,'pin',pin(base)+i,v)
    def active(self,value=None):return bool(_cf.pio(self.id,'active',-1 if value is None else bool(value)))
    def restart(self):_cf.pio(self.id,'restart');self.exec(self.offset)
    def exec(self,instruction):_cf.pio(self.id,'exec',asm_pio_encode(instruction,0) if isinstance(instruction,str) else instruction)
    def put(self,value,shift=0):
        for word in (value,) if isinstance(value,int) else value:_cf.pio(self.id,'put',(word<<shift)&0xffffffff)
    def get(self,buf=None,shift=0):
        if buf is None:return int(_cf.pio(self.id,'get'))>>shift
        for i in range(len(buf)):buf[i]=int(_cf.pio(self.id,'get'))>>shift
    def irq(self,handler=None,trigger=1,hard=False):
        if hard or trigger!=1:raise NotImplementedError('PIO IRQ: cooperative flag for own SM, trigger=1')
        if handler is None:_sm_irqs.pop(self.id,None)
        elif not callable(handler):raise ValueError('IRQ callback')
        else:_sm_irqs[self.id]=(self,handler)
    def tx_fifo(self):return int(_cf.pio(self.id,'tx_fifo'))
    def rx_fifo(self):return int(_cf.pio(self.id,'rx_fifo'))
`+picoDMASource;
