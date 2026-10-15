# CircuitForge 0.45 kabul kaydı

13 Ekim2026, Windows / gerçek Clang22 ARM C17 / Cortex-M3/M4F WASM.

## Otomatik doğrulama

- Genel `npm test`: **766/766**,0 fail/skipped,351806.2053ms (`.sites-runtime/full045-final.log`). AVR/ESP/STM, DC/sensör, bus, labels/ZIP, route ve worker regresyonu. Bu çalışmadan sonra SPI1 busy-config ret ve planlanan NSS tek başına kaydetme düzeltmeleri yapıldı; bunlar aşağıdaki son hedef pakette doğrulandı. Sonraki değişiklikler UI pin modu metni, yeni proje kapsam metni ve belgeler/build cache listesidir.
- STM32 `npm run test:stm32`: **167/167**,0 fail/skipped,272128.3443ms (`.sites-runtime/stm45-final.log`). Altı kart ortam/Bluetooth laboratuvarı ve uzun orta kablo overlap0 kabulü içerir.
- Son SPI1 paketi: **27/27**,0 fail/skipped,11236.1714ms (`.sites-runtime/spi45-final4.log`). Genel paketten sonra iki ek TXE/ERR IRQ35 testi de bu27 içinde geçmiştir; genel paketi768 olarak sunma.
- İlk SPI1+lab gate33/33,67685.4811ms (`.sites-runtime/spi-labs45.log`).
- `npm run build`:398 app-shell dosyası /19321766 bayt,20MiB altında; Clang ayrı cache. Doküman revizyonu bu sayıları değiştirebilir, son build tekrar ölçer.

Altı kart × canlı MCP3008 %0/%50/%100 →0/512/1023, fiziksel DOUT kopması→0; PCLK2/BR gerçek281250/328125/390625Hz. Altı kart gerçek RXNE IRQ35/WFI, OVR önceki DR korunması/DR→SR clear, RCC reset. Altı kart MVN immediate S0 APSR korunması/IT koşulu ve MVNS S1 N/Z değişimi. Altı kart unsupported CPOL/CPHA/CRC/word/order/master mode, eksikAF, clock gating abort/reopen, partial DR8/16, BSY sırasında ayar değişimi reddi. F103C6 veF411 ek gerçek TXEIE/ERRIE IRQ35, transmit buffer/shift doluluk, OVR clear. Pin üretimi/eksikSCK-MISO-MOSI, planlananNSS bağımsız kaydı, immutable proje/ZIP ve eski yazılım SPI dosyaları kabulü.

IRQ testindeki ek TXE/ERR bekleme loop'u NOP polling kullanır: while(flag0)→WFI arasında ISR çalışması gerçek donanımda da lost-wakeup yarışıdır; bunu motor hatası olarak maskeleme. RXNE testi yeterince gecikmeli transferde gerçek WFI/IRQ kabulünü içerir.

## Tarayıcı doğrulama

4174 preview HTTP200/no-store, CUA mevcut yerel sekme2. NucleoF401 çevre istasyonu yeni proje olarak açılıp gerçek Clang ile derlendi (4192B). SPI1 pin rolü PA5 seçimi, projeye özel badge, saat isteği1MHz→656.25kHz ve500kHz→328.125kHz gösterildi. Uygula cf_spi1_begin() C kaynağını üretti; çalışmakta olan firmware invalidasyonu/yeniden derleme kabulü.

1MHz istekli F401 gerçek sensör sonucu ADC511: mevcut MCP3008 acquisition/source-impedance modeli yüksek SCK'da aynı pot değerinde sonucu etkiler. Varsayılan500kHz istek ADC512/NATIVE2048/LIMIT3000; gerçek ArrowUp/Tab ile37°C→T3700/H5000/ALARM1/OLED0/LED5.91mA. Canlı devre parametre güncellemesi sırasında ilk OLED işlemi−1 döndü, sonraki döngüler0'a toparladı; bu başarısız ilk işlem gizlenmedi. Ekran CircuitForge-0.45-Istasyon.png.

BluePillC6 kontrol örneği yeni projede bağımsız500000Hz isteği/281.25kHz gerçekSCK ve2340B firmware derlemesi. Sanal PC taraması1 cihaz; connect→CONTROL READY, A→ADC512, L1→LED1 gerçek USART1 RXNE ring/IRQ ve donanımSPI üzerinden tarayıcıda görüldü. CircuitForge-0.45-Bluetooth.png kaydedildi. Pin ekranı CircuitForge-0.45-Pinler.png. Son arayüz reload sonrası çalışan PA5/PA7 pinout satırları SPI SCK/SPI MOSI olarak görüldü; yeni proje kapsam metni donanımSPI1 içerir.

## Sınırlar

Bu sürüm tüm STM32 tamamlandı demek değildir. SPI1 yalnız mode0/8bit/MSB/master/softwareNSS/defaultPA5/6/7; CS GPIO. APB clock kapatma transferi iptal eder, tam freeze/resume yok. MISO kopukken internal pull-down0 okunabilir; SPI'da ACK olmadığı için0 değer bağlı cihaz kanıtı değildir. DonanımI²C1, diğerSPI modları/remap/DMA, ileriUSART/ADC/TIM, yeniWeAct ve STM32C++/MicroPython sonraki plan. Fiziksel donanım/BLE RF/USB test yapılmadı. Resmî kaynaklar dist/notices/STM32-SPI1.md ve docs/STM32_I2C_SPI_RESEARCH_0.45.md.
