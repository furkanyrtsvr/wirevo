import {writeUF2} from './pico-flash.js';
import {validatePicoImage} from './pico-image.js';
import {decodeBytes} from './unified-project.js';
export function addFlashPanel({getSnapshot,getProject,send}){
 const anchor=document.getElementById('pico-session-status');if(!anchor)return;
 const section=document.createElement('section');section.innerHTML='<h3>BOOTSEL / Flash</h3><p>İşlevsel yükleyici: özgün Raspberry Pi ROM’u değildir. Wirevo vektör düzenindeki UF2 dosyaları desteklenir; SDK boot2/picobin, imzalı görüntüler ve fiziksel USB disk desteklenmez. Flash verisi bu simülasyon oturumunda reset boyunca korunur.</p><button data-uf2-export>Firmware UF2 indir</button> <button data-bootsel>BOOTSEL moduna geç</button><label>UF2 dosyası <input data-uf2 type="file" accept=".uf2"></label><pre data-flash-status></pre>';anchor.after(section);
 section.querySelector('[data-bootsel]').onclick=()=>send({type:'pico-bootsel'});
 const status=section.querySelector('[data-flash-status]');
 section.querySelector('[data-uf2-export]').onclick=()=>{try{const p=getProject(),id=p.components.find(c=>c.type==='board')?.params.model,raw=validatePicoImage(decodeBytes(p.firmware?.payload||''),id),url=URL.createObjectURL(new Blob([writeUF2(raw,id)])),a=document.createElement('a');a.href=url;a.download=id+'-wirevo.uf2';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){status.textContent='Önce Pico C firmware’ini derleyin. '+e.message;}};
 section.querySelector('[data-uf2]').onchange=async e=>{const f=e.target.files[0];if(!f)return;const p=getProject();try{if(!getSnapshot()?.pico?.bootsel)throw Error('Önce firmware’i çalıştırıp BOOTSEL moduna geçin.');if(f.size>8*1024*1024)throw Error('UF2 dosyası çok büyük.');const bytes=new Uint8Array(await f.arrayBuffer());if(getProject()!==p)throw Error('Dosya okunurken proje değişti.');send({type:'pico-flash',bytes});status.textContent='UF2 doğrulanıyor…';}catch(err){status.textContent=err.message;}e.target.value='';};updateFlashPanel(getSnapshot());
}
export function updateFlashPanel(snapshot){const s=document.querySelector('[data-flash-status]');if(s)s.textContent=snapshot?.pico?.bootsel?'BOOTSEL açık · CPU durdu · UF2 seçebilirsiniz.':'Uygulama modu · Başarılı UF2 yüklemesinden sonra Çalıştır ile başlayın.';}
