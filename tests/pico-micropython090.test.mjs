import{picoNetworkSource}from'../dist/pico-python-network.js';
import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{loadMicroPython}from'../dist/micropython/micropython.mjs';import{PicoPythonCircuit,picoMachineSource,picoPythonBindings}from'../dist/pico-python.js';import{createPicoProject}from'../dist/pico-project.js';import{PICO_BOARDS}from'../dist/pico-boards.js';import{validateProject}from'../dist/core.js';import{exportProjectZip,importProjectBytes}from'../dist/project-import.js';import{sourceKey}from'../dist/source-files.js';
const wasmBinary=readFileSync(new URL('../dist/micropython/micropython.wasm',import.meta.url));
for(const id of Object.keys(PICO_BOARDS))test(id+' genuine Pico MicroPython drives nets, ADC/PWM/IRQ/UART/SPI/I2C memory',async()=>{const p=createPicoProject({board:id,language:'micropython'});p.settings.picoEnvironment={temperatureC:40,vsys:4.2,vbus:false};p.components.push({id:'ee',type:'eeprom',x:700,y:400,rotation:0,params:{}},{id:'pull_sda',type:'resistor',x:700,y:500,rotation:0,params:{ohms:4700}},{id:'pull_scl',type:'resistor',x:800,y:500,rotation:0,params:{ohms:4700}});for(const[from,to]of [['mcu:GPIO13','mcu:GPIO14'],['mcu:GPIO19','mcu:GPIO16'],['mcu:3V3','ee:VCC'],['mcu:GND','ee:GND'],['mcu:GND','ee:A0'],['mcu:GND','ee:A1'],['mcu:GND','ee:A2'],['mcu:GND','ee:WP'],['mcu:GPIO0','ee:SDA'],['mcu:GPIO1','ee:SCL'],['mcu:3V3','pull_sda:1'],['pull_sda:2','ee:SDA'],['mcu:3V3','pull_scl:1'],['pull_scl:2','ee:SCL']])p.wires.push({id:'extra'+p.wires.length,from,to,color:'#14b8a6',points:[]});const r=new PicoPythonCircuit(id,validateProject(p)),output=[],mp=await loadMicroPython({wasmBinary,stdout:s=>output.push(s)});try{mp.FS.writeFile('machine.py',picoMachineSource);mp.FS.writeFile('network.py',picoNetworkSource);mp.FS.writeFile('lesson.py','answer=42');mp.registerJsModule('_cf',picoPythonBindings(r));mp.runPython(`from machine import Pin,ADC,PWM,SPI,I2C,UART,mem32
import time,lesson
led=Pin(15,Pin.OUT,value=1)
onboard=Pin('LED',Pin.OUT,value=1)
button=Pin(14,Pin.IN,Pin.PULL_DOWN)
source=Pin(13,Pin.OUT,value=0)
irq_count=0
def edge(pin):
    global irq_count
    irq_count+=1
button.irq(handler=edge)
source.on()
source.off()
temperature=ADC(4).read()
vsys=ADC(3).read()
mem32[0x20001000]=0x12345678
memory=mem32[0x20001000]
serial=UART(0)
serial.write('Pico Python UART')
spi=SPI(0,baudrate=20000)
data=bytearray(1)
spi.write_readinto(bytes([0xa5]),data)
loopback=data[0]
i2c=I2C(0,freq=10000)
i2c.writeto_mem(0x50,16,bytes([42]),addrsize=16)
time.sleep_ms(6)
saved=i2c.readfrom_mem(0x50,16,1,addrsize=16)[0]
answer=lesson.answer
`);assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);assert.equal(r.native.services.snapshot().onboardLED,true);assert.equal(mp.globals.get('irq_count'),2);assert.equal(mp.globals.get('temperature'),848);assert.equal(mp.globals.get('vsys'),1737);assert.equal(mp.globals.get('memory')>>>0,0x12345678);assert.equal(mp.globals.get('loopback'),0xa5);assert.equal(mp.globals.get('saved'),42);assert.equal(mp.globals.get('answer'),42);assert.match(r.serial,/Pico Python UART/);if(PICO_BOARDS[id].wireless){mp.runPython("import network\nwlan=network.WLAN()\nwlan.active(True)\nwlan.connect('WirevoLab','wirevo1234')\nwhile not wlan.isconnected():time.sleep_us(100)\nip=wlan.ifconfig()[0]\nmaclen=len(wlan.config('mac'))\nwlan.disconnect()\nlinked=wlan.isconnected()");assert.equal(mp.globals.get('ip'),'192.168.4.2');assert.equal(mp.globals.get('maclen'),6);assert.equal(mp.globals.get('linked'),false);}else assert.throws(()=>mp.runPython('import network\nwlan=network.WLAN()'));r.queueSerial('Q');mp.runPython("received=serial.read(1)==b'Q'\npwm=PWM(Pin(15),freq=1000,duty_u16=32768)\nduty=pwm.duty_u16()\ntime.sleep_us(100)\npwm.deinit()\nled=Pin(15,Pin.OUT,value=0)");assert.equal(mp.globals.get('received'),true);assert.equal(mp.globals.get('duty'),32768);assert.equal(r.circuit.solution.ledResults.get('led1').current,0);p.wires=p.wires.filter(w=>w.to!=='ee:VCC');r.circuit.update(p);assert.throws(()=>mp.runPython("i2c.writeto(0x50,b'\\x00')"));assert.throws(()=>mp.runPython('Pin(99)'));}finally{r.dispose();}});
test('Pico Python files and firmware survive JSON/ZIP, wrong language or architecture is rejected',async()=>{const p=createPicoProject({board:'pico-wh',language:'micropython'});p.files=[{name:'lesson.py',content:'answer=42'}];p.firmware={format:'micropython',payload:p.code,source:p.code,sourceKey:sourceKey(p),board:'pico-wh'};const q=(await importProjectBytes(exportProjectZip(p))).project;assert.equal(q.language,'micropython');assert.equal(q.files[0].content,'answer=42');assert.equal(q.firmware.payload,p.code);q.settings.picoArchitecture='riscv';assert.throws(()=>validateProject(q));});
