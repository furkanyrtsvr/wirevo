import {solveDC} from './dc-solver.js';
/** Driving-point resistance of the solved resistive source network. Independent
 * voltage sources are grounded; a 1 V test clamp gives R=V/I. Traversal stops at
 * sources, so unrelated loads do not enter the test. No nonlinear/AC fit. */
export function sourceResistance(dc,endpoint,project){
 const target=dc.netlist.net(endpoint);if(dc.known.has(target))return 0;
 const adjacency=new Map();for(const b of dc.branches){for(const n of[b.a,b.b]){if(!adjacency.has(n))adjacency.set(n,[]);adjacency.get(n).push(b);}}
 const reached=new Set([target]),queue=[target],branches=new Map(),known=new Map([[target,1]]);
 for(let i=0;i<queue.length;i++){const node=queue[i];if(dc.known.has(node)){known.set(node,0);continue;}for(const b of adjacency.get(node)||[]){branches.set(b.id,{...b,offset:0});for(const n of[b.a,b.b])if(!reached.has(n)){reached.add(n);queue.push(n);}}}
 if(known.size===1)return null;
 if(project)for(const c of project.components)if(['capacitor','inductor','diode','zener','npn','mosfet','opamp'].includes(c.type)&&dc.netlist.groups.some(g=>g.some(e=>e.startsWith(c.id+':'))&&reached.has(dc.netlist.net(g[0]))&&!dc.known.has(dc.netlist.net(g[0]))))return null;
 const test=solveDC({known,branches:[...branches.values()]});if(!test.converged)return null;let amps=0;
 for(const b of branches.values()){const i=test.currents.get(b.id);if(b.a===target)amps+=i||0;if(b.b===target)amps-=i||0;}
 return amps>1e-15?1/amps:null;
}
