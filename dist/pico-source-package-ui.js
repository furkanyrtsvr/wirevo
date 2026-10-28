import {isPico} from './unified-project.js';
import {boardKey} from './board-hardware.js';
import {compileUnified} from './unified-compile.js';
import {readSourcePackage,saveSourcePackage,removeSourcePackage} from './pico-source-package.js';
export function installPicoSourcePackage({getProject,showDialog,adopt}){
 const button=document.createElement('button');button.textContent='SDK paketi ekle';document.querySelector('.menubar nav').append(button);
 button.onclick=()=>{
  const project=getProject();let candidate=null,checking=false;
  showDialog('Pico SDK / CMake',`<style>
.pico-sdk-form{display:grid;gap:18px;line-height:1.55}.pico-sdk-form p{margin:0}.pico-sdk-form h3{font-size:14px;margin:0 0 10px}.pico-sdk-form label:not(.pico-sdk-check){display:grid;gap:7px;margin:0 0 14px}.pico-sdk-form select,.pico-sdk-form input[type=file]{width:100%;max-width:100%;min-width:0}.pico-sdk-form input[type=file]{padding:9px}.pico-sdk-form section{border-top:1px solid var(--border);padding-top:16px}.pico-sdk-form .pico-sdk-check{display:flex;align-items:center;gap:7px;margin:4px 0 10px}.pico-sdk-form .pico-sdk-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.pico-sdk-form .pico-sdk-note{color:var(--muted);font-size:11px}.pico-sdk-form details{border-top:1px solid var(--border);padding-top:14px}.pico-sdk-form summary{cursor:pointer;color:var(--cyan);font-weight:600;padding:3px 0}.pico-sdk-form .pico-sdk-steps{padding-top:12px}.pico-sdk-form ol{margin:0 0 14px;padding-left:22px}.pico-sdk-form li{margin-bottom:10px}.pico-sdk-form [hidden]{display:none!important}.pico-sdk-form #sdk-package-result:empty{display:none}.pico-sdk-form #sdk-package-result{overflow-wrap:anywhere;white-space:pre-wrap}
</style><div class="pico-sdk-form">
<p>Kodunuzu <strong>Derle</strong> ve ardından <strong>Çalıştır</strong> ile kullanın. İsterseniz ek C kaynakları ve başlıkları içeren bir SDK kaynak paketi seçebilirsiniz.</p>
<div><label>Derleme yöntemi<select id="sdk-package-mode"><option value="browser">Tarayıcı derleyicisi · kurulum gerektirmez</option><option value="package">Manuel SDK kaynak paketi · bu tarayıcıda</option></select></label><p id="sdk-package-current" role="note"></p><div class="pico-sdk-actions"><button id="sdk-package-default">Projeye uygula</button></div></div>
<section id="sdk-package-files" hidden><h3>SDK kaynak paketi</h3>
<label>Bağlı dosyaları içeren ZIP paketi<input id="sdk-package-zip" type="file" accept=".zip"></label>
<label>Veya paket klasörünü seçin<input id="sdk-package-folder" type="file" webkitdirectory multiple></label>
<label class="pico-sdk-check"><input id="sdk-package-remember" type="checkbox"> Bu tarayıcıda sakla</label>
<p class="pico-sdk-note">Saklamazsanız sayfa kapandığında paketi yeniden seçmeniz gerekir. Başka bilgisayarda aynı paketi tekrar ekleyin.</p>
<div class="pico-sdk-actions"><button id="sdk-package-apply" disabled>Denetle ve kullan</button><button id="sdk-package-remove">Paketi tarayıcıdan kaldır</button></div></section>
<p id="sdk-package-result" role="status" aria-live="polite"></p>
<p class="pico-sdk-note">Ek uygulama, Python, port veya bağlantı anahtarı gerekmez. Bu seçenek tam resmi SDK/CMake kurulumu değildir; desteklenen C/H kaynaklarını tarayıcıda derler.</p>
<details id="sdk-package-help"><summary>Kurulum ve kullanım adımları</summary><div class="pico-sdk-steps"><ol>
<li><strong>Kartınıza uygun örneği indirin.</strong> Pico / Pico H / Pico W / Pico WH için <a href="./examples/pico-source-package.zip" download>RP2040 kaynak paketi</a>; Pico 2 ailesi için <a href="./examples/pico-source-package-rp2350.zip" download>RP2350 kaynak paketi</a> seçin.</li>
<li><strong>Derleme yöntemi</strong> alanında <strong>Manuel SDK kaynak paketi</strong> seçin.</li>
<li><strong>ZIP paketini veya açtığınız klasörü seçin.</strong> Pakette <code>wirevo-sdk.json</code> ve onun listelediği gerçek C/H dosyaları birlikte bulunmalıdır. JSON tek başına SDK veya derleyici sağlamaz. Ham resmi SDK arşivi bu paket biçimi değildir.</li>
<li>Sonraki açılışta tekrar seçmemek için <strong>Bu tarayıcıda sakla</strong> kutusunu işaretleyin. Sonra <strong>Denetle ve kullan</strong> düğmesine basın. Paket kaynakları ve örnek denetim kodu gerçekten derlenir; hata varsa paket uygulanmaz.</li>
<li>Paket kabul edilince kendi kodunuz için <strong>Derle → Çalıştır</strong> kullanın. Hazır örneği denemek için paketteki JSON'un <code>probe</code> alanındaki C kodunu <code>main.c</code> dosyasına yazabilirsiniz; GP15'e bağlı LED yanar. Mevcut kodunuz kendiliğinden değiştirilmez.</li>
<li>Proje JSON/ZIP dosyası paketin yalnız adını ve içerik kimliğini saklar. <strong>Başka bilgisayarda aynı paketi yeniden seçin.</strong> Tarayıcı verilerini silmek kayıtlı paketi de siler.</li>
<li>Paketsiz kullanıma dönmek için <strong>Tarayıcı derleyicisi</strong> seçip <strong>Projeye uygula</strong> düğmesine basın. <strong>Paketi tarayıcıdan kaldır</strong> ise paketi bu tarayıcıdan da siler.</li>
</ol><p class="pico-sdk-note">Destek: C17 kaynak ve başlık dosyaları. Tam upstream CMake, EXE, Python betikleri, assembly ve önceden derlenmiş .a/.o dosyaları bu akışta çalıştırılmaz. Paket eklemek çip emülasyonunun kapsamını değiştirmez.</p><p><a href="./notices/PICO-SOURCE-PACKAGES.md" target="_blank">Kendi paketini hazırlama ve ayrıntılı sınırlar ↗</a></p></div></details>
</div>`);
  const result=document.getElementById('sdk-package-result'),apply=document.getElementById('sdk-package-apply'),current=document.getElementById('sdk-package-current');current.textContent=project.settings?.picoSourcePackage?'Seçili paket: '+project.settings.picoSourcePackage.name:'Seçili: Tarayıcı derleyicisi';
  const mode=document.getElementById('sdk-package-mode'),files=document.getElementById('sdk-package-files'),defaultButton=document.getElementById('sdk-package-default');mode.value=project.settings?.picoSourcePackage?'package':'browser';
  const modeChanged=()=>{files.hidden=mode.value!=='package';defaultButton.hidden=mode.value!=='browser';};mode.onchange=modeChanged;modeChanged();document.getElementById('sdk-package-remove').disabled=!project.settings?.picoSourcePackage;
  const unchanged=()=>{if(!result.isConnected||getProject()!==project)throw Error('Proje değişti; paneli yeniden açın.');};
  const choose=async e=>{if(checking)return;candidate=null;apply.disabled=true;try{candidate=await readSourcePackage([...e.target.files],boardKey(project));result.textContent=candidate.name+' · '+candidate.files.length+' dosya. Henüz derleme doğrulanmadı; Denetle ve kullan düğmesine basın.';apply.disabled=false;}catch(err){result.textContent=err.message;}e.target.value='';};
  document.getElementById('sdk-package-zip').onchange=choose;document.getElementById('sdk-package-folder').onchange=choose;
  apply.onclick=async()=>{if(checking||!candidate)return;checking=true;apply.disabled=true;const chosen=candidate;try{unchanged();result.textContent='Paket C kaynakları ve probe kodu WebAssembly ile derleniyor…';const probe=structuredClone(project);probe.code=chosen.probe;probe.files=[];delete probe.settings.picoSourcePackage;delete probe.firmware;await compileUnified(probe,{sdkPackage:chosen,onProgress:s=>result.textContent=s});unchanged();const ref=await saveSourcePackage(chosen,document.getElementById('sdk-package-remember').checked);unchanged();const next=structuredClone(project);next.settings.picoSourcePackage=ref;delete next.firmware;adopt(next);}catch(err){result.textContent='Paket kullanılmadı: '+err.message;}finally{checking=false;apply.disabled=!candidate;}};
  document.getElementById('sdk-package-default').onclick=()=>{try{if(checking)return;unchanged();const next=structuredClone(project);delete next.settings.picoSourcePackage;delete next.firmware;adopt(next);}catch(err){result.textContent=err.message;}};
  document.getElementById('sdk-package-remove').onclick=async()=>{try{if(checking)return;unchanged();await removeSourcePackage(project.settings.picoSourcePackage);unchanged();const next=structuredClone(project);delete next.settings.picoSourcePackage;delete next.firmware;adopt(next);}catch(err){result.textContent=err.message;}};
 };
 return {render(){const p=getProject();button.hidden=!isPico(p)||p.language!=='c';button.textContent=p.settings?.picoSourcePackage?'SDK paketi: '+p.settings.picoSourcePackage.name:'SDK paketi ekle';}};
}
