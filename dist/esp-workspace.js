import {ESP_BOARDS} from './esp-boards.js';
import {parseESPProject} from './esp-project.js';
import {ProjectHistory} from './project-history.js';
export function espSourceState({chip,source,files=[],circuit,example}){return {format:'circuitforge-esp',version:circuit?3:2,name:ESP_BOARDS[chip].name+' · '+example,chip,source,files,...(circuit?{circuit}:{}),example,firmware:null};}
export function createESPHistory(storage){return new ProjectHistory(storage,{key:'circuitforge-esp-source-v1',limit:8,maxChars:650000,validate:p=>{const s=parseESPProject(JSON.stringify(p));if(s.image)throw Error('Yerel geçmiş kaynak kod içindir.');return espSourceState(s);}});}
export const ESP_PANELS=['library','bench','editor','terminal','inspector'];
export const ESP_LAYOUT_PRESETS={all:ESP_PANELS,bench:['library','bench'],code:['editor','terminal']};
export function normalizeESPLayout(value){const result={};for(const id of ESP_PANELS)result[id]=value?.[id]!==false;if(!ESP_PANELS.some(id=>result[id]))result.bench=true;return result;}

export function normalizeESPSizes(value){return Object.fromEntries(Object.entries({bench:[20,80,65],terminal:[90,300,155],library:[130,320,200],inspector:[190,400,270]}).map(([k,[min,max,initial]])=>[k,Number.isFinite(value?.[k])?Math.max(min,Math.min(max,Math.round(value[k]))):initial]));}
