import {UnoRuntime} from './uno-runtime.js';
export {MEGA_TIMERS,MEGA_UARTS} from './mega2560-config.js';
export class Mega2560Runtime extends UnoRuntime {
 constructor(hex,{onSerial=()=>{},...options}={}){super(hex,{...options,board:'mega',dcSense:false,onSerialPort:onSerial});}
 stepCycles(count=200000){let remaining=count;while(remaining>0){super.stepCycles(Math.min(remaining,1600000));remaining-=1600000;}return this.snapshot();}
}
