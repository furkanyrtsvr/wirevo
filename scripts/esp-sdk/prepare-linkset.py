from pathlib import Path
import subprocess,concurrent.futures,json
r=Path(__file__).resolve().parents[2]/'research/esp32';sdk=r/'sdk';target=r/'sdk-linkset';tool=sdk/'riscv32-esp-elf/bin/riscv32-esp-elf-objcopy.exe'
folders={'lib':sdk/'esp32c3-libs/lib','sys':sdk/'riscv32-esp-elf/riscv32-esp-elf/lib/rv32imc_zicsr_zifencei/ilp32','gcc':sdk/'riscv32-esp-elf/lib/gcc/riscv32-esp-elf/14.2.0/rv32imc_zicsr_zifencei/ilp32'}
items=[]
for name,folder in folders.items():
 (target/name).mkdir(parents=True,exist_ok=True)
 for source in folder.glob('*.a'):items.append((source,target/name/source.name))
def strip(item):
 source,dest=item
 subprocess.run([str(tool),'--strip-debug',str(source),str(dest)],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 return {'path':str(dest.relative_to(target)),'originalBytes':source.stat().st_size,'bytes':dest.stat().st_size}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:manifest=list(pool.map(strip,items))
(target/'manifest.json').write_text(json.dumps(manifest,indent=2))
print(len(manifest),'archives',sum(x['originalBytes'] for x in manifest),'->',sum(x['bytes'] for x in manifest))
