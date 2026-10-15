import {traceMeasurements} from './trace.js';
export const LOGIC_HZ=16000000;
export const LOGIC_COLORS=['#efd163','#56c9f4','#b993ef','#58d7a2'];
export const validLogicPin=p=>/^(D([0-9]|[1-4][0-9]|5[0-3])|A([0-9]|1[0-5])|GPIO([0-9]|[1-5][0-9]|6[0-3]))$/.test(p);
export class LogicAnalyzer{
  constructor({pins=['D13','D3','D2','D7'],capacity=30000,window=1}={}){this.capacity=capacity;this.windowCycles=Math.round(window*LOGIC_HZ);this.mode='live';this.slope='rising';this.configure(pins);}
  configure(pins,cycle=0,levels={}){this.pins=[...new Set(pins.filter(validLogicPin))].slice(0,4);this.triggerPin=this.pins[0];this.edges=[];this.initial={...levels};this.availableFrom=cycle;this.latest=cycle;this.dropped=0;this.frame=null;this.triggerCycle=null;this.armedAt=cycle;this.state=this.mode==='live'?'live':'armed';}
  setWindow(seconds){this.windowCycles=Math.round(Math.max(.001,Math.min(5,seconds))*LOGIC_HZ);if(this.mode!=='live')this.arm(this.mode);}
  arm(mode='single',slope=this.slope){this.mode=mode;this.slope=slope;this.triggerCycle=null;this.frame=null;this.armedAt=this.latest;this.state=mode==='live'?'live':'armed';}
  append(events,cycle,{dropped=0,levels={}}={}){
    let incoming=events.filter(e=>this.pins.includes(e.pin)&&Number.isFinite(e.cycle)&&e.cycle>=this.availableFrom).map(e=>({...e,high:!!e.high}));
    this.latest=cycle;
    if(dropped){incoming=incoming.filter(e=>!e.seed);this.edges=[];this.initial={...levels};this.availableFrom=incoming[0]?.cycle??cycle;this.dropped+=dropped;this.triggerCycle=null;if(!(this.mode==='single'&&this.state==='captured')){this.frame=null;this.state=this.mode==='single'?'overflow':this.mode==='auto'?'armed':'live';}}
    for(const e of incoming){if(e.seed){this.initial[e.pin]=e.high;this.availableFrom=Math.max(this.availableFrom,e.cycle);}else this.edges.push(e);}
    const cutoff=Math.max(this.availableFrom,Math.min(cycle-Math.max(5*LOGIC_HZ,this.windowCycles),this.triggerCycle===null?Infinity:this.triggerCycle-this.windowCycles/4));
    let remove=0;while(remove<this.edges.length&&this.edges[remove].cycle<cutoff)remove++;
    const overflow=Math.max(0,this.edges.length-remove-this.capacity);remove+=overflow;
    if(remove){for(let i=0;i<remove;i++)this.initial[this.edges[i].pin]=this.edges[i].high;this.availableFrom=Math.max(this.availableFrom,this.edges[remove-1].cycle);this.edges.splice(0,remove);}
    if(overflow){this.dropped+=overflow;if(this.triggerCycle!==null&&this.availableFrom>this.triggerCycle-this.windowCycles/4){this.triggerCycle=null;this.frame=null;this.state=this.mode==='single'?'overflow':'armed';}}
    if(this.mode==='live'||this.state==='overflow'||this.mode==='single'&&this.state==='captured')return;
    if(this.triggerCycle===null){const match=incoming.find(e=>!e.seed&&e.pin===this.triggerPin&&e.high===(this.slope==='rising')&&e.cycle>=this.armedAt&&e.cycle-this.windowCycles/4>=this.availableFrom);if(match){this.triggerCycle=match.cycle;this.state='post';}}
    if(this.triggerCycle!==null&&cycle>=this.triggerCycle+this.windowCycles*.75){
      const start=this.triggerCycle-this.windowCycles/4,end=start+this.windowCycles;
      this.frame=this.slice(start,end,this.triggerCycle);this.frame.dropped=this.dropped;this.frame.measurements=Object.fromEntries(this.pins.map(pin=>[pin,traceMeasurements(this.edges.filter(e=>e.pin===pin&&e.cycle<=end))]));this.state='captured';
      this.triggerCycle=null;if(this.mode==='auto'){this.armedAt=end+1;this.state='armed';}
    }
  }
  slice(start,end,trigger=null){const levels={...this.initial};for(const e of this.edges){if(e.cycle>start)break;levels[e.pin]=e.high;}return{start,end,span:this.windowCycles,trigger,levels,availableFrom:Math.max(start,this.availableFrom),edges:this.edges.filter(e=>e.cycle>=start&&e.cycle<=end).map(e=>({...e})),pins:[...this.pins]};}
  view(){return this.frame||this.slice(Math.max(0,this.latest-this.windowCycles),this.latest);}
}
export function logicPath(frame,pin,index){
  const high=7+index*21,low=high+12,x=c=>30+(c-frame.start)/frame.span*224;
  let level=!!frame.levels[pin],path='M'+x(frame.availableFrom).toFixed(2)+','+(level?high:low);
  for(const e of frame.edges)if(e.pin===pin){const xx=x(e.cycle).toFixed(2);path+=' H'+xx;level=e.high;path+=' V'+(level?high:low);}
  return path+' H'+x(frame.end).toFixed(2);
}
export function cursorMetrics(a,b){if(a===null||b===null)return null;const cycles=Math.abs(b-a),seconds=cycles/LOGIC_HZ;return{cycles,seconds,frequency:cycles?LOGIC_HZ/cycles:null};}
