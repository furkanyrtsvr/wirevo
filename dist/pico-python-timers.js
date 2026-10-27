// Cooperative Python callbacks use simulated time, never wall-clock timer IRQ claims.
export const picoTimerSource=String.raw`
_timers=[]
_polling=False
_irq_enabled=True
_pin_drain=_drain_irq
def _poll():
    global _polling
    if _polling or not _irq_enabled:return
    _polling=True
    try:
        _pin_drain()
        import sys
        if 'rp2' in sys.modules:sys.modules['rp2']._poll_irqs()
        now=int(_cf.ticks_us())
        for timer in tuple(_timers):
            if timer.callback and now>=timer.due:
                callback=timer.callback
                if timer.mode==Timer.ONE_SHOT:timer.deinit()
                else:timer.due=now+timer.interval
                callback(timer)
    finally:_polling=False
_drain_irq=_poll
def _sleep_us(us):_cf.delay_us(us);_poll()
time.sleep_us=_sleep_us
time.sleep_ms=lambda ms:_sleep_us(ms*1000)
time.sleep=lambda sec:_sleep_us(sec*1000000)
time.ticks_us=lambda:int(_cf.ticks_us())&0x3fffffff
time.ticks_ms=lambda:(int(_cf.ticks_us())//1000)&0x3fffffff
time.ticks_add=lambda ticks,delta:(ticks+delta)&0x3fffffff
time.ticks_diff=lambda a,b:((a-b+0x20000000)&0x3fffffff)-0x20000000
class Timer:
    ONE_SHOT=0
    PERIODIC=1
    def __init__(self,id=-1,**kw):
        if id!=-1:raise ValueError('Pico virtual Timer id=-1')
        self.callback=None
        if kw:self.init(**kw)
    def init(self,*,mode=PERIODIC,period=-1,freq=-1,callback=None,hard=False):
        if hard:raise NotImplementedError('Timer callbacks are cooperative')
        interval=int(1000000/freq) if freq>0 else int(period*1000)
        if mode not in (0,1) or interval<1 or interval>10000000 or not callable(callback):raise ValueError('Timer mode/callback/interval (1 us..10 s)')
        self.deinit();self.mode=mode;self.interval=interval;self.callback=callback;self.due=int(_cf.ticks_us())+interval;_timers.append(self)
    def deinit(self):
        self.callback=None
        if self in _timers:_timers.remove(self)
def disable_irq():
    global _irq_enabled
    old=_irq_enabled;_irq_enabled=False;return old
def enable_irq(state=True):
    global _irq_enabled
    _irq_enabled=bool(state);_poll()
def idle():_sleep_us(100)
def unique_id():return bytes.fromhex(_cf.unique_id())
class PWM(PWM):
    def duty_ns(self,value=None):
        if value is None:return round(self.duty*1000000000/(65535*self.hz))
        self.duty_u16(round(value*self.hz*65535/1000000000))
class UART(UART):
    def readline(self):
        self.any()
        if not self.pending:return None
        n=self.pending.index(10)+1 if 10 in self.pending else len(self.pending)
        return self.read(n)
    def flush(self):pass
    def txdone(self):return True
`;
