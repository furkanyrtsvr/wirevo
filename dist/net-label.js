// Names are project-local, case-sensitive electrical identifiers, never HTML.
export const validNetName=name=>typeof name==='string'&&/^[\p{L}\p{N}_+./-]{1,32}$/u.test(name);
export const NET_LABEL={name:'Net label',category:'Temel',detail:'Aynı ad = aynı elektriksel net',width:150,height:32,pins:['NET'],pinDefs:[{id:'NET',x:0,y:16,side:'left'}]};
export function joinNetLabels(project,join){const names=new Map();for(const c of project.components)if(c.type==='netLabel'&&validNetName(c.params?.name)){const ep=c.id+':NET';if(names.has(c.params.name))join(ep,names.get(c.params.name));else names.set(c.params.name,ep);}}

export function netLabelDefinition(c){const side=c.params?.side||'left',width=c.params?.compact?72:150,height=c.params?.compact?24:32;return{...NET_LABEL,width,height,pinDefs:[{id:'NET',side,x:side==='right'?width:side==='left'?0:width/2,y:side==='top'?0:side==='bottom'?height:height/2}]};}
