import test from 'node:test';
import assert from 'node:assert/strict';
import {translate,normalizeLanguage,LANGUAGE_KEY} from '../dist/i18n.js';
import {readFile} from 'node:fs/promises';
test('localization preserves technical identifiers and respects word boundaries',()=>{
 assert.equal(translate('＋ Yeni proje · Kaydedildi','en'),'＋ New project · Saved');
 assert.equal(translate('GPIO · Çıkış / cf_hal.h / PA12 / main.cpp','en'),'GPIO · Output / cf_hal.h / PA12 / main.cpp');
 assert.equal(translate('my_Kart KartlarX ADC1','en'),'my_Kart KartlarX ADC1');
 assert.equal(translate('Türkçe kullanıcı metni <>&','tr'),'Türkçe kullanıcı metni <>&');
 assert.equal(normalizeLanguage('unexpected'),'tr');
 assert.equal(normalizeLanguage('en'),'en');
 assert.equal(LANGUAGE_KEY,'wirevo.ui.language');
});
test('long phrases win over overlapping words and compound component captions',()=>{
 assert.equal(translate('Auto route · Kabloları düzenle','en'),'Auto route · Arrange wires');
 assert.equal(translate('Bobin / kontak','en'),'Coil / contact');
 assert.equal(translate('SHT31 sıcaklık / nem','en'),'SHT31 temperature / humidity');
 assert.equal(translate('Uygula ve C kodunu üret','en'),'Apply and generate C code');
});
test('branding and offline locale assets ship together without renaming existing project storage',async()=>{
 const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
 const [html,app,cache]=await Promise.all([read('dist/index.html'),read('dist/app.js'),read('dist/app-cache-list.json')]);
 assert.match(html,/<title>Wirevo/);assert.doesNotMatch(html,/CircuitForge/);
 assert.match(html,/data-ui-language="tr"/);assert.match(html,/data-ui-language="en"/);
 assert.match(app,/STORE='circuitforge.studio.v2'/);
 for(const path of ['i18n.js','locales/en.js','assets/wirevo-logo.svg'])assert.ok(JSON.parse(cache).includes(path),path);
});
