import {LIBRARIES,libraryManifest,normalizeLibraries} from './libraries.js';
import {projectFiles} from './source-files.js';
export function suggestedLibraries(project){
 const headers=new Set();for(const file of projectFiles(project))for(const match of file.content.matchAll(/^\s*#\s*include\s*[<"]([^>"\r\n]+)[>"]/gm))headers.add(match[1]);
 return LIBRARIES.filter(l=>l.headers.some(h=>headers.has(h))).map(l=>({id:l.id,version:l.version}));
}
export function showLibraryPanel(project,{showDialog,closeDialog,apply,onError}){
 let requested=project.libraries?normalizeLibraries(project.libraries).requested:suggestedLibraries(project);
 const render=()=>{
  const manifest=libraryManifest(requested),rootIDs=new Set(requested.map(l=>l.id)),lockedIDs=new Set(manifest.locked.map(l=>l.id));
  showDialog('Derleme kütüphaneleri',`<div class="library-lock-heading"><code>Uno · AVR core 1.8.7</code><span>${project.libraries?'Kilitli sürümler':'Uyumluluk → sürüm seçimi'}</span></div><div class="firmware-library-list">${LIBRARIES.map(l=>`<article class="firmware-library-row"><label><input type="checkbox" data-firmware-library="${l.id}" ${lockedIDs.has(l.id)?'checked':''} ${lockedIDs.has(l.id)&&!rootIDs.has(l.id)?'disabled':''}><span><strong>${l.name}</strong><small>${l.version}${lockedIDs.has(l.id)&&!rootIDs.has(l.id)?' · bağımlılık':''}</small></span></label><span><a href="${l.source}" download>Kaynak ↓</a><a href="${l.licenseUrl}" target="_blank" rel="noopener">${l.license} ↗</a></span></article>`).join('')}</div><div class="library-lock-footer"><code>${manifest.locked.length} paket · toolchain 0.2.0</code><button id="apply-libraries">Uygula</button><button id="legacy-libraries">Uyumluluk modu</button></div><p id="libraries-error" class="source-error" role="status"></p>`);
  const content=document.getElementById('dialog-content');content.querySelectorAll('[data-firmware-library]').forEach(input=>input.onchange=()=>{const lib=LIBRARIES.find(l=>l.id===input.dataset.firmwareLibrary);requested=input.checked?[...requested,{id:lib.id,version:lib.version}]:requested.filter(l=>l.id!==lib.id);render();});
  const commit=manifest=>{try{apply(manifest);closeDialog();}catch(e){document.getElementById('libraries-error').textContent=e.message;onError?.(e);}};
  document.getElementById('apply-libraries').onclick=()=>commit(manifest);document.getElementById('legacy-libraries').onclick=()=>commit(undefined);
 };
 render();
}
