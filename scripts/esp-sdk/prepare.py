import urllib.request,hashlib,pathlib,concurrent.futures,zipfile
root=pathlib.Path(__file__).resolve().parents[2]/'research/esp32/sdk'
root.mkdir(parents=True,exist_ok=True)
items=[('esp32-core-3.3.8.zip','https://github.com/espressif/arduino-esp32/releases/download/3.3.8/esp32-core-3.3.8.zip','8159cefaa2eea131360ac32393d741d462583297c8c1e5169ca48139fa324173'),('rv32.zip','https://github.com/espressif/crosstool-NG/releases/download/esp-14.2.0_20260121/riscv32-esp-elf-14.2.0_20260121-x86_64-w64-mingw32.zip','c2734714e59f684b74d1cb278f75b4ae9ec546aa1e55d73786ef039410e4a8f7')]
def prepare(item):
 name,url,sha=item;p=root/name
 if not p.exists():
  with urllib.request.urlopen(url,timeout=120) as response,p.open('wb') as out:
   while chunk:=response.read(1024*1024):out.write(chunk)
 digest=hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
 if digest!=sha:raise ValueError(name+' SHA mismatch')
 print(name+' verified '+str(p.stat().st_size),flush=True)
 with zipfile.ZipFile(p) as z:z.extractall(root)
 print(name+' extracted',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(prepare,items))
prepare(('esp32c3-libs-3.3.8.zip','https://github.com/espressif/arduino-esp32/releases/download/3.3.8/esp32c3-libs-3.3.8.zip','9157ef480198ff387444649e5a9362840b3fc4f35e481697fb68cb9f2a9fb04a'))
