import {ReactiveNetwork} from './reactive-network.js';
// Native GPIO and MCU clock callbacks share the AVR companion-element solver.
// History is integrated with the previous GPIO state before an edge is applied.
export class NativeReactive {
 constructor(circuit){this.c=circuit;this.busy=false;}
 update(project){const now=this.c.cycle(),old=this.network,next=new ReactiveNetwork(project,now);if(old&&now>=old.cycle)for(const p of next.parts)if(old.parts.some(q=>q.id===p.id&&q.type===p.type))next.history.set(p.id,old.history.get(p.id)||0);this.network=next;this.c.reactiveStamps=next.active?next.stamps():null;this.arm();}
 get active(){return !!this.network?.active;}
 due(now){return this.active&&now>=this.network.cycle+this.network.stepCycles;}
 arm(){this.c.clockEvents=this.c.clockEvents.filter(e=>!e.reactiveEvent);if(this.active){this.c.clockEvents.push({at:Math.ceil(this.network.cycle+this.network.stepCycles),fn:()=>{},moduleEvent:true,reactiveEvent:true});this.c.clockEvents.sort((a,b)=>a.at-b.at);}}
 advance(now){if(!this.active||this.busy||now<=this.network.cycle)return false;this.busy=true;try{const n=this.network;let steps=0;while(n.cycle<now){if(++steps>100000)throw Error('Native RC/RL adım sınırı aşıldı.');const end=Math.min(now,n.cycle+n.stepCycles),dt=(end-n.cycle)/16000000;this.c.reactiveStamps=n.stamps(dt);this.c.solve();n.commit(this.c.solution,dt,end);}this.c.reactiveStamps=n.stamps();this.arm();return true;}finally{this.busy=false;}}
 snapshot(){const n=this.network;return{mode:this.active?'cycle-transient':'synchronous-dc',reactive:n?.state(this.c.solution)||{},transientSteps:n?.steps||0,stepCycles:n?.stepCycles||0,stepLimited:!!n?.limited};}
}
