/** Actual pin-register edges, including external inputs and timer PWM.
 * AVR8js's public externalClockListeners array supports one peripheral listener
 * per bit; accessor chaining preserves later timer listener replacements.
 */
export function attachGPIOEdges(runtime,{pins=['D13','D3','D2','D7'],capacity=4096}={}){
  capacity=Math.max(8,Math.min(65536,Math.floor(capacity)));
  const ring=new Array(capacity);let selected=new Set(pins),head=0,count=0,dropped=0,startLevels={};
  const initialize=()=>{startLevels=Object.fromEntries([...selected].map(pin=>[pin,runtime.readPin(pin).high]));};
  initialize();
  const record=(pin,high)=>{
    if(!selected.has(pin))return;
    const event={pin,high,cycle:runtime.cpu.cycles};
    if(count===capacity){startLevels[ring[head].pin]=ring[head].high;ring[head]=event;head=(head+1)%capacity;dropped++;}
    else{ring[(head+count)%capacity]=event;count++;}
  };
  for(const[pin,p]of Object.entries(runtime.pinMap)){if(p.analogOnly)continue;const index=p.index,listeners=runtime.ports[p.port].externalClockListeners;
    let peripheral=listeners[index]||null;
    const dispatcher=high=>{peripheral?.(high);record(pin,high);};
    Object.defineProperty(listeners,index,{configurable:true,enumerable:true,get:()=>dispatcher,set:value=>{if(value!==dispatcher)peripheral=value;}});
  }
  return{
    select(pins){selected=new Set(pins);head=0;count=0;dropped=0;initialize();},
    drain(){const events=Array.from({length:count},(_,i)=>ring[(head+i)%capacity]),levels={...startLevels},lost=dropped;for(const event of events)startLevels[event.pin]=event.high;head=0;count=0;dropped=0;return{events,dropped:lost,startLevels:levels,atCycle:runtime.cpu.cycles};},
  };
}
