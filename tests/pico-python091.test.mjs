import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{loadMicroPython}from'../dist/micropython/micropython.mjs';import{PicoPythonCircuit,picoMachineSource,picoPythonBindings}from'../dist/pico-python.js';import{picoRP2Source}from'../dist/pico-python-pio.js';import{createPicoProject}from'../dist/pico-project.js';import{PICO_BOARDS}from'../dist/pico-boards.js';
const wasmBinary=readFileSync(new URL('../dist/micropython/micropython.wasm',import.meta.url));
for(const id of Object.keys(PICO_BOARDS))test(id+' new genuine Python Timer and native PIO assembler/SM',async()=>{const r=new PicoPythonCircuit(id,createPicoProject({board:id,language:'micropython'})),mp=await loadMicroPython({wasmBinary});try{mp.FS.writeFile('machine.py',picoMachineSource);mp.FS.writeFile('rp2.py',picoRP2Source);mp.registerJsModule('_cf',picoPythonBindings(r));mp.runPython(`from machine import Pin,Timer,PWM,UART,disable_irq,enable_irq
import machine,time,rp2
events=[]
periodic=Timer(-1,period=1,callback=lambda t:events.append(1))
once=Timer(-1,mode=Timer.ONE_SHOT,period=2,callback=lambda t:events.append(9))
time.sleep_ms(1)
masked=disable_irq()
time.sleep_ms(2)
masked_count=len(events)
enable_irq(masked)
time.sleep_ms(1)
periodic.deinit()
time.sleep_ms(5)
event_count=len(events)
once_count=events.count(9)
ticks=time.ticks_diff(time.ticks_add(0x3ffffffe,5),0x3ffffffe)
identity=len(machine.unique_id())
@rp2.asm_pio(set_init=rp2.PIO.OUT_LOW, out_shiftdir=rp2.PIO.SHIFT_RIGHT)
def blink():
    wrap_target()
    pull(block)
    out(pins,1)
    mov(isr,osr)
    push(block)
    wrap()
sm=rp2.StateMachine(0,blink,freq=1000000,out_base=Pin(15),set_base=Pin(15))
sm.active(1)
sm.put(0xab)
time.sleep_us(10)
fifo=sm.rx_fifo()
value=sm.get()
sm.active(0)
active=sm.active()
sm.exec('set(pins,1)')
time.sleep_us(1)
led=(machine.mem32[0xd0000004]>>15)&1
irq_events=[]
sm.irq(lambda s:irq_events.append(s.id))
sm.exec('irq(0)')
time.sleep_us(1)
pio_irq_count=len(irq_events)
sm.irq(None)
encoded=rp2.asm_pio_encode('set(pins,1)',0)
@rp2.asm_pio(sideset_init=rp2.PIO.OUT_LOW)
def side():
    label('again')
    nop().side(1)[1]
    jmp('again').side(0)
side_words=side['code']
uart=UART(0)
`);const get=n=>mp.globals.get(n);assert.equal(get('masked_count'),1);assert.equal(get('event_count'),4);assert.equal(get('once_count'),1);assert.equal(get('ticks'),5);assert.equal(get('identity'),8);assert.equal(get('fifo'),1);assert.equal(get('value'),0x55);assert.equal(get('active'),false);assert.equal(get('led'),1);assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);assert.equal(get('encoded'),0xe001);assert.equal(get('pio_irq_count'),1);r.queueSerial('one\ntwo');mp.runPython("line=uart.readline()==b'one\\n'\nrest=uart.read()==b'two'\npwm=PWM(Pin(13),freq=1000)\npwm.duty_ns(500000)\nns=pwm.duty_ns()\npwm.deinit()");assert.equal(get('line'),true);assert.equal(get('rest'),true);assert.ok(Math.abs(get('ns')-500000)<20);assert.throws(()=>mp.runPython('Timer(0)'));assert.throws(()=>mp.runPython('rp2.StateMachine(99)'));assert.throws(()=>mp.runPython('rp2.asm_pio_encode("set(pins,99)",0)'));}finally{r.dispose();}});
