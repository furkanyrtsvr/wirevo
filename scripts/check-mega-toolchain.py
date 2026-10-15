"""Build the pinned Arduino Mega core and a native avr6 acceptance firmware.

Portable preparation only: this does not register an unverified UI board.
Usage: python scripts/check-mega-toolchain.py --toolchain PATH --core PATH
"""
from pathlib import Path
import argparse, subprocess, hashlib, json

parser = argparse.ArgumentParser()
parser.add_argument('--toolchain', type=Path, required=True)
parser.add_argument('--core', type=Path, required=True)
parser.add_argument('--output', type=Path, default=Path('.sites-runtime/mega-build'))
args = parser.parse_args()
tools = args.toolchain.resolve() / 'bin'
core = args.core.resolve() / 'cores/arduino'
variant = args.core.resolve() / 'variants/mega'
out = args.output.resolve()
out.mkdir(parents=True, exist_ok=True)
flags = ['-mmcu=atmega2560', '-DF_CPU=16000000L', '-DARDUINO=10819',
         '-DARDUINO_AVR_MEGA2560', '-DARDUINO_ARCH_AVR', '-Os',
         '-ffunction-sections', '-fdata-sections', '-I'+str(core), '-I'+str(variant)]
def run(tool, arguments):
    exe = tools / (tool + ('.exe' if (tools / (tool+'.exe')).exists() else ''))
    result = subprocess.run([str(exe), *map(str, arguments)], capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout

objects = []
for source in sorted(core.iterdir()):
    if source.suffix not in {'.cpp', '.c', '.S'}:
        continue
    cpp = source.suffix == '.cpp'
    obj = out / ('core_'+source.stem+('_asm' if source.suffix == '.S' else '')+'.o')
    run('avr-g++' if cpp else 'avr-gcc', flags +
        (['-std=gnu++11', '-fno-exceptions', '-fno-threadsafe-statics'] if cpp else []) +
        ['-c', source, '-o', obj])
    objects.append(obj)
archive = out / 'arduino-mega.a'
# Create a fresh archive without retaining stale members.
archive.write_bytes(b'!<arch>\n')
run('avr-ar', ['rcs', archive, *objects])
sketch = out / 'accept.cpp'
sketch.write_text('''#include <Arduino.h>
#if !defined(__AVR_ATmega2560__) || !defined(ARDUINO_AVR_MEGA2560)
#error Wrong processor target
#endif
extern const uint8_t farValue[];
volatile byte buffer[3000];
void setup(){Serial.begin(115200);Serial1.begin(9600);Serial2.begin(19200);Serial3.begin(38400);pinMode(53,OUTPUT);digitalWrite(53,HIGH);analogWrite(44,128);}
void loop(){Serial.print("FAR=");Serial.print(pgm_read_byte_far(pgm_get_far_address(farValue)));Serial.print(" MEGA A15=");Serial.print(analogRead(A15));Serial.print(" MS=");Serial.println(millis());Serial1.write('A');Serial2.write('B');Serial3.write('C');buffer[2999]=1;delay(100);}
''', encoding='utf-8')
far = out / 'far.S'
far.write_text('.section .fartext,"a",@progbits\n.global farValue\nfarValue: .byte 77\n', encoding='utf-8')
run('avr-gcc', ['-mmcu=atmega2560', '-c', far, '-o', out/'far.o'])
elf = out / 'accept.elf'
run('avr-g++', flags + ['-std=gnu++11', '-Wl,--gc-sections', '-Wl,--section-start=.fartext=0x20000', sketch, out/'far.o', archive, '-lm', '-o', elf])
run('avr-objcopy', ['-O', 'ihex', '-R', '.eeprom', elf, out / 'accept.hex'])
sizes = run('avr-size', ['-A', elf])
manifest = {'target':'atmega2560', 'core':'Arduino AVR 1.8.7',
            'toolchain':run('avr-g++', ['--version']).splitlines()[0],
            'coreObjects':len(objects), 'sections':sizes,
            'files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [archive, elf, out/'accept.hex']}}
(out/'verification.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps(manifest))
