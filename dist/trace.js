export const TRACE_HZ=16000000;
export function traceMeasurements(edges){
  const rising=edges.filter(e=>e.high).slice(-9);if(rising.length<2)return{frequency:null,duty:null,period:null};
  const start=rising[0].cycle,end=rising.at(-1).cycle,period=(end-start)/(rising.length-1);if(period<=0)return{frequency:null,duty:null,period:null};
  let high=0,level=true,last=start;for(const edge of edges){if(edge.cycle<=start||edge.cycle>end)continue;if(level)high+=edge.cycle-last;last=edge.cycle;level=edge.high;}
  return{frequency:TRACE_HZ/period,duty:high/(end-start),period:period/TRACE_HZ};
}
export function tracePath(edges,end,window,initial=false,availableFrom=0){
  const start=Math.max(0,end-window),from=Math.max(start,availableFrom)*TRACE_HZ,to=end*TRACE_HZ;let level=initial,index=0;
  while(index<edges.length&&edges[index].cycle<=from){level=edges[index].high;index++;}
  const x=cycle=>20+Math.max(0,Math.min(1,(cycle/TRACE_HZ-start)/window))*234,y=()=>level?5:85;
  const points=['M'+x(from).toFixed(2)+','+y()];for(;index<edges.length&&edges[index].cycle<=to;index++){const edge=edges[index],xx=x(edge.cycle).toFixed(2);points.push('H'+xx);level=edge.high;points.push('V'+y());}points.push('H'+x(to).toFixed(2));return points.join(' ');
}
export function nearestTraceEdge(edges,time){if(!edges.length)return null;let left=0,right=edges.length-1,target=time*TRACE_HZ;while(left<right){const mid=(left+right)>>1;if(edges[mid].cycle<target)left=mid+1;else right=mid;}const a=edges[left],b=edges[left-1];return b&&Math.abs(b.cycle-target)<Math.abs(a.cycle-target)?b:a;}
