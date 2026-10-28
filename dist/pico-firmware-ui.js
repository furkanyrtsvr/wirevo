import {isPico,encodeBytes} from './unified-project.js';
import {boardKey} from './board-hardware.js';
import {nativeSDKImage} from './pico-sdk-image.js';
import {sourceKey} from './source-files.js';
export function installPicoFirmware({getProject,showDialog,adopt,onError}){
 const button=document.createElement('button');button.textContent='UF2 yükle';button.hidden=true;document.querySelector('.menubar nav').append(button);
 button.onclick=()=>{const p=getProject();showDialog('Pico · isteğe bağlı UF2 içe aktarımı','<p>Normal kullanımda kodunuzu yazıp <strong>Derle</strong> ve <strong>Çalıştır</strong> düğmelerini kullanın. Derleme tarayıcıda yapılır; bilgisayara Python, SDK yardımcısı veya başka bir uygulama kurmanız gerekmez.</p><p>Elinizde önceden derlenmiş bir ARM UF2 dosyası varsa aşağıdan içe aktarabilirsiniz. Bu isteğe bağlıdır. Dosya seçilen Pico ailesine uygun olmalıdır.</p><label>UF2 dosyası seç<input id="pico-firmware-uf2" type="file" accept=".uf2"></label><p id="pico-firmware-result" role="status"></p><p><a href="./notices/PICO-BROWSER-CMAKE.md" target="_blank">Tarayıcı derleyicisi ve CMake kapsamı</a></p>');
 document.getElementById('pico-firmware-uf2').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('UF2 en fazla 1 MB olabilir.');const image=nativeSDKImage(new Uint8Array(await file.arrayBuffer()),boardKey(p));if(getProject()!==p)throw Error('Proje değişti.');const next=structuredClone(p);next.settings.picoArchitecture='arm';next.settings.picoBuildEngine='browser';next.firmware={format:'pico-sdk-bin',board:boardKey(p),payload:encodeBytes(image),source:p.code,sourceKey:sourceKey(next),imported:true,flashBytes:image.length};adopt(next);}catch(err){document.getElementById('pico-firmware-result').textContent=err.message;onError(err.message);}e.target.value='';};
 };
 return {render(){button.hidden=!isPico(getProject())||getProject().language!=='c';}};
}
