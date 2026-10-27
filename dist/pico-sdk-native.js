import {NativePicoPython} from './pico-native-python.js';
import {loadPicoROM} from './pico-rom-assets.js';
import {validateNativeSDKImage} from './pico-sdk-image.js';
import {PICO_BOARDS} from './pico-boards.js';
export async function loadNativePicoSDK(id,image,project){const rom=await loadPicoROM(PICO_BOARDS[id].mcu);return new NativePicoSDK(id,rom,validateNativeSDKImage(image,id),project);}
export class NativePicoSDK extends NativePicoPython{
 constructor(id,rom,image,project){super(id,rom,image,project,'');this.rom=rom;this.nativePython=false;this.nativeSDK=true;this.stage='running';this.flashService={bootsel:false};}
 picoSnapshot(){return {...super.picoSnapshot(),execution:'pico-sdk-native',profile:'Original ROM / SDK boot2 or picobin',version:null};}
 registers(){return Array.from(this.newer?this.core.regs.r:this.core.registers);}
 setDebugInfo(){}
}
