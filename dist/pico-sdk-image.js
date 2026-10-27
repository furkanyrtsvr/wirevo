import {parseROMUF2} from './pico-rom-uf2.js';
import {PICO_BOARDS} from './pico-boards.js';
export function nativeSDKImage(uf2,id){const b=PICO_BOARDS[id];if(!b)throw Error('Pico kartı geçersiz.');const {pages}=parseROMUF2(uf2,b),end=Math.max(...[...pages].map(([a,d])=>a-0x10000000+d.length));const image=new Uint8Array(end).fill(255);for(const[a,d]of pages)image.set(d,a-0x10000000);return image;}
export function validateNativeSDKImage(image,id){const b=PICO_BOARDS[id];if(!b||!(image instanceof Uint8Array)||image.length<256||image.length>b.flashSize)throw Error('Native SDK flash boyutu geçersiz.');return image;}
