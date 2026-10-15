# STM32 ARM kesme dönüşü · 0.49

Nucleo F411 Bluetooth kontrol örneğinde erken gelen bağlantı/komut kesmesi programın başlangıç mesajını ikinci kez üretmesine ve ADC komutunun kaybolmasına neden oluyordu. UART hatlarındaki alınan baytlar doğruydu. Cortex motorunda Thread modunun ITSTATE alanı ayrı tutulduğu halde exception frame içine yazılmıyor, Handler girişinde temizlenmiyor ve dönüşte geri yüklenmiyordu.

Cortex-M3 ve Cortex-M4F motorları yeniden derlendi. IT[1:0] xPSR[26:25], IT[7:2] xPSR[15:10] içinde stack edilir; Handler başlangıcında IT temizlenir, exception return sırasında geri yüklenir. SVC sonraki komuta döndüğü için stack öncesinde IT ilerletilir. Handler içindeki koşullu BX ile exception return, geri yüklenen Thread IT alanını ayrıca ilerletmez. MRS EPSR alanları sıfır okumaya devam eder.

Gerçek Clang Thumb firmware testi: IT bloğunun ilk komutu ICSR PENDSTSET yazar; SysTick handler koşullu BX ile döner; kalan iki koşullu komut 7 ve 9 değerini üretir. İkinci IT bloğunda SVC ardından 11 ve 13 değerleri doğrulanır. RAM vector tablosu ve VTOR gerçek register yolu kullanılır. F103C6 ve WeAct F411CE üzerinde çalışır. Özgün Nucleo F411 Bluetooth örneği başlangıca gecikme eklenmeden korunur.

Rust frame testi beş IT durumunu, register/flag geri yüklemesini doğrular. Tüm native Rust birim testleri M3 326/326 ve M4F 476/476 geçti. Eski stack testlerinin PSR=0xffffffff fixture'ına ayrı ITSTATE=0xff eklendi; eski NVIC testlerinde ICER/ICPR okumasının ISER/ISPR ile aynı değer döndürmesi beklentisi 0.44 motor düzeltmesiyle eşitlendi. Bu değişiklikler firmware testinin yerine geçmez.

Kaynak: [Armv7-M Architecture Reference Manual DDI0403E.e](https://documentation-service.arm.com/static/606dc36485368c4c2b1bf62f), B1-518, B1-532–534, B1-543 ve A7-409. Bu düzeltme tüm ARM fault/tail-chaining/debug davranışlarının tamamlandığı iddiası değildir. Native motor kaynak ve SHA-256 değerleri STM32 provenance.json içinde yer alır.

## 0.50 ek motor düzeltmesi: STMIA T1 R7

Üç kanallı ADC taramasının tarayıcı kabulünde pin dizisinin son elemanı yanlış kalıyordu. Gerçek Clang komutunda `STMIA R1!, {R2,R3,R7}` bulunuyordu. Zmu STM T1 decoder register listesini yedi bit maskeliyor, R7'yi atlıyordu. Mask sekiz bite düzeltildi; R7 son word'e yazılır ve writeback üç word için12bayt ilerler. [Arm DDI0403E.e A7-383](https://documentation-service.arm.com/static/606dc36485368c4c2b1bf62f) T1 listesi sekiz bit içerir.

Rust decode testi ve F103C6/WeActF411CE gerçek Thumb asm store/canary/writeback testi eklendi. F4 üç kanallı tarayıcı örneği ve yerel16rank dizisiyle iki ardışık altı-parametreli C API çağrısı da doğrulanır. Native Rust M3 327/327, M4F 477/477; motorlar yeniden derlendi, provenance bridge0.6. 0.49 kesme düzeltmesi korunur.
