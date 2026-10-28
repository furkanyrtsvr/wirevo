// The upstream pin model ignores the pad output-disable bit. Apply it before
// circuit listeners inspect the physical driver, while retaining SIO latch state.
export function installPicoGPIO(runtime){
 const newer=runtime.board.mcu==='RP2350';
 for(const pin of runtime.rp.gpio){
  const original=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(pin),'value').get;
  Object.defineProperty(pin,'value',{get(){
   if((this.padValue&128)||(newer&&(this.padValue&256))){
    return this.pulldownEnabled?4:this.pullupEnabled?3:2;
   }
   return original.call(this);
  }});
 }
}
