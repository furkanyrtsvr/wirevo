// Passive DC networks, ideal voltage clamps and fixed-Vf diodes.
// Active-set MNA, with tiny off-state conductance used only to seed floating
// intermediate diode nodes. Absolute results on physically floating islands
// remain null. Degenerate diode constraints receive 1 micro-ohm regularization.
export function solveDC({nodes=[],known=new Map(),branches=[],leds=[],clamps=[],controlled=[],opamps=[]}={}) {
  known=known instanceof Map?new Map(known):new Map(Object.entries(known));
  const nodeSet=new Set(nodes),diagnostics=[],currents=new Map(),ledResults=new Map();
  for(const[n,v]of known){if(!Number.isFinite(v))throw new Error('Known voltage must be finite');nodeSet.add(n);}
  for(const b of branches){if(!Number.isFinite(b.ohms)||b.ohms<=0)throw new Error('Resistance must be positive and finite');nodeSet.add(b.a);nodeSet.add(b.b);}
  for(const l of leds){if(!Number.isFinite(l.vf??2)||(l.vf??2)<0)throw new Error('LED Vf must be nonnegative');nodeSet.add(l.a);nodeSet.add(l.k);}
  for(const c of clamps){if(!Number.isFinite(c.volts))throw Error('Clamp voltage must be finite');nodeSet.add(c.a);nodeSet.add(c.b);}
  for(const o of opamps)for(const n of[o.out,o.ref,o.plus,o.minus,o.vcc])nodeSet.add(n);
  for(const c of controlled){if(!Number.isFinite(c.gain)||c.gain<0)throw Error('Current gain must be nonnegative');nodeSet.add(c.a);nodeSet.add(c.b);}
  if(nodeSet.size>2000||branches.length>1000||leds.length>150)throw new Error('DC network size limit exceeded');
  const all=[...nodeSet],potentialGraph=new Map(all.map(n=>[n,[]]));
  const link=(graph,a,b)=>{graph.get(a).push(b);graph.get(b).push(a);};
  for(const b of branches)link(potentialGraph,b.a,b.b);
  for(const l of leds)link(potentialGraph,l.a,l.k);
  for(const c of [...clamps,...controlled])link(potentialGraph,c.a,c.b);
  const reachable=(graph)=>{const reached=new Set(known.keys()),queue=[...reached];for(let i=0;i<queue.length;i++)for(const n of graph.get(queue[i])||[])if(!reached.has(n)){reached.add(n);queue.push(n);}return reached;};
  const bias=opamps.length?solveDC({nodes,known,branches,leds,clamps,controlled}).voltages:known;
  const powered=o=>Number.isFinite(bias.get(o.vcc))&&Number.isFinite(bias.get(o.ref))&&bias.get(o.vcc)-bias.get(o.ref)>=3&&bias.get(o.vcc)-bias.get(o.ref)<=30;
  const candidates=opamps.filter(o=>{const reached=reachable(potentialGraph);return powered(o)&&reached.has(o.ref)&&reached.has(o.vcc)&&reached.has(o.plus);});
  for(const o of candidates)link(potentialGraph,o.out,o.ref);
  let possible=reachable(potentialGraph),eligible=candidates.filter(o=>possible.has(o.minus));
  // Remove only the output links introduced above, never a physical branch.
  for(const o of candidates)if(!eligible.includes(o)){const a=potentialGraph.get(o.out),b=potentialGraph.get(o.ref);a.splice(a.lastIndexOf(o.ref),1);b.splice(b.lastIndexOf(o.out),1);}
  possible=reachable(potentialGraph);const unknown=all.filter(n=>possible.has(n)&&!known.has(n)),idx=new Map(unknown.map((n,i)=>[n,i]));
  // Identical ideal parallel diodes have non-unique individual currents. Solve
  // their aggregate branch, split equally and report the convention explicitly.
  const grouped=new Map();
  for(const l of leds){const key=JSON.stringify([l.a,l.k,l.vf??2]);if(!grouped.has(key))grouped.set(key,{...l,vf:l.vf??2,members:[]});grouped.get(key).members.push(l);}
  const groups=[...grouped.values()].filter(l=>possible.has(l.a)&&possible.has(l.k));
  const controlIndex=new Map();groups.forEach((g,i)=>g.members.forEach(m=>controlIndex.set(m.id,i)));
  const constraints=clamps.filter(c=>possible.has(c.a)&&possible.has(c.b));
  for(const c of constraints)if(known.has(c.a)&&known.has(c.b)&&Math.abs(known.get(c.a)-known.get(c.b)-c.volts)>1e-7)diagnostics.push({code:'ideal-clamp-conflict',componentIds:[c.id],message:'The active device voltage constraint conflicts with ideal sources.'});
  for(const l of groups)if(l.members.length>1)diagnostics.push({code:'ideal-parallel-current-sharing',componentIds:l.members.map(m=>m.id),message:'Identical parallel LED currents are split equally; the ideal Vf model cannot determine individual sharing.'});
  const excluded=new Set();
  for(let i=0;i<groups.length;i++){const l=groups[i];if(known.has(l.a)&&known.has(l.k)&&known.get(l.a)-known.get(l.k)>l.vf+1e-7){excluded.add(i);diagnostics.push({code:'led-ideal-source-conflict',componentIds:l.members.map(m=>m.id),message:'An LED is forward-connected directly across incompatible ideal voltage clamps; a series resistance is required.'});}}
  let active=new Set(),voltage=new Map(known),diodeCurrents=new Map(),clampCurrents=new Map(),converged=false,iterations=0,regularized=false,regularizedFinal=false;
  const opStates=new Map(eligible.map(o=>[o.id,'linear']));let opCurrents=new Map();
  const makeSystem=(on,series=0,leak=1e-12)=>{
    const enabled=[...on],size=unknown.length+enabled.length+constraints.length+eligible.length,A=Array.from({length:size},()=>new Float64Array(size)),rhs=new Float64Array(size);
    const stampG=(a,b,g,offset=0)=>{
      const ia=idx.get(a),ib=idx.get(b);
      if(ia!==undefined){A[ia][ia]+=g;if(ib!==undefined)A[ia][ib]-=g;else rhs[ia]+=g*(known.get(b)||0);rhs[ia]+=g*offset;}
      if(ib!==undefined){A[ib][ib]+=g;if(ia!==undefined)A[ib][ia]-=g;else rhs[ib]+=g*(known.get(a)||0);rhs[ib]-=g*offset;}
    };
    for(const b of branches)if(possible.has(b.a)&&b.a!==b.b)stampG(b.a,b.b,1/b.ohms,b.offset||0);
    for(let i=0;i<groups.length;i++)if(!on.has(i)&&!excluded.has(i)&&leak)stampG(groups[i].a,groups[i].k,leak);
    for(const c of controlled){const di=controlIndex.get(c.control),j=enabled.indexOf(di);if(j>=0){const column=unknown.length+j,a=idx.get(c.a),b=idx.get(c.b),gain=c.gain/groups[di].members.length;if(a!==undefined)A[a][column]+=gain;if(b!==undefined)A[b][column]-=gain;}else if(leak)stampG(c.a,c.b,leak);}
    enabled.forEach((di,j)=>{const l=groups[di],row=unknown.length+j,ia=idx.get(l.a),ik=idx.get(l.k);rhs[row]=l.vf;
      if(ia!==undefined){A[ia][row]+=1;A[row][ia]+=1;}else rhs[row]-=known.get(l.a)||0;
      if(ik!==undefined){A[ik][row]-=1;A[row][ik]-=1;}else rhs[row]+=known.get(l.k)||0;
      A[row][row]-=series;
    });
    constraints.forEach((c,j)=>{const row=unknown.length+enabled.length+j,a=idx.get(c.a),b=idx.get(c.b);rhs[row]=c.volts;if(a!==undefined){A[a][row]+=1;A[row][a]+=1;}else rhs[row]-=known.get(c.a)||0;if(b!==undefined){A[b][row]-=1;A[row][b]-=1;}else rhs[row]+=known.get(c.b)||0;A[row][row]-=series;});
    eligible.forEach((o,j)=>{const row=unknown.length+enabled.length+constraints.length+j,state=opStates.get(o.id),reference=state==='high'?o.vcc:o.ref;rhs[row]=state==='high'?-1.5:state==='low'?.02:0;
      const terms=[[o.out,1],[reference,-1],...(state==='linear'?[[o.plus,-(o.gain||100000)],[o.minus,o.gain||100000]]:[])];
      for(const[node,k]of terms){const i=idx.get(node);if(i===undefined)rhs[row]-=k*(known.get(node)||0);else A[row][i]+=k;}
      const out=idx.get(o.out),ref=idx.get(o.ref);if(out!==undefined)A[out][row]+=1;if(ref!==undefined)A[ref][row]-=1;A[row][row]-=o.outputOhms||50;
    });
    const answer=linearSolve(A,rhs);
    if(!answer)return null;
    return {voltage:new Map([...known,...unknown.map((n,i)=>[n,answer[i]])]),diodeCurrents:new Map(enabled.map((di,j)=>[di,answer[unknown.length+j]])),clampCurrents:new Map(constraints.map((c,j)=>[c.id,answer[unknown.length+enabled.length+j]])),opCurrents:new Map(eligible.map((o,j)=>[o.id,answer[unknown.length+enabled.length+constraints.length+j]]))};
  };
  const maxIterations=Math.min(256,Math.max(24,groups.length*4+eligible.length*8+8));
  for(iterations=0;iterations<maxIterations;iterations++){
    let result=makeSystem(active);regularizedFinal=false;
    if(!result){result=makeSystem(active,1e-6);regularized=true;regularizedFinal=true;}
    if(!result){diagnostics.push({code:'singular-network',message:'The DC constraints do not have a unique solvable state.'});break;}
    ({voltage,diodeCurrents,clampCurrents,opCurrents}=result);
    let opChanged=false;for(const o of eligible){const state=opStates.get(o.id),demand=(o.gain||100000)*(voltage.get(o.plus)-voltage.get(o.minus)),high=voltage.get(o.vcc)-voltage.get(o.ref)-1.5,internal=voltage.get(o.out)-voltage.get(o.ref)-(o.outputOhms||50)*(opCurrents.get(o.id)||0);let next=state;
      if(state==='linear')next=internal>high+1e-6?'high':internal<.02-1e-6?'low':'linear';else if(state==='high'&&demand<high-1e-6||state==='low'&&demand>.02+1e-6)next='linear';
      if(next!==state){opStates.set(o.id,next);opChanged=true;}}
    if(opChanged)continue;
    const negative=[...active].filter(i=>(diodeCurrents.get(i)||0)<-1e-9);
    if(negative.length){for(const i of negative)active.delete(i);continue;}
    const forward=groups.map((l,i)=>i).filter(i=>!active.has(i)&&!excluded.has(i)&&(voltage.get(groups[i].a)-voltage.get(groups[i].k)>groups[i].vf+1e-7));
    if(forward.length){for(const i of forward)active.add(i);continue;}
    converged=true;break;
  }
  // Final exact solution removes seeding conductance when it is full rank.
  if(converged){const exact=makeSystem(active,0,0);if(exact){voltage=exact.voltage;diodeCurrents=exact.diodeCurrents;clampCurrents=exact.clampCurrents;opCurrents=exact.opCurrents;regularizedFinal=false;}}
  if(!converged&&!diagnostics.some(d=>d.code==='singular-network'))diagnostics.push({code:'dc-nonconvergence',message:'The bounded LED active-set solver did not converge; values should not drive firmware inputs.'});
  const physicalGraph=new Map(all.map(n=>[n,[]]));
  for(const b of branches)link(physicalGraph,b.a,b.b);
  // A zero-current diode boundary selected by numerical seeding cannot
  // establish an absolute voltage on an otherwise floating conductor.
  for(const i of active)if((diodeCurrents.get(i)||0)>1e-12)link(physicalGraph,groups[i].a,groups[i].k);
  for(const c of constraints)link(physicalGraph,c.a,c.b);
  for(const c of controlled){const i=controlIndex.get(c.control);if(active.has(i)&&(diodeCurrents.get(i)||0)*c.gain>1e-12)link(physicalGraph,c.a,c.b);}
  for(const o of eligible)link(physicalGraph,o.out,o.ref);
  const physical=reachable(physicalGraph),voltages=new Map(all.map(n=>[n,physical.has(n)?voltage.get(n)??null:null]));
  for(const b of branches){const va=voltages.get(b.a),vb=voltages.get(b.b);currents.set(b.id,va===null||vb===null?null:(va-vb-(b.offset||0))/b.ohms);}
  for(const l of leds)ledResults.set(l.id,{id:l.id,on:false,current:0,voltage:voltages.get(l.a)===null||voltages.get(l.k)===null?null:voltages.get(l.a)-voltages.get(l.k),vf:l.vf??2,connected:physical.has(l.a)&&physical.has(l.k)});
  for(let i=0;i<groups.length;i++){
    const l=groups[i],v=voltage.get(l.a)-voltage.get(l.k),current=Math.max(0,diodeCurrents.get(i)||0)/l.members.length;
    const impossible=excluded.has(i)||(active.has(i)&&v-l.vf>1e-3);
    if(impossible&&!excluded.has(i))diagnostics.push({code:'led-unlimited-current',componentIds:l.members.map(m=>m.id),message:'Forward LED constraints are directly driven by incompatible ideal sources; current is undefined without a limiting resistance.'});
    for(const m of l.members){const state=ledResults.get(m.id);state.current=impossible?null:state.connected?current:0;state.on=!impossible&&state.connected&&current>1e-9;state.active=active.has(i);}
  }
  const floating=all.filter(n=>!physical.has(n));
  if(regularizedFinal&&!diagnostics.some(d=>d.code==='led-unlimited-current'))diagnostics.push({code:'degenerate-led-constraints',message:'Redundant ideal LED voltage constraints use 1 micro-ohm numerical resistance to choose an otherwise indeterminate current distribution.'});
  if(floating.length)diagnostics.push({code:'floating-nodes',nodes:floating,message:'Floating node voltages are undefined.'});
  const opampResults=new Map();for(const o of opamps){const span=voltages.get(o.vcc)-voltages.get(o.ref),supported=eligible.includes(o)&&span>=3&&span<=30,state=supported?opStates.get(o.id):'unpowered / floating';opampResults.set(o.id,{state,voltage:supported?voltages.get(o.out):null,current:supported?-(opCurrents.get(o.id)||0):null,supply:span});if(!powered(o))diagnostics.push({code:'opamp-supply-unsupported',componentIds:[o.id.split(':')[0]],message:'LM358 supply outside the modeled 3–30 V range.'});if(supported&&[o.plus,o.minus].some(n=>voltages.get(n)<voltages.get(o.ref)-.02||voltages.get(n)>voltages.get(o.vcc)-1.5))diagnostics.push({code:'opamp-input-range',componentIds:[o.id.split(':')[0]],message:'LM358 common-mode input outside modeled range.'});if(Math.abs(opCurrents.get(o.id)||0)>.02)diagnostics.push({code:'opamp-output-current',componentIds:[o.id.split(':')[0]],message:'LM358 simplified output exceeds 20mA; current limiting not modeled.'});}
  return {opampResults,voltages,currents,clampCurrents,ledResults,leds:ledResults,diagnostics,converged,iterations:iterations+1,regularized,regularizedFinal};
}

function linearSolve(A,b){
  const n=b.length;
  if(!n)return new Float64Array();
  for(let col=0;col<n;col++){
    let pivot=col,largest=Math.abs(A[col][col]);
    for(let row=col+1;row<n;row++){const value=Math.abs(A[row][col]);if(value>largest){largest=value;pivot=row;}}
    if(largest<1e-18)return null;
    if(pivot!==col){[A[col],A[pivot]]=[A[pivot],A[col]];[b[col],b[pivot]]=[b[pivot],b[col]];}
    for(let row=col+1;row<n;row++){
      const factor=A[row][col]/A[col][col];if(!factor)continue;A[row][col]=0;
      for(let k=col+1;k<n;k++)A[row][k]-=factor*A[col][k];b[row]-=factor*b[col];
    }
  }
  const x=new Float64Array(n);
  for(let row=n-1;row>=0;row--){let value=b[row];for(let col=row+1;col<n;col++)value-=A[row][col]*x[col];x[row]=value/A[row][row];if(!Number.isFinite(x[row]))return null;}
  return x;
}
