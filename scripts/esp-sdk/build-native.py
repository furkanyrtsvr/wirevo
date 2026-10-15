import pathlib,subprocess,shlex,concurrent.futures
r=pathlib.Path(__file__).resolve().parents[2]/'research/esp32';sdk=r/'sdk/esp32c3-libs';core=r/'sdk/esp32-core-3.3.8/cores/esp32';out=r/'native-c3';out.mkdir(exist_ok=True)
tool=r/'sdk/riscv32-esp-elf/bin'
def flags(name):return shlex.split((sdk/'flags'/name).read_text())
common=['-Os','-DF_CPU=160000000L','-DARDUINO=10819','-DARDUINO_ARCH_ESP32','-DARDUINO_ESP32C3_DEV','-DARDUINO_BOARD="ESP32C3_DEV"','-DARDUINO_VARIANT="esp32c3"','-DARDUINO_USB_CDC_ON_BOOT=0','-I'+str(core),'-I'+str(core.parent.parent/'variants/esp32c3'),'-I'+str(sdk/'dio_qspi/include'),'-iprefix',str(sdk/'include')+'/',*flags('defines'),*flags('includes')]
def run(args):
 p=subprocess.run([str(x) for x in args],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
 if p.returncode:
  (out/'last-error.log').write_text(p.stdout,encoding='utf-8');raise RuntimeError(p.stdout[:3000])
 return p.stdout
def compile(p):
 dest=out/(p.name+'.o');language='cpp_flags' if p.suffix=='.cpp' else 'S_flags' if p.suffix=='.S' else 'c_flags';exe='g++' if p.suffix=='.cpp' else 'gcc'
 if not dest.exists():run([tool/('riscv32-esp-elf-'+exe+'.exe'),'-c',*flags(language),*common,p,'-o',dest])
 return dest
sources=[p for p in core.iterdir() if p.suffix in ('.c','.cpp','.S')]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:objects=list(pool.map(compile,sources))
print('Core objects '+str(len(objects)),flush=True)
run([tool/'riscv32-esp-elf-ar.exe','rcs',out/'core.a',*objects])
sketch=out/'sketch.cpp';sketch.write_text('#include <Arduino.h>\nvoid setup(){Serial.begin(115200);pinMode(2,OUTPUT);Serial.println("NATIVE ARDUINO C3 OK");}\nvoid loop(){digitalWrite(2,HIGH);Serial.println("GPIO HIGH");delay(10);digitalWrite(2,LOW);Serial.println("GPIO LOW");delay(10);}\n')
obj=compile(sketch)
run([tool/'riscv32-esp-elf-g++.exe',*flags('ld_flags'),'-L'+str(sdk/'lib'),'-L'+str(sdk/'ld'),'-L'+str(sdk/'dio_qspi'),*flags('ld_scripts'),'-Wl,--wrap=esp_panic_handler','-Wl,--start-group',obj,out/'core.a',*flags('ld_libs'),'-Wl,--end-group','-Wl,-EL','-o',out/'sketch.elf'])
print(run([tool/'riscv32-esp-elf-size.exe',out/'sketch.elf']),flush=True)
