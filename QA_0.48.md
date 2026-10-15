# CircuitForge 0.48 kabul kaydı

14 Ekim2026. Gerçek Clang C17, Cortex-M3/M4F, fiziksel DC/I²C hatları.

## Otomatik doğrulama

- Genel npm test924/924,0fail/skipped,378280.0215ms (.sites-runtime/full048.log). Yeni16 EEPROM test, dokuz kart lab alarm kaydı/verify/reset ve eski AVR/ESP/STM/DC/ZIP/netlabel/bus regresyonu dahil. Sonrasında simülasyon backend değişmedi; yalnız UI/doküman/build ve ek sequential-boundary test.
- Son EEPROM hedef17/17,0fail/skipped,15654.5925ms (.sites-runtime/eeprom48-last.log). İlk13/13 ve geniş16/16 tarihsel ara sonuçlar, sayıları general924 ile toplama.
- Routing/netlabel32/32,11944.9631ms (.sites-runtime/routes48.log). Dokuz kart environment/controller18route için interior overlap0 ve nets. İlk lab48 testte45pass/3WeActroutingfail; alternatif margin çıkışı deneme düzeltmesi sonrası32route/full924 geçti. Testler gevşetilmedi.
- Final build app-shell403dosya/19403128bayt<20MiB, Clang ayrıcache. NativeARM motorları0.47 ile aynı; genuinecompile/header/core cf-stm32-0.7 yeniAPIye göre güncellendi.

## Firmware ve elektriksel kabul

Dokuz kart EEPROM0x1234 gerçek randomread1/2/3/6byte; herwrite/read kombined8START/4repeated/4STOP for4transactions, RXtails/ACK/POS/BTF, memoryrevision0. F103C6/NucleoF401/WeActF411 page63→0wrap, ilkbusyprobeNACK, boundedACKpolling, address-onlyprobe data yazmaz; WP high değişmez. F103C6/WeActF411 commit sürerkenMCUreset remainingcycle/memory/revision korur; VCCkaldırma pendingcommitiptali. Readadresfazında powerfaultNACK BUSYrelease ve buffer77koruma, reconnectread255. Geçersizprefix/read/adres/null bus başlamadan reddedilir; oversized1025noSTART;32768uçsequentialwrapson17testte.

Yeni çevreistasyonu ilk25C/50RH/ADC512/native2048/ALARM0/MEM0 recordCF,09c4,1388,0; live37C/ALARM1/MEM0 recordCF,0e74,1388,1. Checksum + physical readback. Reset sonrası EEPROM LAST T=3700 H=5000 ALARM=1 dokuz kartta görüldü. Kayıt heralarmtransition/ilkölçümde; her samplewrite yok. SensorVINloss eskierror davranışını korur. Eski kullanıcımain/files/kabloları göç ettirilmez.

## Tarayıcı sınırı

Portablepreview4174HTTP200/no-store. CUA eski sekme6 CDPfocus timeout; yeni tab webview attach timeout. Browserinventory hâlâ publicsekme6 gösterdi; open_in_codex localpreview isteği queued. Bu tur tarayıcıda0.48compile/run/görsel/screenshot kabulü tamamlanamadı. Başarılı0.47browserkanıtları tarihsel,0.48 doğrulaması diye sunulmaz. Sites troubleshooting gereği browseraltyapısı içinapp kodu değiştirilmedi; uygun otomatik testler ve nativeyayın ile devam.

## Kapsam

STM32 yalnızC17,9kart/29toplam. I²C standard7bit singlemaster writeprefix→read; genelchainedread/slave/Fast/DMA/arbitration/analogrise-time hâlâeksik. EEPROMstate runtimeiçi, reload/yeniworker/JSONkalıcılığıdeğil. Read ortasında hata buffera kısmi yazmışolabilir. STM32 C++/MPY/fullCubeHAL/USB/CAN/ETH/RTC/EXTI/DMA/ileriperiferik17auditkaydı korunur.
