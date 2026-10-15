// Original CircuitForge CC0-1.0 vector artwork and generic laboratory instruments.
// Illustration geometry only: these instruments do not claim a manufacturer model.
const terminal=(id,x,y)=>({id,name:id,x,y,side:'bottom'});
export const LAB_MODULES={
  signalgen:{name:'Sinyal jeneratörü',width:220,height:145,asset:'lab-signal-generator.svg',pins:[terminal('OUT',55,126),terminal('GND',95,126)],display:{x:14,y:34,width:192,height:46},body:[3,3,214,136],specs:{interface:'Analog',outputOhms:50},orientation:'Genel laboratuvar jeneratörü · OUT sinyal / GND ortak referans · çıkış empedansı 50 Ω'},
  multimeter:{name:'Dijital multimetre',width:150,height:180,asset:'lab-multimeter.svg',pins:[terminal('V',29,166),terminal('COM',75,166),terminal('A',121,166)],display:{x:13,y:31,width:124,height:46},body:[3,3,144,174],specs:{interface:'Voltage / current',voltageInputOhms:10000000,currentShuntOhms:.1},orientation:'Genel dijital multimetre · V / COM gerilim · A / COM seri akım bağlantısı'},
  ohmmeter:{name:'Ohmmetre',width:150,height:180,asset:'lab-ohmmeter.svg',pins:[terminal('P',43,166),terminal('N',107,166)],display:{x:13,y:31,width:124,height:46},body:[3,3,144,174],specs:{interface:'Resistance'},orientation:'Genel ohmmetre · P ve N probları · direnç ölçümünden önce haricî beslemeyi ayırın'}
};
export const LAB_BODIES=Object.fromEntries(Object.entries(LAB_MODULES).map(([id,d])=>[id,d.body]));
const detail={signalgen:'Sine / square / triangle · 50 Ω',multimeter:'10 MΩ V girişi · 0.1 Ω A şöntü',ohmmeter:'İki prob · pasif ağ direnç ölçümü'};
export const LAB_CATALOG=Object.fromEntries(Object.entries(LAB_MODULES).map(([id,d])=>[id,{name:d.name,category:'Ölçüm',detail:detail[id],width:d.width*1.35,height:d.height*1.35,pinDefs:d.pins.map(p=>({...p,x:p.x*1.35,y:p.y*1.35})),pins:d.pins.map(p=>p.id),asset:d.asset,scale:1.35}]));
