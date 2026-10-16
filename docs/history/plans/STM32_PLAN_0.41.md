# STM32 devam planı · 0.41

Güncel kullanıcı önceliği: F103C6T6 dâhil farklı geliştirme kartları ve Nucleo ailesi. 0.40 compiler kapısından gerçek M3/M4F yürütme ve ortak breadboard alanına geçildi. İlk kabul grubu Blue Pill C6/C8/CB, Nucleo F103RB/F401RE/F411RE'dir; tüm STM32 kartlarının tamamlandığı iddia edilmez.

## Tamamlanan

Gerçek ARM C17 Clang/LLD; data/bss startup, ayrı M3/M4F SHA doğrulanmış WASM, SRAM/flash/stack sınırı, GPIO/DC, DWT, SysTick exception/return, M4F VFP arithmetic, UART byte terminali, B1 ve kart LED'i. Beş hazır devre: LED, buton, UART echo, SHT31 ve MCP3008. Worker load/run/pause/reset/step/terminate; çok dosyalı JSON/ZIP; haricî EEPROM reset koruması. STM32-MODEL.md tam sınırları ve birincil kaynakları açıklar.

## Sıradaki somut işler

1. Mevcut altı kartta gerçek USART framing/RX/TX pinleri, IRQ/NVIC ve APB clock/baud kabulü; AFIO/GPIO AF mapping ve Nucleo solder-bridge profil seçimi. Şimdiki USART byte terminalini fiziksel UART gibi sunma.
2. F103 ve F401/F411 ADC, timer/PWM ve kesmeleri ayrı register/DC testleriyle uygula. PC13 akım sınırı, kart LED/B1 yükleri, haricî ADC sensörleri ve kaynak fingerprint bozulmasın.
3. C++17 ve STM32 MicroPython için gerçek toolchain/runtime kapıları. C++ core/heap/new/libc/init array ve Arduino API kapsamı; Python port/pin adları ve mevcut elektriksel devre adaptörü. ESP Python motorunu STM32 CPU firmware'i diye sunma. Runtime/core sürümü değişince cf-stm32 source fingerprint güncellensin.
4. WeAct Black Pill F401CC/F411CE ve ek F103 kartları: üretici CAD/header/LED/button/kristal revizyonu ve gerçek Flash/SRAM ile ayrı profil. Sonra Nucleo F303RE/G431RB/G474RE/L476RG: M4F CPU ortak olsa da RCC/GPIO/ADC/timer haritalarını F4 diye varsayma.
5. Nucleo-32 L031K6, Nucleo-64 C031C6/F030R8/G071RB: ayrı Armv6-M Cortex-M0/M0+ motoru, exception/startup ve F0/L0/G0 register kabulü. Wokwi kart çeşitlerini ancak bu kapılardan sonra ekle.
6. F7/H7 Nucleo-144 ve Discovery: M7 instruction/FPU profili, SRAM bankaları/cache/TIM/Flash/board başlıkları. WASM motorlarını tembel yükleyip 20 MiB app-shell sınırını koru. M33 H5/U5 TrustZone ve WB/WL RF/ikinci CPU ayrı motor kapısıdır; mevcut M3/M4F constructor desteğinden türetilmez.

## Çalışma ve yeniden üretim

npm ci; npm run build; npm test; npm run test:stm32. Clang ESP paketiyle ortak fakat ARM target'ıdır. Source src/stm32-compiler.js; motor src/stm32/src/lib.rs. Upstream Zmu kaynakları src/stm32/vendor/zmu_cortex_m, commit dist/stm32/provenance.json. Cargo.lock registry sürümlerini pinler. Rust 1.99.0 + wasm32-unknown-unknown ile `cargo build --manifest-path src/stm32/Cargo.toml --target wasm32-unknown-unknown --release --locked` M3; `--no-default-features --features m4f` M4F. İlgili wasm'i dist/stm32/cortex-m3.wasm veya cortex-m4f.wasm olarak kopyala ve artifact hash/boyutlarını güncelle. Varsayılan npm build, dağıtılan hazır WASM'i kullanır; Rust kurulumu gerektirmez.

Motor güncellemesinde hash manifesti/lisanslar ve gerçek native testler yenilenir. Pinned yayımlanmış binary hash'i platformlar arası Rust build'inin aynı byte üreteceği garantisi değildir. research/, Rust toolchain, target/, .sites-runtime ve node_modules ZIP/yayın dışında kalır. Mevcut Sites ID'si ve erişimi korunur. Güncel devir kaydı kökte YENI_SOHBET_DEVIR.md'dir.
