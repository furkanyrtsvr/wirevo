import {componentDefinition,buildNets} from './core.js';
import {componentBounds,pinPoint,localPoint,simplifyRoute,wirePoints} from './geometry.js';
export const WIRE_SPACING=16;
// Breadboards are wiring surfaces; component bodies require an outward pin escape.
export function routingObstacles(project,margin=12){return project.components.filter(c=>c.type!=='breadboard'&&!c.mount).map(c=>{const b=componentBounds(c);return{id:c.id,left:c.x-margin,right:c.x+b.width+margin,top:c.y-margin,bottom:c.y+b.height+margin};});}
export function crossesBody(a,b,r){return a.x===b.x?a.x>r.left+.001&&a.x<r.right-.001&&Math.max(a.y,b.y)>r.top+.001&&Math.min(a.y,b.y)<r.bottom-.001:a.y>r.top+.001&&a.y<r.bottom-.001&&Math.max(a.x,b.x)>r.left+.001&&Math.min(a.x,b.x)<r.right-.001;}
function exit(project,ep,rects){
 const c=project.components.find(c=>c.id===ep.split(':')[0]),d=componentDefinition(c),p=d.pinDefs.find(p=>p.id===ep.split(':')[1]),a=pinPoint(project,ep),r=rects.find(r=>r.id===c.id);if(!r)return a;
 let raw=p.side||[['left',p.x],['right',d.width-p.x],['top',p.y],['bottom',d.height-p.y]].sort((a,b)=>a[1]-b[1])[0][0];
 if(c.mirrorX)raw=raw==='left'?'right':raw==='right'?'left':raw;if(c.mirrorY)raw=raw==='top'?'bottom':raw==='bottom'?'top':raw;
 const sides=['top','right','bottom','left'],side=sides[(sides.indexOf(raw)+(c.rotation||0)/90)%4];return side==='left'?{x:r.left,y:a.y}:side==='right'?{x:r.right,y:a.y}:side==='top'?{x:a.x,y:r.top}:{x:a.x,y:r.bottom};
}
export function sharedLength(a,b,c,d){
 if(a.x===b.x&&c.x===d.x&&Math.abs(a.x-c.x)<.001)return Math.max(0,Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y))-Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y)));
 if(a.y===b.y&&c.y===d.y&&Math.abs(a.y-c.y)<.001)return Math.max(0,Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))-Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x)));return 0;
}
export function parallelClearance(a,b,c,d){
 if(a.x===b.x&&c.x===d.x&&Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y))>Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y))+.001)return Math.abs(a.x-c.x);
 if(a.y===b.y&&c.y===d.y&&Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))>Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x))+.001)return Math.abs(a.y-c.y);return Infinity;
}
function intersection(a,b,c,d){if(a.y===b.y&&c.x===d.x){const x=c.x,y=a.y;if(x>Math.min(a.x,b.x)+.001&&x<Math.max(a.x,b.x)-.001&&y>Math.min(c.y,d.y)+.001&&y<Math.max(c.y,d.y)-.001)return{x,y};}else if(a.x===b.x&&c.y===d.y)return intersection(c,d,a,b);return null;}
class Queue{data=[];push(value){const d=this.data;let i=d.length;d.push(value);while(i){const j=(i-1)>>1;if(d[j].cost<=value.cost)break;d[i]=d[j];i=j;}d[i]=value;}pop(){const d=this.data,first=d[0],last=d.pop();if(d.length){let i=0;while(i*2+1<d.length){let j=i*2+1;if(j+1<d.length&&d[j+1].cost<d[j].cost)j++;if(d[j].cost>=last.cost)break;d[i]=d[j];i=j;}d[i]=last;}return first;}}
function routeAtMargin(project,w,margin,occupied=[],spacing=WIRE_SPACING){
 const rects=routingObstacles(project,margin),a=pinPoint(project,w.from),b=pinPoint(project,w.to),start=exit(project,w.from,rects),end=exit(project,w.to,rects);
 const axis=(key,ends)=>[...new Set([...ends,...rects.flatMap(r=>key==='x'?[r.left,r.right]:[r.top,r.bottom]),...occupied.filter(s=>key==='x'?s.a.x===s.b.x:s.a.y===s.b.y).flatMap(s=>[s.a[key]-spacing,s.a[key]+spacing])])].filter(n=>Math.abs(n)<=9900).sort((a,b)=>a-b);
 const xs=axis('x',[start.x,end.x]),ys=axis('y',[start.y,end.y]),nx=xs.length;
 if(nx*ys.length>180000)return null;
 const point=i=>({x:xs[i%nx],y:ys[Math.floor(i/nx)]}),id=p=>ys.indexOf(p.y)*nx+xs.indexOf(p.x),target=id(end),source=id(start)*3,dist=new Map([[source,0]]),prev=new Map(),queue=new Queue();queue.push({id:source,cost:0,g:0});let visited=0;
 while(queue.data.length&&visited++<300000){const entry=queue.pop(),u=entry.id;if(entry.g!==dist.get(u))continue;const cell=Math.floor(u/3),direction=u%3,p=point(cell);
 if(cell===target){const path=[];for(let i=u;i!==undefined;i=prev.get(i))path.push(point(Math.floor(i/3)));const route=simplifyRoute([a,...path.reverse(),b]);return route.length<=66?route:null;}
 const x=cell%nx,y=Math.floor(cell/nx);for(const v of [x>0?cell-1:-1,x<nx-1?cell+1:-1,y>0?cell-nx:-1,y<ys.length-1?cell+nx:-1]){if(v<0)continue;const q=point(v),axis=p.y===q.y?1:2;if(rects.some(r=>crossesBody(p,q,r)))continue;
 let penalty=direction&&axis!==direction?32:0;for(const s of occupied){const gap=parallelClearance(p,q,s.a,s.b);if(gap<spacing-.001)penalty+=50000+(spacing-gap)*200+sharedLength(p,q,s.a,s.b)*10000000;if(intersection(p,q,s.a,s.b))penalty+=50;}
 const g=entry.g+Math.abs(p.x-q.x)+Math.abs(p.y-q.y)+penalty,key=v*3+axis;if(g<(dist.get(key)??Infinity)){dist.set(key,g);prev.set(key,u);queue.push({id:key,g,cost:g+Math.abs(q.x-end.x)+Math.abs(q.y-end.y)});}}
 }return null;
}
export function routeWire(project,w,lane=0,occupied=[]){
 let best=null,score=Infinity;for(const margin of [24,40,56,72,12,4,0]){const route=routeAtMargin(project,w,margin,occupied);if(!route)continue;let cost=0;for(let k=2;k<route.length-1;k++)for(const s of occupied){const gap=parallelClearance(route[k-1],route[k],s.a,s.b);if(gap<WIRE_SPACING-.001)cost+=1+(WIRE_SPACING-gap)+sharedLength(route[k-1],route[k],s.a,s.b)*10000000;}
 if(cost<.001)return route;if(cost<score){best=route;score=cost;}}
 return best||wirePoints(project,w);
}
// Equivalent outer Morpho pads avoid long access stubs through the Nucleo PCB.
export function outerBoardPads(project){const board=project.components.find(c=>c.type==='board');if(!board)return project;const d=componentDefinition(board);if(!d.pinDefs.some(p=>p.id.startsWith('CN7-')))return project;const bounds=componentBounds(board);for(const w of project.wires){for(const key of ['from','to']){const ep=w[key];if(!ep.startsWith(board.id+':'))continue;const p=d.pinDefs.find(p=>p.id===ep.slice(board.id.length+1));if(!p?.net)continue;const other=pinPoint(project,w[key==='from'?'to':'from']),wanted=other.x>board.x+bounds.width?'right':other.x<board.x?'left':other.y<board.y?'top':'bottom';const candidates=d.pinDefs.filter(q=>q.connectable!==false&&q.net===p.net&&q.id.startsWith('CN'));const score=q=>{const world=localPoint(board,q.x,q.y),x=board.x+world.x,y=board.y+world.y,edge=Math.min(world.x,bounds.width-world.x,world.y,bounds.height-world.y);return edge*8+Math.abs(x-other.x)+Math.abs(y-other.y)+(q.side===wanted?0:400);};candidates.sort((a,b)=>score(a)-score(b));if(candidates[0])w[key]=board.id+':'+candidates[0].id;}}return project;}

export function colorProjectWires(project){
 const nets=buildNets(project),colors=new Map(),palette=['#3b82f6','#22c55e','#8b5cf6','#f59e0b','#14b8a6','#e2e8f0'];let index=0;
 for(const group of [...nets.groups].sort((a,b)=>[...a].sort()[0].localeCompare([...b].sort()[0]))){const pins=group.map(ep=>{const [id,pin]=ep.split(':'),c=project.components.find(c=>c.id===id),p=componentDefinition(c).pinDefs.find(p=>p.id===pin);return(p?.net||pin).toUpperCase();});let color;if(pins.some(n=>/^(GND|AGND|DGND)(\.|$)/.test(n)))color='#64748b';else if(pins.some(n=>/^(3V3|5V|VIN|VCC|VDD|VREF)(\.|$)/.test(n)))color='#ef4444';else if(pins.some(n=>/^(SCL|SCK|CLK)$/.test(n)))color='#f59e0b';else if(pins.includes('SDA'))color='#3b82f6';else if(pins.some(n=>/^(MOSI|DIN)$/.test(n)))color='#22c55e';else if(pins.some(n=>/^(MISO|DOUT)$/.test(n)))color='#14b8a6';else if(pins.includes('CS'))color='#8b5cf6';else color=palette[index++%palette.length];for(const ep of group)colors.set(ep,color);}
 for(const w of project.wires)w.color=colors.get(w.from)||'#14b8a6';return project;
}
export function routeProjectWires(project,{force=false,recolor=false}={}){
 const occupied=[];if(recolor)colorProjectWires(project);
 // Deterministic input order makes undo, imported projects and repeat routing reproducible.
 for(const w of project.wires){if(force)delete w.routing;const points=w.routing==='direct'?wirePoints(project,w):routeWire(project,w,0,occupied);if(w.routing!=='direct')w.points=points.slice(1,-1);
 for(let k=2;k<points.length-1;k++)occupied.push({a:points[k-1],b:points[k]});}return project;
}
export function routeSelectedWire(project,w){const occupied=[];for(const other of project.wires){if(other.id===w.id)continue;const points=wirePoints(project,other);for(let k=2;k<points.length-1;k++)occupied.push({a:points[k-1],b:points[k]});}delete w.routing;w.points=routeWire(project,w,0,occupied).slice(1,-1);return project;}
export function wireCrossings(project){const result=new Map(project.wires.map(w=>[w.id,[]])),routes=project.wires.map(w=>wirePoints(project,w));for(let i=0;i<routes.length;i++)for(let j=0;j<i;j++)for(let a=1;a<routes[i].length;a++)for(let b=1;b<routes[j].length;b++){const p=intersection(routes[i][a-1],routes[i][a],routes[j][b-1],routes[j][b]);if(p&&!result.get(project.wires[i].id).some(q=>Math.hypot(q.x-p.x,q.y-p.y)<1))result.get(project.wires[i].id).push(p);}return result;}
export function spaceNativeParts(project,{route=true}={}){const board=project.components.find(c=>c.type==='board');if(!board)return project;const edge=board.x+componentBounds(board).width+130,free=project.components.filter(c=>!['board','breadboard','netLabel'].includes(c.type)&&!c.mount);if(free.length){const shift=Math.max(0,edge-Math.min(...free.map(c=>c.x)));for(const c of free)c.x+=shift;}const freeEdge=Math.max(edge,...free.map(c=>c.x+componentBounds(c).width));for(const c of project.components.filter(c=>c.type==='breadboard'&&!project.components.some(p=>p.mount?.boardId===c.id)))c.x=Math.max(c.x,freeEdge+100);colorProjectWires(project);outerBoardPads(project);return route?routeProjectWires(project):project;}

// Only curated examples use short named supply nets. Auto-route never changes topology.
export function compactExampleSupplies(project){
 const board=project.components.find(c=>c.type==='board');if(!board)return project;const labels=new Map(),sources=new Map();
 const classify=ep=>{const[id,pin]=ep.split(':');if(id!==board.id)return null;const p=componentDefinition(board).pinDefs.find(p=>p.id===pin),net=p?.net||pin;return /^GND/.test(net)?'GND':net==='3V3'?'3V3':null;};
 const labelFor=(id,name)=>{const key=id+':'+name;if(labels.has(key))return labels.get(key);const c=project.components.find(c=>c.id===id),b=componentBounds(c),label={id:'supply_'+id+'_'+name,type:'netLabel',x:c.x+(name==='GND'?80:0),y:c.y+b.height+36,rotation:0,params:{name:'CF_'+name,side:'top',compact:true}};let attempts=0;while(attempts++<30&&routingObstacles(project,8).some(r=>label.x<r.right&&label.x+72>r.left&&label.y<r.bottom&&label.y+24>r.top))label.y+=32;project.components.push(label);labels.set(key,label.id+':NET');return label.id+':NET';};
 for(const w of project.wires){const name=classify(w.from)||classify(w.to);if(!name)continue;const source=classify(w.from)?w.from:w.to,other=w.from===source?w.to:w.from;if(other.startsWith(board.id+':'))continue;sources.set(name,source);const label=labelFor(other.split(':')[0],name);if(w.from===source)w.from=label;else w.to=label;w.points=[];}
 for(const[name,source]of sources)project.wires.push({id:'supply_source_'+name,from:source,to:labelFor(board.id,name),color:name==='GND'?'#64748b':'#ef4444',points:[]});return project;
}
