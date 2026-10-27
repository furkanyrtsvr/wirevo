// Buffers are pinned into native-chip SRAM for real DMA bus/DREQ execution.
export function picoPythonDMA(r,op,...args){
 const rp=r.native.rp,newer=r.board.mcu==='RP2350',limit=newer?16:12;
 r.pythonDMA??=new Set();r.dmaRegions??=new Map();
 if(op==='claim'){for(let ch=0;ch<limit;ch++)if(!r.pythonDMA.has(ch)){r.pythonDMA.add(ch);const a=0x50000000+ch*64;rp.writeUint32(a+16,0);rp.writeUint32(a,0);rp.writeUint32(a+4,0);rp.writeUint32(a+8,0);rp.dma.channels[ch].transCount=0;rp.writeUint32(0x50000400,1<<ch);return ch;}throw Error('Boş DMA kanalı yok.');}
 if(op==='alloc'){const len=args[0];if(!Number.isInteger(len)||len<1||len>65536)throw Error('DMA buffer 1..65536 bayt olmalı.');const size=(len+255)&~255;let at=0x20004000;for(const[a,n]of [...r.dmaRegions].sort((a,b)=>a[0]-b[0])){if(at+size<=a)break;at=Math.max(at,a+n);}if(at+size>0x20000000+r.board.ram-4096)throw Error('DMA SRAM buffer alanı dolu.');r.dmaRegions.set(at,size);return at;}
 if(op==='free'){r.dmaRegions.delete(args[0]);return null;}
 const range=(a,n)=>Number.isInteger(a)&&Number.isInteger(n)&&n>=0&&a>=0x20000000&&a+n<=0x20000000+r.board.ram;
 if(op==='copyin'){const[a,data]=args,bytes=Uint8Array.from(data);if(!range(a,bytes.length))throw Error('DMA SRAM aralığı geçersiz.');for(let i=0;i<bytes.length;i++)rp.writeUint8(a+i,bytes[i]);return null;}
 if(op==='copyout'){const[a,n]=args;if(!range(a,n))throw Error('DMA SRAM aralığı geçersiz.');return Array.from({length:n},(_,i)=>rp.readUint8(a+i));}
 const [ch,offset,value]=args;if(!r.pythonDMA.has(ch))throw Error('DMA kanalı kapalı/geçersiz.');const a=0x50000000+ch*64;
 if(op==='read'){if(!Number.isInteger(offset)||offset<0||offset>15)throw Error('DMA register index 0..15');return rp.readUint32(a+offset*4);}
 if(op==='write'){if(!Number.isInteger(offset)||offset<0||offset>15)throw Error('DMA register index 0..15');rp.writeUint32(a+offset*4,value>>>0);if([2,6,10,14].includes(offset)&&!(rp.dma.channels[ch].ctrl&(1<<(newer?26:24))))rp.dma.channels[ch].transCount=value&(newer?0xfffffff:0xffffffff);return null;}
 if(op==='active'){r.advance(1);return !!(rp.readUint32(a+12)&(1<<(newer?26:24)));}
 if(op==='reload')return rp.dma.channels[ch].transCountReload;
 if(op==='start'){if(!rp.dma.channels[ch].transCountReload)throw Error('DMA başlatmak için count > 0 gerekli.');rp.writeUint32(a+12,rp.readUint32(a+16)|1);return null;}
 if(op==='abort'||op==='close'){rp.writeUint32(newer?0x50000464:0x50000444,1<<ch);if(op==='close'){rp.writeUint32(0x50000404,rp.readUint32(0x50000404)&~(1<<ch));rp.writeUint32(0x50000400,1<<ch);r.pythonDMA.delete(ch);}return null;}
 if(op==='irq_enable'){rp.writeUint32(0x50000404,(rp.readUint32(0x50000404)&~(1<<ch))|(offset?1<<ch:0));return null;}
 if(op==='irq'){const mask=1<<ch,hit=!!(rp.readUint32(0x50000400)&mask);if(hit)rp.writeUint32(0x50000400,mask);return hit;}
 throw Error('DMA işlemi geçersiz.');
}
export const picoDMASource=String.raw`
import uctypes
_dma_objects={}
_dma_fields={'enable':(0,1),'high_pri':(1,1),'size':(2,2),'inc_read':(4,1),'inc_write':(6 if _cf.is_rp2350() else 5,1),'ring_size':(8 if _cf.is_rp2350() else 6,4),'ring_sel':(12 if _cf.is_rp2350() else 10,1),'chain_to':(13 if _cf.is_rp2350() else 11,4),'treq_sel':(17 if _cf.is_rp2350() else 15,6),'irq_quiet':(23 if _cf.is_rp2350() else 21,1),'bswap':(24 if _cf.is_rp2350() else 22,1),'sniff_en':(25 if _cf.is_rp2350() else 23,1),'busy':(26 if _cf.is_rp2350() else 24,1),'write_err':(29,1),'read_err':(30,1),'ahb_err':(31,1)}
def _poll_dma_irqs():
    for d in tuple(_dma_objects.values()):
        d._sync()
        if d._handler and _cf.dma('irq',d.channel):d._handler(d)
class _DMARegisters:
    def __init__(self,d,start=0,count=16):self.d=d;self.start=start;self.count=count
    def __len__(self):return self.count
    def __getitem__(self,i):
        if isinstance(i,slice):
            if i.step not in (None,1):raise ValueError('DMA register slice step')
            a=0 if i.start is None else i.start;b=self.count if i.stop is None else i.stop
            if not 0<=a<=b<=self.count:raise IndexError()
            return _DMARegisters(self.d,self.start+a,b-a)
        if not 0<=i<self.count:raise IndexError()
        self.d._check();return int(_cf.dma('read',self.d.channel,self.start+i))
    def __setitem__(self,i,v):
        if not 0<=i<self.count:raise IndexError()
        self.d._check();_cf.dma('write',self.d.channel,self.start+i,v)
class DMA:
    def __init__(self):
        self.channel=int(_cf.dma('claim'));self._closed=False;self._buffers={};self._dest=None;self._handler=None;self._pending=False;self._read_obj=None;self._write_obj=None;self.registers=_DMARegisters(self);_dma_objects[self.channel]=self
        self.ctrl=self.pack_ctrl()
    def _check(self):
        if self._closed:raise ValueError('DMA closed')
    def pack_ctrl(self,default=None,**kw):
        self._check()
        value=(1|8|16|(1<<_dma_fields['inc_write'][0])|(self.channel<<_dma_fields['chain_to'][0])|(63<<_dma_fields['treq_sel'][0])|(1<<_dma_fields['irq_quiet'][0])) if default is None else int(default)
        for name,v in kw.items():
            if name not in _dma_fields:raise TypeError('unknown DMA field '+name)
            if name in ('busy','ahb_err'):continue
            shift,bits=_dma_fields[name];v=int(v)
            if not 0<=v<(1<<bits) or name=='size' and v==3:raise ValueError('DMA field range '+name)
            if name=='sniff_en' and v:raise NotImplementedError('DMA sniffer not modeled')
            value=(value&~(((1<<bits)-1)<<shift))|(v<<shift)
        return value&0xffffffff
    @staticmethod
    def unpack_ctrl(value):return {k:(int(value)>>s)&((1<<n)-1) for k,(s,n) in _dma_fields.items()}
    def _address(self,obj,write):
        if isinstance(obj,int):
            if not (0x20000000<=obj<0x20000000+int(_cf.ram_size()) or 0x40000000<=obj<0x60000000):raise ValueError('DMA native SRAM/peripheral address required')
            return obj
        if isinstance(obj,StateMachine):return 0x50200000+(obj.id//4)*0x100000+(0x10 if write else 0x20)+(obj.id%4)*4
        if isinstance(obj,_DMARegisters):obj.d._check();return 0x50000000+obj.d.channel*64+obj.start*4
        view=memoryview(obj)
        if write and len(view):view[0]=view[0]
        key=id(obj)
        if key not in self._buffers:
            n=len(bytes(view));address=int(_cf.dma('alloc',max(1,n)));self._buffers[key]=(obj,view,address,n)
        return self._buffers[key][2]
    def _sync(self,force=False):
        if self._pending and (force or (not _cf.dma('read',self.channel,3)&(1<<_dma_fields['busy'][0]) and not _cf.dma('read',self.channel,2))):
            for obj,view,a,n in self._buffers.values():
                if obj is self._write_obj and n:
                    raw=uctypes.bytearray_at(uctypes.addressof(view),n);raw[:]=bytes(_cf.dma('copyout',a,n))
            self._pending=False
    def _prepare(self):
        ctrl=self.unpack_ctrl(self.ctrl)
        if ctrl['size']==3:raise ValueError('DMA size')
        size=1<<ctrl['size'];count=int(_cf.dma('reload',self.channel))
        if ctrl['sniff_en']:raise NotImplementedError('DMA sniffer not modeled')
        for is_write,obj,inc in ((False,self._read_obj,ctrl['inc_read']),(True,self._write_obj,ctrl['inc_write'])):
            if obj is not None and id(obj) in self._buffers:
                _,view,a,n=self._buffers[id(obj)]
                needed=size*count if inc else size if count else 0
                if ctrl['ring_size'] and bool(ctrl['ring_sel'])==is_write:
                    if ctrl['ring_size']>8:raise ValueError('Python buffer ring limited to 256 bytes; use aligned native SRAM addresses for larger rings')
                    needed=min(needed,1<<ctrl['ring_size'])
                if needed>n:raise ValueError('DMA transfer exceeds Python buffer')
                _cf.dma('copyin',a,bytes(view))
        self._pending=True
    def config(self,*,read=None,write=None,count=None,ctrl=None,trigger=False):
        self._check()
        if _cf.dma('active',self.channel):raise ValueError('abort active DMA before reconfiguration')
        self._sync()
        if read is not None:self._read_obj=read;self._set(0,self._address(read,False))
        if write is not None:self._write_obj=write;self._set(1,self._address(write,True))
        if count is not None:self.count=count
        if ctrl is not None:self.ctrl=ctrl
        self._prepare()
        if trigger:self.active(1)
    def active(self,value=None):
        self._check()
        if value is not None:
            if value:self._prepare();_cf.dma('start',self.channel)
            else:_cf.dma('abort',self.channel);self._sync(True)
        result=bool(_cf.dma('active',self.channel));self._sync();return result
    def irq(self,handler=None,hard=False):
        self._check()
        if hard:raise NotImplementedError('DMA IRQ callbacks are cooperative')
        if handler is not None and not callable(handler):raise ValueError('DMA callback')
        self._handler=handler;_cf.dma('irq_enable',self.channel,bool(handler));return self
    def close(self):
        if self._closed:return
        self.active(0);_cf.dma('close',self.channel)
        for _,_,a,_ in self._buffers.values():_cf.dma('free',a)
        self._buffers={};_dma_objects.pop(self.channel,None);self._closed=True;self._handler=None
    def _get(self,n):self._check();self._sync();return int(_cf.dma('read',self.channel,n))
    def _set(self,n,v):self._check();_cf.dma('write',self.channel,n,v)
    def _set_address(self,n,v):
        if n==0:self._read_obj=v
        else:self._write_obj=v
        self._set(n,self._address(v,n==1))
    def _set_count(self,v):
        if not isinstance(v,int) or not 0<=v<=0xfffffff:raise ValueError('DMA count range')
        self._set(2,v)
    read=property(lambda s:s._get(0),lambda s,v:s._set_address(0,v))
    write=property(lambda s:s._get(1),lambda s,v:s._set_address(1,v))
    count=property(lambda s:s._get(2),lambda s,v:s._set_count(v))
    ctrl=property(lambda s:s._get(3),lambda s,v:s._set(4,v))
`;
