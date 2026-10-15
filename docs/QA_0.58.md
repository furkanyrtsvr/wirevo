# CircuitForge 0.58 kabul kaydı

Son USB/CAN/worker paketi19/19, hata/iptal/atlanan0 (33848.2664ms, iki dosya); önceki19/19 kabul16651.1843ms. Son worker2/2 (3907.9318ms). Gerçek C firmware dörtF103; CAN TX/RX0/1/SCE nativeIRQ; C++ linkage; FIFO overflow/list/mask/noACK/clock; USB reset/NAK/STALL/recovery/address/status/PMA/odd/64/multipacket/C++/48MHz gate. Son kabul0bayt USB paketini de içerir.

Yönlendirme ve kart bazlı örnek kataloğu14/14,111682.0199ms. İlk genel çalışmada eski test her yeniF103 örneğini F401/F411’de açmaya çalıştı; uygun-kart filtresi aynı UI/test yolunda düzeltildi. Başarısız denemeler nihai başarı sayılmaz.

CUA yerel127.0.0.1:4173: F103C6 oluştur → Projeler/Temel/USB örneği → Çalıştır (gerçekClang) → USBhost/tanıt → UTF8 echo34bayt. Descriptor/adres/configuration ve aynı IN/OUT hex görünür. Screenshot parent/CircuitForge-0.58-USB-Kabul.png. USBhostpenceresi cihazPCUSBerişimi olmadığını belirtir. HTTP200. İlk görünür tab attach başarısız, arka planda tab başarılı.

Build Node/esbuild; Rust1.99.0 M3 ve M4F release locked wasm32-unknown-unknown yeniden derlendi. Köprü0.10; M3265300B SHA43164aae0d9bc2403f579101cc6070d5b6d754a70f10f8e1d47f6854be5874c2; M4F707449B SHA145859a908d8fa372007e49d41ab2dd90e5bdee8d1a447315968b24d3700412c.

F103labFlash: USB2576B/statikSRAM24B; CAN1672B/statikSRAM8B. Bunlar MCU’nun tamamının doğrulandığı anlamına gelmez; sınırlar STM32-USB-CAN.md.

Genel çalışma1322 test: ilk geçiş1317 geçti/5 başarısız, iptal/atlanan0;960997.7813ms,concurrency4. Beşinin tamamı eski every-starter testinin F103USB/CAN örneğini F401/F411’de açma varsayımıydı. Ortak availableSTMExamples(board,language) filtresi eklenip UI ve testte kullanıldı; etkilenen dosya14/14 tekrar geçti (111682.0199ms). Bu kayıt tek geçişte1322/1322 başarı iddiası değildir. Son USB/CAN paketi19/19 (33848.2664ms), diğer genel testlerde hata yok. Nihai kaynakta kapsam dışı kart örnekleri reddedilir/gizlenir.

Son build sonrası cache/supply regresyonu7/7,214.5078ms; app shell437dosya/19632541bayt,20MiB altında. CUA ekran kanıtı yereldir; yayın ayrı deploy kaydıyla doğrulanır.
