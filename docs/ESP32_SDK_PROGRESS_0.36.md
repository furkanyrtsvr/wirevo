# ESP32-C3 tam Arduino SDK kabul kaydı — 0.36

11 Ekim 2026. Dört kapı gerçek ROM boot ile geçti: nativeGCC; Clang sketch + native core/SDK; resmî56 core kaynak dosyasının Clang WASM ile derlenmesi + GNU link; aynı full-Clang core ve SDK'nın WASM LLD ile link edilmesi. Son çıktılar ESP-ROM banner, `CLANG SDK C3 42`, `CLANG GPIO HIGH`, `CLANG GPIO LOW` üretti. Bu dar UART/GPIO/başlangıç kabulü tüm Arduino kütüphanelerinin doğrulandığı anlamına gelmez.

## Sabit girdiler

- Arduino-ESP32 3.3.8 core ZIP SHA256:8159cefaa2eea131360ac32393d741d462583297c8c1e5169ca48139fa324173
- ESP32-C3 libs3.3.8 /IDF5.5.4 ZIP SHA256:9157ef480198ff387444649e5a9362840b3fc4f35e481697fb68cb9f2a9fb04a
- GCC14.2.0_20260121 Windows RV32 toolchain ZIP SHA256:c2734714e59f684b74d1cb278f75b4ae9ec546aa1e55d73786ef039410e4a8f7
- Clang22 WASM SHA sabiti src/esp-compiler.js ile her probe'da doğrulanır. Kaynaklar https://github.com/espressif/arduino-esp32/releases/tag/3.3.8 ve resmî package index/toolchain URL'lerinden alınır.

## Tekrar üretme (Windows, Python3.13/esptool5.2, Node)

```powershell
python scripts/esp-sdk/prepare.py
python scripts/esp-sdk/build-native.py
node scripts/esp-sdk/probe-clang.mjs
node scripts/esp-sdk/probe-clang.mjs --core
python scripts/esp-sdk/link.py --full-core
python scripts/esp-sdk/package.py full-clang
node scripts/esp-sdk/check-boot.mjs full-clang
python scripts/esp-sdk/prepare-linkset.py
node scripts/esp-sdk/probe-lld.mjs
python scripts/esp-sdk/package.py lld
node scripts/esp-sdk/check-boot.mjs lld
```

Native/mixed profilleri için link.py, package.py ve check-boot.mjs parametrelerine bakın. Ara dosyalar research/esp32/native-c3; SDK ve toolchain research/esp32/sdk'dadır. İndirme SHA doğrulanır. Ara SDK binary'leri sürüm ZIP'inde ve dist'te bulunmaz; reçeteler kaynak pakettedir.

## ABI ve linker bulguları

GCC RV32 uint32_t=unsigned long, Clang'ın varsayılanı unsigned int; aynı32bit boyutuna rağmen C++ Serial.begin sembolü farklıdır. Dört INT32/LEAST32 tip makrosu GCC ile eşlenir. Core56 C/C++/S çeviri birimi ayrı derlenir; Arduino-IDF kaynak compile bayrakları kullanılır.

LLD için virtual memory.ld forward REGION_ALIAS origin'i eşdeğer rtc_iram_seg ile çözüldü; fini_array açık DRAM yerleşimine alındı. `--threads=1 --no-relax` kullanılır. Map dosyası üretilmez: mevcut WASI File her append'de tüm buffer'ı kopyalayarak büyük map çıktısında aşırı süre harcıyor.147 SDK/sysroot arşivinden debug bölümleri strip edilince280,686,898→128,482,186 bayt; sanal arşiv yükü131,385,576 bayt oldu. Kod/simgeler korunur. LLD mergedBIN456,848 bayt (0x6f890); full-Clang GNU mergedBIN379,680 bayt. Boyut farkı ayrı linker section yerleşiminden kaynaklanır; eşdeğer tüm uygulama davranışı testi henüz yoktur.

## Ürün entegrasyonundan önce

String/heap/float/64bit/FreeRTOS geniş kabul; Arduino LGPL source/relink ve RF/newlib/GCC runtime lisans manifesti; modüler cache ve asset<25MiB; ESP-EMU dahiliADC/LEDC/hardwarebus ABI. C6 RV32IMAC ve S3 resmîwindowed/unwind ayrı hedeflerdir. UI CircuitForge core0.2 kullanır; bu araştırma sonucunu tam SDK desteği diye sunmayın.
