from pathlib import Path
import subprocess, shutil, zipfile, json, hashlib
root=Path('.').resolve(); tools=root/'.sites-runtime/mega-tools/avr'; core=root/'.sites-runtime/mega-tools/core/ArduinoCore-avr-1.8.7'; out=root/'dist/notices/mega-toolchain'; out.mkdir(parents=True,exist_ok=True)
def run(tool,args):
 p=subprocess.run([str(tools/'bin'/f'{tool}.exe'),*map(str,args)],capture_output=True,text=True)
 if p.returncode: raise RuntimeError(p.stderr)
 return p.stdout
libs=out/'libs'; libs.mkdir(exist_ok=True)
for name in ['crtatmega2560.o','libc.a','libm.a']:
 shutil.copyfile(tools/'avr/lib/avr6'/name,libs/name)
shutil.copyfile(tools/'lib/gcc/avr/7.3.0/avr6/libgcc.a',libs/'libgcc.a')
for p in libs.iterdir(): run('avr-strip',['-g',p])
ld=out/'ldscripts';ld.mkdir(exist_ok=True);shutil.copyfile(tools/'avr/lib/ldscripts/avr6.xn',ld/'avr6.xn')
headers=out/'headers';headers.mkdir(exist_ok=True);shutil.copyfile(core/'variants/mega/pins_arduino.h',headers/'pins_arduino.h')
objdir=out/'objects';objdir.mkdir(exist_ok=True)
for p in (root/'.sites-runtime/mega-build').glob('core_*.o'):shutil.copyfile(p,objdir/p.name)
sources=root/'.sites-runtime/mega-library-sources';sources.mkdir(exist_ok=True)
for name in ['Adafruit-BusIO-1.17.4','Adafruit-GFX-1.12.6','Adafruit-SSD1306-2.5.16']:
 with zipfile.ZipFile(root/'dist/notices'/f'{name}-source.zip') as z:z.extractall(sources)
folders={}
for p in sources.iterdir():
 if 'BusIO' in p.name:folders['busio']=p
 if 'GFX' in p.name:folders['gfx']=p
 if 'SSD1306' in p.name:folders['ssd']=p
common=['-mmcu=atmega2560','-DF_CPU=16000000L','-DARDUINO=10819','-DARDUINO_AVR_MEGA2560','-DARDUINO_ARCH_AVR','-Os','-ffunction-sections','-fdata-sections']
incs=[core/'cores/arduino',core/'variants/mega',core/'libraries/Wire/src',core/'libraries/Wire/src/utility',core/'libraries/SPI/src',*folders.values()]
units={'Wire':core/'libraries/Wire/src/Wire.cpp','twi':core/'libraries/Wire/src/utility/twi.c','SPI':core/'libraries/SPI/src/SPI.cpp','BusIO_Register':folders['busio']/'Adafruit_BusIO_Register.cpp','I2CDevice':folders['busio']/'Adafruit_I2CDevice.cpp','SPIDevice':folders['busio']/'Adafruit_SPIDevice.cpp','GFX':folders['gfx']/'Adafruit_GFX.cpp','SSD1306':folders['ssd']/'Adafruit_SSD1306.cpp'}
for name,p in units.items():run('avr-g++' if p.suffix=='.cpp' else 'avr-gcc',common+[f'-I{i}' for i in incs]+(['-std=gnu++11','-fno-exceptions','-fno-threadsafe-statics'] if p.suffix=='.cpp' else [])+['-c',p,'-o',objdir/f'lib_{name}.o'])
for p in objdir.iterdir():run('avr-strip',['-g',p])
manifest={'target':'atmega2560','multilib':'avr6','core':'Arduino AVR 1.8.7','toolchain':run('avr-g++',['--version']).splitlines()[0],'coreObjects':['/objects/'+p.name for p in sorted(objdir.glob('core_*.o'))],'libs':['/libs/'+p.name for p in sorted(libs.iterdir())],'sha256':{p.relative_to(out).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in out.rglob('*') if p.is_file() and p.name!='manifest.json'}}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8');print('Mega assets:',sum(p.stat().st_size for p in out.rglob('*') if p.is_file()))
