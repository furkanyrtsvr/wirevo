import {componentDefinition} from './core.js';
import {CATALOG}from'./core.js';
import {pinPoint,localPoint}from'./geometry.js';
import {placementClearance}from'./clearance.js';
export const MOUNTABLE=new Set(['tact6','dht11','dht22','led','resistor','button','pot','diode','zener','npn','mosfet','eeprom','opamp','capacitor','inductor','ds18b20','tmp36','lm35','hc4050','mcp3008','ldr','hc595','hc165','mcp23s17','mcp23017']);
const mountingDefs=c=>componentDefinition(c).pinDefs.filter(p=>p.mountable!==false);
const keys=c=>mountingDefs(c).map(p=>p.id);
const holeKey=(id,pin)=>id+':'+pin;
export function mountedHoles(project,ignore=new Set()){
  const occupied=new Map();for(const c of project.components)if(c.mount&&!ignore.has(c.id))for(const hole of Object.values(c.mount.pins))occupied.set(holeKey(c.mount.boardId,hole),c.id);return occupied;
}
export function placementCandidate(project,c,{radius=10,fitTolerance=2}={}){
  if(!MOUNTABLE.has(c.type))return null;
  const defs=mountingDefs(c),anchor=defs[0],origin=pinPoint(project,holeKey(c.id,anchor.id)),occupied=mountedHoles(project,new Set([c.id]));
  let invalid=null;const candidates=[],boardHoles=new Map();
  for(const board of project.components.filter(p=>p.type==='breadboard')){const holes=CATALOG.breadboard.pinDefs.map(hole=>{const local=localPoint(board,hole.x,hole.y);return{hole,point:{x:board.x+local.x,y:board.y+local.y}};});boardHoles.set(board.id,holes);for(const {hole,point:p}of holes){const distance=Math.hypot(p.x-origin.x,p.y-origin.y);if(distance<=radius)candidates.push({board,hole,p,distance});}}
  candidates.sort((a,b)=>a.distance-b.distance);
  for(const {board,p,distance}of candidates){const local=localPoint(c,anchor.x,anchor.y),x=p.x-local.x,y=p.y-local.y,proposed={...c,x,y},pins={},targets=[];let reason='';
    for(const def of defs){const l=localPoint(proposed,def.x,def.y),actual={x:x+l.x,y:y+l.y};let nearest=null,min=Infinity;for(const {hole,point}of boardHoles.get(board.id)){const d=Math.hypot(point.x-actual.x,point.y-actual.y);if(d<min){min=d;nearest={hole,point};}}
      if(min>fitTolerance){reason='Bacak aralığı deliklere uymuyor';break;}
      if(Object.values(pins).includes(nearest.hole.id)){reason='İki bacak aynı deliğe denk geliyor';break;}
      if(occupied.has(holeKey(board.id,nearest.hole.id)))reason='Delik dolu: '+occupied.get(holeKey(board.id,nearest.hole.id));
      pins[def.id]=nearest.hole.id;targets.push({pin:def.id,hole:nearest.hole.id,...nearest.point});
    }
    const result={ok:!reason,x,y,boardId:board.id,pins,targets,distance,reason};if(!reason)result.reason=placementClearance(project,c,result);result.ok=!result.reason;if(result.ok)return result;if(!invalid)invalid=result;
  }
  return invalid;
}
export function attachPlacement(c,candidate){if(!candidate?.ok)return false;c.x=candidate.x;c.y=candidate.y;c.mount={boardId:candidate.boardId,pins:{...candidate.pins}};return true;}
export function placeOnBreadboard(project,c,preferredBoardId){
  if(!MOUNTABLE.has(c.type))return false;
  const before={x:c.x,y:c.y,rotation:c.rotation},anchor=mountingDefs(c)[0];
  const boards=project.components.filter(b=>b.type==='breadboard').sort((a,b)=>Number(b.id===preferredBoardId)-Number(a.id===preferredBoardId));
  for(const board of boards){
    c.rotation=((board.rotation||0)+(['eeprom','opamp','hc4050','mcp3008','hc595','hc165','mcp23s17','mcp23017'].includes(c.type)?90:0))%360;
    const holes=CATALOG.breadboard.pinDefs.filter(p=>/^[a-j]\d+$/.test(p.id)).sort((a,b)=>Math.abs(a.x-160)+Math.abs(a.y-113)-Math.abs(b.x-160)-Math.abs(b.y-113));
    for(const hole of holes){const target=pinPoint(project,board.id+':'+hole.id),local=localPoint(c,anchor.x,anchor.y);c.x=target.x-local.x;c.y=target.y-local.y;const candidate=placementCandidate(project,c,{radius:.1});if(candidate?.ok&&attachPlacement(c,candidate))return true;}
  }
  Object.assign(c,before);return false;
}
export function syncMountedParts(project,boardIds=null){
  for(const c of project.components){if(!c.mount||boardIds&&!boardIds.has(c.mount.boardId))continue;const board=project.components.find(b=>b.id===c.mount.boardId&&b.type==='breadboard');if(!board){delete c.mount;continue;}
    const [pin,hole]=Object.entries(c.mount.pins)[0]||[];if(!pin)continue;const def=componentDefinition(c).pinDefs.find(p=>p.id===pin),target=pinPoint(project,holeKey(board.id,hole)),local=localPoint(c,def.x,def.y);c.x=target.x-local.x;c.y=target.y-local.y;
  }
}
export function mountErrors(project){
  const errors=[],occupied=new Map();for(const c of project.components){if(!c.mount)continue;const m=c.mount,board=project.components.find(b=>b.id===m.boardId&&b.type==='breadboard');if(!MOUNTABLE.has(c.type)||!board||!m.pins||typeof m.pins!=='object'||Array.isArray(m.pins)||Object.keys(m.pins).length!==keys(c).length){errors.push(c.id+': geçersiz breadboard bağlantısı');continue;}
    for(const pin of keys(c)){const hole=m.pins[pin],key=holeKey(m.boardId,hole);if(!CATALOG.breadboard.pins.includes(hole)){errors.push(c.id+': geçersiz breadboard deliği');continue;}const a=pinPoint(project,holeKey(c.id,pin)),b=pinPoint(project,key);if(Math.hypot(a.x-b.x,a.y-b.y)>2.001)errors.push(c.id+': bacak delikten ayrılmış');if(occupied.has(key))errors.push(c.id+': delik dolu');occupied.set(key,c.id);}
  }return errors;
}
