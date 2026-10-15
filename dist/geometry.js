import {componentDefinition} from './core.js';
import {CATALOG} from './core.js';
import {BREADBOARD} from './hardware.js';
export const snap=(n,grid=9.6)=>Math.round(n/grid)*grid;
export function componentBounds(c){const d=componentDefinition(c);return(c.rotation||0)%180?{width:d.height,height:d.width}:{width:d.width,height:d.height};}
export function localPoint(c,x,y){const d=componentDefinition(c),r=c.rotation||0;if(c.mirrorX)x=d.width-x;if(c.mirrorY)y=d.height-y;if(r===90)return{x:d.height-y,y:x};if(r===180)return{x:d.width-x,y:d.height-y};if(r===270)return{x:y,y:d.width-x};return{x,y};}
export function pinPoint(project,ep){const [id,pin]=ep.split(':'),c=project.components.find(c=>c.id===id);if(!c)return{x:0,y:0};const p=componentDefinition(c).pinDefs.find(p=>p.id===pin);if(!p)return{x:c.x,y:c.y};const local=localPoint(c,p.x,p.y);return{x:c.x+local.x,y:c.y+local.y};}
export function componentTransform(c){const d=componentDefinition(c),r=c.rotation||0;return`translate(${c.x} ${c.y}) ${r===90?`translate(${d.height} 0) rotate(90)`:r===180?`translate(${d.width} ${d.height}) rotate(180)`:r===270?`translate(0 ${d.width}) rotate(270)`:''} ${c.mirrorX||c.mirrorY?`translate(${c.mirrorX?d.width:0} ${c.mirrorY?d.height:0}) scale(${c.mirrorX?-1:1} ${c.mirrorY?-1:1})`:''}`;}
export function orthogonalPoints(points){const result=[];for(const point of points){const p={x:point.x,y:point.y},last=result.at(-1);if(last&&last.x!==p.x&&last.y!==p.y)result.push({x:p.x,y:last.y});if(!last||last.x!==p.x||last.y!==p.y)result.push(p);}return result.filter((p,i,a)=>i===0||p.x!==a[i-1].x||p.y!==a[i-1].y);}
export function wirePoints(project,w){const a=pinPoint(project,w.from),b=pinPoint(project,w.to);if(w.routing==='direct')return[a,b];if(w.points?.length)return orthogonalPoints([a,...w.points,b]);if(Math.abs(a.y-b.y)<1||Math.abs(a.x-b.x)<1)return orthogonalPoints([a,b]);const mid=Math.round((a.x+b.x)/2/9.6)*9.6;return[a,{x:mid,y:a.y},{x:mid,y:b.y},b];}
export const svgPath=points=>points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
export function simplifyRoute(points){
  const result=[];
  for(const p of orthogonalPoints(points)){
    const last=result.at(-1);if(last&&p.x===last.x&&p.y===last.y)continue;
    while(result.length>1){const a=result.at(-2),b=result.at(-1);if((a.x===b.x&&b.x===p.x)||(a.y===b.y&&b.y===p.y))result.pop();else break;}
    result.push({...p});
  }
  return result;
}
export function routeSegments(route){return route.slice(1).map((b,i)=>{const a=route[i];return{index:i,a,b,axis:Math.abs(a.y-b.y)<.001?'h':'v',length:Math.hypot(a.x-b.x,a.y-b.y)};}).filter(s=>s.length>.001);}
export function moveWireSegment(route,index,delta,{grid=0,tolerance=0}={}){
  if(index<0||index>=route.length-1)throw new Error('Kablo bölümü geçersiz.');
  const out=route.map(p=>({...p})),a=out[index],b=out[index+1],axis=Math.abs(a.y-b.y)<.001?'y':'x';
  const desired=a[axis]+delta,targets=route.filter((_,i)=>i!==index&&i!==index+1).map(p=>p[axis]),nearest=targets.sort((x,y)=>Math.abs(x-desired)-Math.abs(y-desired))[0];if(tolerance>0&&nearest!==undefined&&Math.abs(nearest-desired)<=tolerance)delta=nearest-a[axis];else if(grid)delta=snap(delta,grid);
  if(Math.abs(delta)<.001)return out;
  const first={...out[0]},last={...out.at(-1)};a[axis]+=delta;b[axis]+=delta;
  if(index===0)out.unshift(first);if(index===route.length-2)out.push(last);
  return simplifyRoute(out);
}
export function routeBounds(project){const points=project.components.flatMap(c=>{const b=componentBounds(c);return[{x:c.x,y:c.y},{x:c.x+b.width,y:c.y+b.height}];});for(const w of project.wires)points.push(...wirePoints(project,w));if(!points.length)return{x:0,y:0,width:1000,height:600};const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));return{x:minX-90,y:minY-90,width:Math.max(500,maxX-minX+180),height:Math.max(340,maxY-minY+180)};}

export const BREADBOARD_PITCH=(BREADBOARD.pins.find(p=>p.id==='a2').x-BREADBOARD.pins.find(p=>p.id==='a1').x)*1.35;
// Preserve old project coordinates; only the board being placed is snapped.
export function breadboardPosition(project,c,x,y){
  const peers=project.components.filter(b=>b.type==='breadboard'&&b.id!==c.id&&(b.rotation||0)===(c.rotation||0));
  peers.sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));
  const ref=peers[0];return ref?{x:ref.x+snap(x-ref.x,BREADBOARD_PITCH),y:ref.y+snap(y-ref.y,BREADBOARD_PITCH)}:{x,y};
}
export function newBreadboardPosition(project,c,preferredId){
  const ref=project.components.find(b=>b.id===preferredId&&b.type==='breadboard')||project.components.find(b=>b.type==='breadboard');
  if(!ref)return{x:snap(c.x,BREADBOARD_PITCH),y:snap(c.y,BREADBOARD_PITCH)};
  c.rotation=ref.rotation||0;const bounds=componentBounds(ref),step=snap(bounds.width+BREADBOARD_PITCH*2,BREADBOARD_PITCH);
  let x=ref.x+step;while(project.components.some(b=>b.type==='breadboard'&&Math.abs(b.x-x)<bounds.width&&Math.abs(b.y-ref.y)<bounds.height))x+=step;
  return{x,y:ref.y};
}
