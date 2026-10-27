import {readFile,writeFile} from 'node:fs/promises';
import {projectZip} from '../dist/project-zip.js';
const entries=[];
for(const name of ['wirevo-sdk-bridge.py','build-pico-sdk.py']){const content=await readFile(new URL(name,import.meta.url),'utf8');entries.push({name,content});await writeFile(new URL('../dist/'+name,import.meta.url),content);}
entries.push({name:'wirevo-sdk.cmd',content:'@echo off\r\npython "%~dp0wirevo-sdk-bridge.py" --setup --open\r\npause\r\n'});
entries.push({name:'README.txt',content:'Wirevo SDK helper 0.95.0\n\n1. Install Python 3.9+, official Pico SDK (with required submodules), Arm GNU, CMake and Ninja.\n2. Extract this ZIP and double-click wirevo-sdk.cmd. First use asks for the installed tool paths.\n3. The helper opens Wirevo with a one-time pairing fragment. Click Yardimciya baglan. Alternatively choose the local connection.json in Pico SDK / CMake.\n4. Select Resmi Pico SDK, then use Derle. Firmware loads automatically. Use Calistir to start it.\n\nThe helper stays open on 127.0.0.1 only. Close its window to stop. CMake runs your trusted project commands as your OS user. No public build service is started.\nConfiguration and connection files live under LOCALAPPDATA/WirevoSDK on Windows. Connection credentials are not part of project JSON or ZIP exports.\nCurrent native firmware import supports ARM, not Hazard3, and up to 1 MB UF2. Native SDK source-level debugger mapping is not available.\n'});
await writeFile(new URL('../dist/wirevo-sdk-helper.zip',import.meta.url),projectZip(entries));
console.log('SDK helper package ready.');
