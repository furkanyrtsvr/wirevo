// Presentation-only localization. Firmware, project values and protocol identifiers stay intact.
import {EN} from './locales/en.js';
export const LANGUAGE_KEY='wirevo.ui.language';
export function normalizeLanguage(value){return value==='en'?'en':'tr';}
const entries=Object.entries(EN).sort((a,b)=>b[0].length-a[0].length);
const escaped=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const phrases=new RegExp(entries.map(([key])=>escaped(key)).join('|'),'gu');
export function translate(text,language='tr'){
 if(language!=='en'||typeof text!=='string')return text;
 return text.replace(phrases,(match,offset,input)=>{
  // Avoid changing substrings inside identifiers and words.
  const word=/[\p{L}\p{N}_]/u;
  if(word.test(match[0])&&word.test(input[offset-1]||''))return match;
  if(word.test(match.at(-1))&&word.test(input[offset+match.length]||''))return match;
  return EN[match];
 });
}
export function installLanguage({document:doc=globalThis.document,storage=globalThis.localStorage}={}){
 let language='tr';try{language=normalizeLanguage(storage.getItem(LANGUAGE_KEY));}catch{}
 const textState=new WeakMap(),attributeState=new WeakMap();
 const skip='script,style,pre,code,textarea,.cm-editor,#console,#tree-root,#source-files,#source-tabs,#circuit,#gpio-rows,[data-no-translate],.json-preview';
 const observer=new MutationObserver(records=>{
  observer.disconnect();
  for(const record of records){
   if(record.type==='characterData')visitText(record.target);
   else if(record.type==='attributes')visitAttribute(record.target,record.attributeName);
   else for(const node of record.addedNodes)visit(node);
  }
  observe();
 });
 function visitText(node){
  const parent=node.parentElement;if(!parent||parent.closest(skip))return;
  const old=textState.get(node),current=node.nodeValue;
  const original=old&&current===old.display?old.original:current;
  const display=translate(original,language);
  // A text-only option otherwise derives its submission value from its caption.
  if(parent.tagName==='OPTION'&&!parent.hasAttribute('value'))parent.value=parent.textContent;
  textState.set(node,{original,display});if(current!==display)node.nodeValue=display;
 }
 function visitAttribute(node,name){
  if(node.closest('script,style,pre,code,textarea,.cm-editor,#console,[data-no-translate],.json-preview')||!node.hasAttribute(name))return;
  const states=attributeState.get(node)||{},old=states[name],current=node.getAttribute(name);
  const original=old&&current===old.display?old.original:current,display=translate(original,language);
  states[name]={original,display};attributeState.set(node,states);if(current!==display)node.setAttribute(name,display);
 }
 function visit(node){
  if(node.nodeType===3)return visitText(node);
  if(node.nodeType!==1||node.matches(skip))return;
  for(const name of ['title','aria-label','placeholder','alt'])visitAttribute(node,name);
  for(const child of node.childNodes)visit(child);
 }
 function observe(){observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt']});}
 function setLanguage(next){
  language=normalizeLanguage(next);observer.disconnect();doc.documentElement.lang=language;
  visit(doc.body);
  for(const button of doc.querySelectorAll('[data-ui-language]'))button.setAttribute('aria-pressed',String(button.dataset.uiLanguage===language));
  try{storage.setItem(LANGUAGE_KEY,language);}catch{}
  observe();doc.dispatchEvent(new CustomEvent('wirevo:language',{detail:{language}}));
 }
 for(const button of doc.querySelectorAll('[data-ui-language]'))button.addEventListener('click',()=>setLanguage(button.dataset.uiLanguage));
 setLanguage(language);return{setLanguage,get language(){return language;},dispose(){observer.disconnect();}};
}
