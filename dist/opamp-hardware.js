// Original CC0 artwork; schematic pin functions verified against TI SLOS068AB.
// DIP-8: 2.54 mm lead pitch and 7.62 mm row spacing. Drawing units use the
// same 9.6 px pitch as existing breadboard assets, before the catalog's scale.
// Capacitor/inductor drawings are generic parts, not manufacturer packages.
export const ANALOG_ASSETS={
  opamp:{
    name:'Opamp',asset:'lm358.svg',width:44.8,height:51,
    package:'DIP-8',license:'CC0',source:'https://www.ti.com/lit/ds/symlink/lm358.pdf',
    pins:[['OUT1',1,8,10],['IN1-',2,8,19.6],['IN1+',3,8,29.2],['V-',4,8,38.8],['IN2+',5,36.8,38.8],['IN2-',6,36.8,29.2],['OUT2',7,36.8,19.6],['V+',8,36.8,10]].map(([id,number,x,y])=>({id,number,name:id.replace('-', '−'),x,y})),
    body:[12,4,20.8,42],orientation:'Üstten görünüş · çentik pin 1 / 8 tarafında',
    scope:'İki kanal · sınırlı DC modeli; bant genişliği, slew rate, bias/offset, ısınma ve gerçek çıkış akım sınırı modellenmez.'
  },
  capacitor:{
    name:'Kondansatör',asset:'capacitor.svg',width:28.8,height:40,
    package:'Radyal · kutupsuz',license:'CC0',
    pins:[{id:'1',name:'1',x:9.6,y:36},{id:'2',name:'2',x:19.2,y:36}],
    body:[4.8,3,19.2,22],orientation:'2.54 mm bacak aralığı · kutupsuz',
    scope:'Kapasite ve açık ESR ile zaman çözümü; tolerans, kaçak, sıcaklık ve dielektrik etkiler modellenmez.'
  },
  inductor:{
    name:'Bobin',asset:'inductor.svg',width:67.2,height:14.4,
    package:'Eksenel · kutupsuz',license:'CC0',
    pins:[{id:'1',name:'1',x:4.8,y:7.2},{id:'2',name:'2',x:62.4,y:7.2}],
    body:[14.4,1.6,38.4,11.2],orientation:'15.24 mm şekillendirilmiş bacak aralığı · kutupsuz',
    scope:'Endüktans ve açık sargı direnci ile zaman çözümü; çekirdek doyumu, kuplaj, parazit kapasite ve ısınma modellenmez.'
  }
};
