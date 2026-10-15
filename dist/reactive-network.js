// Backward Euler companion elements, immutable history while a step is solved.
// Open capacitor / winding DCR for standalone DC; zero stored energy on reset.
export class ReactiveNetwork {
 constructor(project,cycle=0){this.parts=project.components.filter(c=>['capacitor','inductor'].includes(c.type));this.history=new Map(this.parts.map(c=>[c.id,0]));this.cycle=cycle;this.steps=0;const resistors=project.components.filter(c=>c.type==='resistor').map(c=>c.params.ohms),minR=Math.min(...resistors,1000),maxR=Math.max(...resistors,100);const target=Math.min(.001,...this.parts.map(c=>c.type==='capacitor'?(c.params.farads??.0001)*minR/50:(c.params.henries??.1)/(maxR+(c.params.dcr??1))/50));this.stepCycles=Math.max(160,Math.min(16000,Math.floor(target*16000000)));this.limited=target<.00001;}
 get active(){return!!this.parts.length;}
 stamps(dt=0){return new Map(this.parts.map(c=>{const previous=this.history.get(c.id)||0;if(c.type==='capacitor')return[c.id,{ohms:(dt/(c.params.farads??.0001))+(c.params.esr??1),offset:previous}];const ratio=(c.params.henries??.1)/Math.max(dt,1e-9);return[c.id,{ohms:ratio+(c.params.dcr??1),offset:-ratio*previous}];}));}
 commit(solution,dt,cycle){for(const c of this.parts){const current=solution.currents.get(c.id);if(Number.isFinite(current))this.history.set(c.id,c.type==='capacitor'?(this.history.get(c.id)||0)+dt/(c.params.farads??.0001)*current:current);}this.cycle=cycle;this.steps++;}
 state(solution){return Object.fromEntries(this.parts.map(c=>[c.id,{type:c.type,stored:this.history.get(c.id)||0,current:solution?.currents.get(c.id)??null,energy:c.type==='capacitor'?.5*(c.params.farads??.0001)*(this.history.get(c.id)||0)**2:.5*(c.params.henries??.1)*(this.history.get(c.id)||0)**2}]));}
}
