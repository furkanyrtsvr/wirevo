// Original MicroPython adapters. GPIO edges use the same physical circuit model.
export const machineSource=String.raw`
import _cf
import time
class Pin:
    IN=0
    OUT=1
    OPEN_DRAIN=2
    PULL_UP=1
    def __init__(self,id,mode=IN,pull=None,value=None):
        self.id=int(id)
        self.mode=mode
        self.pull=pull
        self.init(mode,pull,value=value)
    def init(self,mode=None,pull=None,value=None):
        if mode is not None: self.mode=mode
        self.pull=pull
        _cf.configure(self.id,self.mode,pull==self.PULL_UP,-1 if value is None else int(bool(value)))
    def value(self,v=None):
        if v is None: return int(_cf.read(self.id))
        _cf.write(self.id,int(bool(v)))
    def on(self): self.value(1)
    def off(self): self.value(0)
    def __call__(self,v=None): return self.value(v)

class SoftI2C:
    def __init__(self,*,scl,sda,freq=10000,timeout=50000):
        if not 1000<=freq<=10000: raise ValueError('SoftI2C: 1-10 kHz')
        self.scl=scl; self.sda=sda; self.delay=500000//freq
        scl.init(Pin.OPEN_DRAIN,Pin.PULL_UP,value=1); sda.init(Pin.OPEN_DRAIN,Pin.PULL_UP,value=1)
    def wait(self): _cf.delay_us(self.delay)
    def start(self):
        self.sda(1); self.scl(1); self.wait(); self.sda(0); self.wait(); self.scl(0)
    def stop(self):
        self.sda(0); self.wait(); self.scl(1); self.wait(); self.sda(1); self.wait()
    def _write(self,b):
        for bit in range(7,-1,-1):
            self.sda((b>>bit)&1); self.wait(); self.scl(1); self.wait(); self.scl(0)
        self.sda(1); self.wait(); self.scl(1); self.wait(); ack=self.sda()==0; self.scl(0)
        return ack
    def _read(self,ack):
        self.sda(1); b=0
        for _ in range(8):
            self.wait(); self.scl(1); self.wait(); b=(b<<1)|self.sda(); self.scl(0)
        self.sda(0 if ack else 1); self.wait(); self.scl(1); self.wait(); self.scl(0); self.sda(1)
        return b
    def scan(self):
        result=[]
        for address in range(8,120):
            self.start()
            if self._write(address<<1): result.append(address)
            self.stop()
        return result
    def writeto(self,address,buf,stop=True):
        self.start()
        if not self._write(address<<1): self.stop(); raise OSError(5)
        n=0
        for b in buf:
            if not self._write(b): self.stop(); raise OSError(5)
            n+=1
        if stop: self.stop()
        return n
    def readfrom(self,address,n,stop=True):
        self.start()
        if not self._write((address<<1)|1): self.stop(); raise OSError(5)
        data=bytes(self._read(i<n-1) for i in range(n))
        if stop: self.stop()
        return data
    def readfrom_into(self,address,buf,stop=True): buf[:]=self.readfrom(address,len(buf),stop)
    def readfrom_mem(self,address,mem,n,*,addrsize=8):
        self.writeto(address,mem.to_bytes(addrsize//8,'big'),False)
        return self.readfrom(address,n)
    def writeto_mem(self,address,mem,buf,*,addrsize=8): return self.writeto(address,mem.to_bytes(addrsize//8,'big')+buf)

class SoftSPI:
    MSB=0
    def __init__(self,*,baudrate=10000,polarity=0,phase=0,bits=8,firstbit=MSB,sck,mosi,miso):
        if not 10000<=baudrate<=20000 or polarity or phase or bits!=8 or firstbit!=self.MSB: raise ValueError('SoftSPI: MODE0/MSB/8bit/10-20kHz')
        self.sck=sck; self.mosi=mosi; self.miso=miso; self.delay=500000//baudrate
        sck.init(Pin.OUT,value=0); mosi.init(Pin.OUT,value=0); miso.init(Pin.IN,Pin.PULL_UP)
    def _byte(self,b):
        n=0
        for bit in range(7,-1,-1):
            self.mosi((b>>bit)&1); _cf.delay_us(self.delay); self.sck(1); _cf.delay_us(self.delay); n=(n<<1)|self.miso(); self.sck(0)
        return n
    def write(self,buf):
        for b in buf: self._byte(b)
    def read(self,n,write=0): return bytes(self._byte(write) for _ in range(n))
    def readinto(self,buf,write=0): buf[:]=self.read(len(buf),write)
    def write_readinto(self,buf,out):
        if len(buf)!=len(out): raise ValueError('buffer length')
        for i,b in enumerate(buf): out[i]=self._byte(b)
`;
