import {componentBounds} from './geometry.js';
import {syncMountedParts} from './mounting.js';
// X/Y refer to workspace coordinates, including after a quarter turn.
export function mirrorComponents(project,ids,axis){
 if(!['x','y'].includes(axis))throw Error('Aynalama ekseni geçersiz.');
 const selected=new Set(ids),boards=new Map(project.components.filter(c=>selected.has(c.id)&&c.type==='breadboard').map(c=>[c.id,{...c,...componentBounds(c)}]));
 for(const c of project.components){
  const parent=c.mount&&boards.get(c.mount.boardId);
  if(!selected.has(c.id)&&!parent)continue;
  if(parent){const size=componentBounds(c);c[axis]=2*parent[axis]+parent[axis==='x'?'width':'height']-c[axis]-size[axis==='x'?'width':'height'];}
  else delete c.mount;
  c.rotation=(360-(c.rotation||0))%360;
  const key=axis==='x'?'mirrorX':'mirrorY';c[key]=!c[key];
 }
 syncMountedParts(project);
}
