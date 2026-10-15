import {writeFileSync} from 'node:fs';
import {BOARDS} from '../dist/board-hardware.js';
const n=v=>Math.round(v*100)/100;
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const label=(x,y,text,size=3.5,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="#e4f4ee">${text}</text>`;
function chip(x,y,w,h,name){let s=rect(x+1,y+1,w,h,'#032f35','rx="1"');for(let i=0;i<8;i++){s+=rect(x-2,y+2+i*(h-4)/8,3,1.5,'url(#metal)')+rect(x+w-1,y+2+i*(h-4)/8,3,1.5,'url(#metal)');s+=rect(x+2+i*(w-4)/8,y-2,1.5,3,'url(#metal)')+rect(x+2+i*(w-4)/8,y+h-1,1.5,3,'url(#metal)');}return s+rect(x,y,w,h,'url(#chip)','rx=".6" stroke="#0c151a" stroke-width=".5"')+`<circle cx="${x+2.3}" cy="${y+2.3}" r=".8" fill="#6a777c"/>`+label(x+w/2,y+h/2,name,2.2)+label(x+w/2,y+h/2+3,'ATMEGA328P',1.7);}
function passive(x,y,vertical=false){return `<g transform="translate(${x} ${y})${vertical?' rotate(90)':''}">${rect(0,0,5,2.4,'#b4aea0','rx=".3"')}${rect(1,0,3,2.4,'#45433d')}${rect(0,0,.8,2.4,'url(#metal)')}${rect(4.2,0,.8,2.4,'url(#metal)')}</g>`;}
function button(x,y){return rect(x-1,y-1,14,12,'#043842','rx="1"')+rect(x,y,12,10,'url(#metal)','rx="1" stroke="#77818b" stroke-width=".5"')+rect(x+1.5,y+1.5,9,7,'#242d32','rx="1"')+`<circle cx="${x+6}" cy="${y+5}" r="3" fill="#a7adb1" stroke="#d6dbdd" stroke-width=".7"/>`;}
for(const key of ['nano','pro-mini']){
 const d=BOARDS[key],nano=key==='nano';let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.width} ${d.height}"><defs><linearGradient id="pcb" x2="1" y2="1"><stop stop-color="#167b8b"/><stop offset=".5" stop-color="#086073"/><stop offset="1" stop-color="#074554"/></linearGradient><linearGradient id="metal" x2="0" y2="1"><stop stop-color="#f2f1e7"/><stop offset=".4" stop-color="#adb6bc"/><stop offset=".7" stop-color="#e7e9e5"/><stop offset="1" stop-color="#707f89"/></linearGradient><linearGradient id="chip" x2="1" y2="1"><stop stop-color="#41464b"/><stop offset="1" stop-color="#172126"/></linearGradient><radialGradient id="gold"><stop stop-color="#faf0b0"/><stop offset=".7" stop-color="#c8ab57"/><stop offset="1" stop-color="#8e7032"/></radialGradient></defs>`;
 s+=rect(.6,.6,d.width-1.2,d.height-1.2,'url(#pcb)','rx="2.8" stroke="#5c9ca0" stroke-width=".8"');
 // Subdued copper traces and vias stay inside the canonical pad positions.
 for(let i=0;i<d.pins.length;i++){const p=d.pins[i],toX=p.x<34?26:42,toY=nano?78+(i%5)*3:57+(i%5)*2;s+=`<path d="M${p.x} ${p.y}h${p.x<34?6:-6}L${toX} ${toY}" fill="none" stroke="#6fa79b" stroke-opacity=".19" stroke-width=".65"/>`;}
 if(nano){
  s+=rect(23,0,23,21,'#053847','rx="1"')+rect(22,-.1,24,18,'url(#metal)','rx="1" stroke="#718491" stroke-width=".5"')+rect(25,1,18,7,'#273841','rx="1"')+rect(27,2.5,14,3,'#101b23')+rect(25,9,18,5,'#c5cfd0')+rect(22,15,4,5,'url(#metal)')+rect(42,15,4,5,'url(#metal)');
  s+=label(34,29,'NANO',6.2)+label(34,34,'ATmega328P · 5V',2.7)+chip(25,68,19,21,'ATMEL');
  s+=button(28,112)+label(34,127,'RESET',2.5);
  s+=rect(26,47,16,9,'url(#metal)','rx="3" stroke="#546873" stroke-width=".6"')+label(34,53,'16.000',2.2);
  s+=rect(25,139,18,13,'url(#chip)','rx=".7"')+label(34,146,'USB / UART',2.1);
  for(const [x,y] of [[22,39],[40,40],[23,60],[41,61],[22,95],[41,96],[23,133],[41,133]])s+=passive(x,y);
  s+=label(34,164,'CLASSIC · 16 MHz',3);
 }else{
  s+=chip(20,47,22,22,'ATMEL')+label(34,82,'PRO MINI',5.3)+label(34,87,'5 V · 16 MHz',2.8);
  s+=button(27,8)+label(34,23,'RESET',2.5);
  s+=rect(25,30,16,8,'url(#metal)','rx="2.6" stroke="#728890" stroke-width=".5"')+label(33,35,'16.000',2.1);
  s+=rect(25,94,13,8,'url(#chip)','rx=".6"')+label(31.5,99,'REG',2);
  for(const [x,y]of [[20,40],[39,41],[20,73],[39,73],[41,95],[22,105]])s+=passive(x,y);
  s+=label(34,112,'FTDI',2.6);
 }
 for(const [name,pos] of Object.entries(d.leds)){s+=rect(pos.x-1.8,pos.y-1.6,3.6,3.2,name==='power'?'#58a869':'#c1a859','rx=".5" stroke="#d7dad0" stroke-width=".4"')+label(pos.x-3,pos.y+1,name==='power'?'PWR':'L',2,'end');}
 // Pad labels use short physical silkscreen names, with no text over holes.
 for(const p of d.pins){const side=p.x<9?'left':p.x>59?'right':p.y>115?'bottom':'inner',text=p.id.replace(/\.\d+$/,'').replace('RESET','RST');s+=`<circle cx="${n(p.x)}" cy="${n(p.y)}" r="2.65" fill="url(#gold)" stroke="#375450" stroke-width=".4"/><circle cx="${n(p.x)}" cy="${n(p.y)}" r="1.25" fill="#101f29" stroke="#8c743f" stroke-width=".35"/>`;if(side==='left')s+=label(n(p.x+4),n(p.y+1.1),text,2.8,'start');else if(side==='right')s+=label(n(p.x-4),n(p.y+1.1),text,2.8,'end');else if(side==='bottom')s+=`<g transform="translate(${n(p.x+1)} ${n(p.y-4)}) rotate(-90)">${label(0,0,text,2.5,'start')}</g>`;else s+=label(n(p.x-3.8),n(p.y+1),text,2.5,'end');}
 s+='</svg>';writeFileSync(new URL('../dist/assets/'+d.asset,import.meta.url),s);
}
