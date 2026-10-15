const part=(name,asset,pinDefs,w,h)=>({name,asset,category:'Temel',detail:'DC',width:w*1.35,height:h*1.35,scale:1.35,pins:pinDefs.map(p=>p.id),pinDefs:pinDefs.map(p=>({...p,x:p.x*1.35,y:p.y*1.35}))});
export const GENERIC_CATALOG={
 switch:part('Anahtar','basic-switch.svg',[{id:'1',x:5,y:20},{id:'2',x:43.4,y:20}],48.4,28),
 rheostat:part('Ayarlı direnç','basic-rheostat.svg',[{id:'1',x:5,y:20},{id:'2',x:43.4,y:20}],48.4,32),
 coilRelay:part('Röle','basic-relay.svg',[{id:'A1',x:5,y:43},{id:'A2',x:14.6,y:43},{id:'COM',x:33.8,y:43},{id:'NC',x:43.4,y:43},{id:'NO',x:53,y:43}],58,50),
};
