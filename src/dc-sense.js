/** Install ADC sensing without introducing an external GPIO drive. Uses the
 * AVR8js ADC public onADCRead hook and existing UnoRuntime state/input maps.
 * External resistor/voltage-divider values still arrive via replaceInputs.
 */
export function attachDCSense(runtime){
  const originalRead=runtime.adc.onADCRead;
  runtime.adc.onADCRead=input=>{
    if(input.type===0&&input.channel>=0&&input.channel<(runtime.analogChannels||6)){
      const pin=`A${input.channel}`,state=runtime.readPin(pin);
      const voltage=state.outputEnabled?state.voltage:runtime.analogInputs.has(pin)?runtime.analogInputs.get(pin):runtime.digitalInputs.has(pin)?runtime.digitalInputs.get(pin)?5:0:state.voltage;
      runtime.adc.channelValues[input.channel]=voltage;
    }
    return originalRead(input);
  };
  return runtime;
}
