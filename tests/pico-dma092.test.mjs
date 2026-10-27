import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{loadMicroPython}from'../dist/micropython/micropython.mjs';import{PicoPythonCircuit,picoMachineSource,picoPythonBindings}from'../dist/pico-python.js';import{picoRP2Source}from'../dist/pico-python-pio.js';import{createPicoProject}from'../dist/pico-project.js';import{PICO_BOARDS}from'../dist/pico-boards.js';
const wasmBinary=readFileSync(new URL('../dist/micropython/micropython.wasm',import.meta.url));
for(const id of Object.keys(PICO_BOARDS))test(id+' new Python DMA native bus, buffers, IRQ and PIO DREQ',async()=>{const r=new PicoPythonCircuit(id,createPicoProject({board:id,language:'micropython'})),mp=await loadMicroPython({wasmBinary});try{mp.FS.writeFile('machine.py',picoMachineSource);mp.FS.writeFile('rp2.py',picoRP2Source);mp.registerJsModule('_cf',picoPythonBindings(r));mp.runPython(`from machine import Pin
from array import array
import rp2,time
src=array('I',[0x11223344,0x12345678,0xabcdef01]);dest=array('I',[0,0,0])
d=rp2.DMA();events=[]
d.irq(lambda channel:events.append(channel.channel))
ctrl=d.pack_ctrl(bswap=True,irq_quiet=False)
fields=d.unpack_ctrl(ctrl)
d.config(read=src,write=dest,count=3,ctrl=ctrl,trigger=True)
while d.active():pass
time.sleep_us(1)
copied=list(dest);remaining=d.count;irqs=len(events)
d.close()
@rp2.asm_pio(set_init=rp2.PIO.OUT_LOW,out_init=rp2.PIO.OUT_LOW,out_shiftdir=rp2.PIO.SHIFT_RIGHT)
def program():
    pull(block)
    out(pins,1)
    mov(isr,osr)
    push(block)
sm=rp2.StateMachine(0,program,freq=1000000,out_base=Pin(15),set_base=Pin(15));sm.active(1)
tx=rp2.DMA();rx=rp2.DMA();words=array('I',[7,3]);received=array('I',[0,0])
rx.config(read=sm,write=received,count=2,ctrl=rx.pack_ctrl(inc_read=False,treq_sel=4),trigger=True)
tx.config(read=words,write=sm,count=2,ctrl=tx.pack_ctrl(inc_write=False,treq_sel=0),trigger=True)
guard=0
while rx.active():
    guard+=1
    if guard>10000:raise RuntimeError('PIO DMA stalled')
pio_data=list(received)
tx.close();rx.close();sm.active(0)
reuse=rp2.DMA();reused=reuse.channel;reuse.close()
`);const get=n=>mp.globals.get(n);mp.runPython('copy_ok=copied==[0x44332211,0x78563412,0x01efcdab]\npio_ok=pio_data==[3,1]');assert.equal(get('copy_ok'),true);assert.equal(get('pio_ok'),true);assert.ok(r.circuit.solution.ledResults.get('led1').current>.003,JSON.stringify({pio:r.native.rp.pio[0].pinValues,pin:r.native.pinStates().GPIO15}));assert.equal(get('remaining'),0);assert.equal(get('irqs'),1);assert.equal(get('reused'),0);assert.equal(r.pythonDMA.size,0);assert.equal(r.dmaRegions.size,0);assert.throws(()=>mp.runPython('d.active()'));assert.throws(()=>mp.runPython("bad=rp2.DMA()\nbad.config(read=b'a',write=bytearray(1),count=4)\nbad.active(1)"));mp.runPython('bad.close()');assert.throws(()=>mp.runPython('bad=rp2.DMA()\nbad.pack_ctrl(size=3)'));mp.runPython('bad.close()');}finally{r.dispose();}});
