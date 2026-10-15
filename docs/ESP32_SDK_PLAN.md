# 0.36 güncellemesi

C3 dört derleme/link/ROM kapısı geçti. Güncel sonuç ve reçete: ESP32_SDK_PROGRESS_0.36.md. Aşağıdaki belge başlangıç araştırmasıdır.

# Arduino-ESP32 / ESP-IDF tarayıcı derleme araştırması

Tarih: 11 Ekim 2026. Kapsam: CircuitForge 0.34 sonrasındaki tam Arduino çekirdeği aşaması. Bu araştırma uygulama/dağıtım dosyalarını değiştirmedi. Mevcut bağımsız CircuitForge core, tam Arduino-ESP32 veya FreeRTOS değildir.

## Sonuç ve başlangıç kararı

C3 ile başla: Arduino-ESP32 3.3.8 + kendi resmî chip SDK paketi + eşleşen Espressif GCC 14.2.0 newlib/libgcc/libstdc++ dosyaları. Önce native GCC ile ROM'dan başlayıp gerçek Arduino setup/loop çalıştıran bir referans Blink üret; sonra yalnız sketch nesnesini Clang WASM ile değiştir. Core/SDK startup nesnelerini aynı native sürümden tutmak ilk ABI riskini azaltır. Başarılı karışık link, henüz tüm core'un Clang ile derlenebildiği anlamına gelmez.

C6 ikinci: C3'ün RV32IMC seçeneği kopyalanmamalı, SDK RV32IMAC kullanıyor. S3 üçüncü: Xtensa windowed ABI, literal/relocation ve exception/unwind uyumluluğu ayrı kabul kapısıdır. Clang-v3'ün basit freestanding ELF üretmesi, IDF linker script ve GCC core arşivleriyle uyumunu ispatlamaz.

Mokxi'nin simulator, runtime, Arduino core veya runtime bundle dosyaları kullanılmayacak. Yalnız daha önce doğrulanmış bağımsız LLVM compiler binary söz konusu; core/SDK aşağıdaki resmî Espressif kaynaklarından hazırlanmalı.

## Sabitlenmiş resmî arşivler

Yetkili paket metadatası: https://espressif.github.io/arduino-esp32/package_esp32_index.json
Kaynak sürüm: https://github.com/espressif/arduino-esp32/tree/3.3.8
Release: https://github.com/espressif/arduino-esp32/releases/tag/3.3.8

| Arşiv | Bayt | SHA256 |
| --- | ---: | --- |
| esp32-core-3.3.8.zip | 27752624 | 8159cefaa2eea131360ac32393d741d462583297c8c1e5169ca48139fa324173 |
| esp32c3-libs-3.3.8.zip | 55238122 | 9157ef480198ff387444649e5a9362840b3fc4f35e481697fb68cb9f2a9fb04a |
| esp32c6-libs-3.3.8.zip | 63909405 | c64dc21f327735ebbc916dccbb6a1a4334e3b7d8c74d5fdbea6913d771225efd |
| esp32s3-libs-3.3.8.zip | 65098729 | fc9dcf416ec458527b932d3423c337eb207e90492367a390c1408ecde7cc505c |

Her dosyanın URL'si `https://github.com/espressif/arduino-esp32/releases/download/3.3.8/` + yukarıdaki dosya adı. Core ve üç SDK arşivi HTTP üzerinden bellekte indirildi, SHA256 değerleri paket indeksine karşı doğrulandı. Yalnız C3 SDK araştırma klasöründe saklandı: `research/esp32/esp32c3-libs-3.3.8.zip`; yayımlanmadı. C3 4913, C6 5048, S3 5379 ZIP girdisi içeriyor.

Önemli: Git tag'inin package-index template'i eski 519857151 baytlık `esp32-arduino-libs-idf-release_v5.5-73550728-v2.zip` bağımlılığını gösteriyor. Gerçekte canlı paket indeksinin 3.3.8 kaydı chip başına SDK arşivleri kullanıyor. Eski template'e göre sürüm eşleştirmeyin. İndirilen C3 header'ı ESP-IDF **5.5.4** diyor; `flags/defines` de `IDF_VER=v5.5.4` içeriyor.

GCC baseline sürümü: `esp-14.2.0_20260121`; Arduino tool adları `esp-rv32` / `esp-x32`, tool version `2601`.

Windows RISC-V archive: https://github.com/espressif/crosstool-NG/releases/download/esp-14.2.0_20260121/riscv32-esp-elf-14.2.0_20260121-x86_64-w64-mingw32.zip
Boyut 705866147; indeks SHA256 `c2734714e59f684b74d1cb278f75b4ae9ec546aa1e55d73786ef039410e4a8f7`.
Windows Xtensa archive: https://github.com/espressif/crosstool-NG/releases/download/esp-14.2.0_20260121/xtensa-esp-elf-14.2.0_20260121-x86_64-w64-mingw32.zip
Boyut 413859845; indeks SHA256 `82cbe0353c2e7c96acc8755c854aaa2d93d346c6a378fc692e60b3912c560108`.
Bu iki büyük GCC arşivi bu araştırmada indirilmedi; bunların hashleri metadata, yerel doğrulama değildir. Tarayıcıya native EXE taşınmaz. Gereken hedef headers/statik kütüphaneler offline hazırlıkta ayrılır.

## C3 SDK iç düzeni ve startup

ZIP kökü `esp32c3-libs/`:

- `include/`: IDF component headers; `newlib/platform_include` yalnız IDF uyarlamalarını içerir, genel newlib sysroot'unun yerini tutmaz. `stdio.h`/`sys/reent.h` örnekleri `include_next` ile hedef toolchain headers gerektirir.
- `qio_qspi/include/sdkconfig.h`, `dio_qspi/include/sdkconfig.h`, kökte `sdkconfig`: derleme için seçilen flash/memory konfigürasyonunun aynısı korunmalı. Bu build `CONFIG_LIBC_NEWLIB=y`, C++ exceptions açık, RTTI kapalı, compiler runtime GCC libgcc olarak seçilmiş.
- `flags/defines`, `includes`, `c_flags`, `cpp_flags`, `S_flags`, `ld_flags`, `ld_scripts`, `ld_libs`: gerçek response files. Özellikle `flags/includes` içindeki `-iprefix`/`-iwithprefix` yolları sanal dosya sistemine deterministik biçimde uyarlanmalı.
- `lib/`: IDF component arşivleri. `libesp_system.a` üyelerinde `cpu_start.c.o`, `startup.c.o`, `startup_funcs.c.o`; `libfreertos.a` içinde `portasm.S.o`, `app_startup.c.o`; `libriscv.a` içinde `vectors.S.o`, `vectors_intc.S.o`; `libnewlib.a` içinde syscalls/reent uyarlamaları bulunuyor. Startup assembly'yi freestanding stub ile değiştirmeyin.
- `ld/memory.ld`, `ld/sections.ld` ve ROM/peripheral scripts; `sections.ld` entry `call_start_cpu0`. Flash-mapped code bölgesi `0x42000020` başlangıcı ve fiziksel flash/MMU yerleşimi gerçek image packaging gerektirir.
- `ld/libphy.a`, `libbtbb.a`, `libbtdm_app.a`: radio/BT binary kütüphaneleri; bunları genel Apache/Arduino lisansı altında varsaymayın.
- `bin/bootloader_dio_40m.elf`, `bootloader_dio_80m.elf`, `bootloader_qio_40m.elf`, `bootloader_qio_80m.elf`: esptool ile BIN'e dönüştürülecek resmî second-stage bootloader ELFs.

SDK içinde `libc.a`, `libm.a`, `libgcc.a`, `libstdc++.a` bulunmadığı doğrulandı. Bunlar GCC hedef sysroot/multilib'inden gelir. IDF'nin `libnewlib.a` ve `libcxx.a` arşivlerini genel libc/libstdc++ ile karıştırmayın.

Arduino core arşivinde `cores/esp32/main.cpp`, `Arduino.h`, `esp32-hal-gpio.c`, `esp32-hal-uart.c`, `esp32-hal-adc.c`, `esp32-hal-ledc.c` ve `variants/esp32c3/pins_arduino.h` mevcut. Arduino `app_main` → FreeRTOS loop task → setup/loop yolu korunmalı. İlk referans build `Serial` için USB CDC kapalı UART0; GPIO LED seçimi ayrı, onboard RGB basit digitalWrite LED'i değildir.

## Clang / GNU ABI uyumluluk kapıları

1. C3: `--target=riscv32-unknown-elf -march=rv32imc_zicsr_zifencei -mabi=ilp32`; C6: `rv32imac_zicsr_zifencei`, aynı ilp32 ABI. SDK flags ABI'yi açıkça yazmıyor; baseline ELF attributes/readelf ile varsayılanı doğrula. C6 atomics/FreeRTOS kullanımı için A extension emülasyonu gerekli.
2. Clang'ın kendi resource headers'ı + eşleşen GCC newlib/libstdc++ headers birlikte kullanılmalı. WASI libc veya libc++ SDK'ya karıştırılmaz. `sys/reent.h`, `_REENT_BACKWARD_BINARY_COMPAT`, newlib lock/reentrancy yapıları binary layout testine dahil edilir.
3. `_GLIBCXX_USE_CXX11_ABI`, exception/unwind personality, guard/init arrays, `__cxa_*`, operator new/delete, stack protector ve TLS yapılarını core build ile eşleştir. Arduino String, global constructor, 64-bit divide/float formatting ve vTaskDelay küçük testlerle başlangıçta sınanmalı.
4. SDK'da exceptions açık. İlk sketch'i exceptions kapalı seçmek core/SDK'nin unwind ihtiyaçlarını otomatik kaldırmaz. GCC libgcc/libstdc++ ve unwind objeleri eşleşmelidir. compiler-rt'yi libgcc yerine körlemesine koymayın: arithmetic builtins kapsamı aynı olsa bile unwinder/personality/ROM overrides aynı değildir.
5. GCC-only `-freorder-blocks`, `-fno-tree-switch-conversion`, `-fstrict-volatile-bitfields` ve S3 `-mlongcalls`/`-mdisable-hardware-atomics` seçenekleri Clang üzerinde ayrı denenmeli. Desteklenmeyeni susturmak yerine davranış eşdeğerliği/alternatifini kayıt altına al. C3 SDK iki `-std` seçeneği içeriyor; son `gnu++2a` geçerli. GNU extensions kullanan headers/native core ayrı compile gates gerektirir.
6. SDK component arşivleri non-LTO; tüm hazırlık `-fno-lto`, core archive de LTO kapalı olmalı. GCC LTO nesneleri LLD ile doğrudan uyumlu kabul edilmez.
7. Gerçek IDF linker script'teki GNU archive-member selector, EXCLUDE_FILE, KEEP/SORT/ASSERT ve orphan kuralları LLD ile tek tek sınanır. Mevcut basit CircuitForge linker script'i IDF için kullanılmaz. `--wrap` ve `-u` sembolleri korunur; `ld_libs` sırasını ilk gate'te budamayın.
8. S3: Xtensa GCC windowed ABI, call8/callx8/retw ile Clang ürettiği ABI eşleşmesi; literal pools/L32R reach/relaxation, longcalls, exception frame layout, hardware atomics, IRAM placement ve çift çekirdek startup birlikte sınanır. Yeni test olmadan C3 sonucu S3'e genellenmez.

## ROM boot ve merged image hazırlama

Resmî recipes: https://github.com/espressif/arduino-esp32/blob/3.3.8/platform.txt
Format: https://docs.espressif.com/projects/esptool/en/latest/esp32c3/advanced-topics/firmware-image-format.html

C3/C6/S3 bootloader adresi 0x0. Uygulama ELF'i gerçek esptool 5.2.0 `elf2image` ile flash mode/freq/size ayarları ve `--elf-sha256-offset 0xb0` kullanılarak paketlenir. IDF'nin flash-mapped PT_LOAD segments, alignment, esp_app_desc ve MMU sayfa kuralları korunmalı; yalnız IRAM PT_LOAD kopyalamak yeterli olmaz.

Merged dosya: 0x0 second-stage bootloader, 0x8000 partition table, 0xe000 Arduino boot_app0.bin, 0x10000 app.bin. İlk referansı native esptool ile oluştur; tarayıcı packager'ı sonra aynı image-info/ROM boot sonuçlarına karşı kabul edilir. Board/SDK flash config ile C3 4MB, C6 model 8MB, S3 N8 8MB seçimleri açıkça sabitlenmeli; generic Arduino boards default 4MB ile kart fiziksel kapasitesi karıştırılmaz. Secure boot/flash encryption ilk aşamada kapalı.

ROM → second-stage bootloader → IDF startup → FreeRTOS → Arduino setup/loop → gerçek GPIO/UART çıktısı test edilmeden “tam Arduino-ESP32 destekli” etiketi kullanmayın. Skip-ROM yalnız bağımsız core yolu veya tanılama için kalır.

## Lisans / kaynak paketi teslimi

Arduino source lisansı LGPL-2.1-or-later: https://github.com/espressif/arduino-esp32/blob/3.3.8/LICENSE.md
ESP-IDF ana kaynak lisansı Apache-2.0: https://github.com/espressif/esp-idf/blob/v5.5.4/LICENSE
IDF kaynak sürümü: https://github.com/espressif/esp-idf/tree/v5.5.4 (submodules ayrıca pinlenmeli; source ZIP tek başına bütün submodules değildir).
Lib builder: https://github.com/espressif/esp32-arduino-lib-builder (eşleşen rebuild commit/config/component lock dosyaları ayrıca yakalanmalı).
GCC/crosstool baseline ve build source release: https://github.com/espressif/crosstool-NG/releases/tag/esp-14.2.0_20260121 ; `crosstool-NG-esp-14.2.0_20260121-src.tar.gz` build altyapısıdır, tüm GCC/binutils/newlib/libstdc++ corresponding source'unu içerdiği varsayılmaz. Toolchain build tarball downloads/patch manifest incelenip actual source archives da pinlenmeli.
GCC runtime library exception açıklaması: https://www.gnu.org/licenses/gcc-exception-3.1-faq.html

Arduino library nesneleri yayımlanırsa exact core source + değişiklikler + yeniden linklenebilir nesneler/build recipe ve LGPL metni birlikte sağlanmalı; tarayıcıda statik link olması source/relink planını ortadan kaldırmaz. GCC target libraries için Runtime Library Exception ve ayrı newlib notices korunmalı. License/source manifest dosya/member bazında hazırlanmalı.

Üç SDK'yı “tamamen açık kaynak tek Apache arşivi” diye sunmayın. WiFi/PHY/coexist/BT binary altmodüller farklı koşullara sahip. Başlangıç GPIO/UART/ADC/LEDC build'inde bunlar kullanılmıyorsa dağıtım paketinden bağımlılık graph'ı kanıtıyla çıkarılabilir; kullanılıyorsa upstream licence metinleri ve şartları korunur. C3 SDK ZIP içinde kapsamlı root LICENSE dosyası görülmedi; kaynak component lisansları ve exact dependency revisions ayrı eşleştirilmeden yayımlanmaz. Bu araştırma lisans değerlendirmesi uygulaması değildir; yapılacak teknik dağıtım manifestini belirtir.

## Gerçek kabul sırası

1. Native Arduino C3 Blink + UART0: boot banner/FreeRTOS setup, 500ms GPIO2 H/L; GPIO readback; reset tekrar başlatma; cached binary değişen sketch'i gizlemesin.
2. Aynı core/SDK arşivleri + Clang WASM sketch.o: değiştirilmiş blink periodu/seri metin sonuçta değişmeli; undefined symbols/ELF attributes/stack/constructor/String/64-bit yardımcı fonksiyon kontrolleri geçmeli.
3. Arduino core'u Clang ile yeniden derleme ayrı gate; native/core object karşılaştırması ve 10s reboot-free loop.
4. ADC: gerçek `analogRead` IDF ADC oneshot yolunu çalıştırır. GPIO0..4 C3 ADC1; host ADC setter veya emulator MMIO modeline gerçek analog enjeksiyon bağlanmalı. 0/orta/üst aralık, attenuation/resolution, bağlantı kesilmesi; SDK API'sini JS constant/mock ile ikame etmeyin.
5. PWM: gerçek Arduino3 `ledcAttach(pin,freq,resolution)` + `ledcWrite(pin,duty)` veya analogWrite'ın gerçek LEDC yolunu sınayın. 0/25/50/100% ve frekans değişimi, pin routing; trace/peripheral event timing testleri. Mevcut snapshot çizgilerini cycle-exact PWM diye tanımlamayın.
6. UART1 remap/echo + fiziksel RX/TX adaptör ve FIFO/interrupt, I2C/SPI sonra. C6 aynı sırayla ayrı target manifest; S3 windowed ABI/ROM/iki çekirdek sonra ADC/PWM.
7. Native SDK/Clang in-browser build provenance, SHA, licence/source and offline cache limitleri tamamlanınca ürün etiketini genişlet.

## Doğrulanmamış noktalar

Bu çalışma SDK arşivlerini/flags/startup members/hashleri doğruladı; Clang ile gerçek Arduino/IDF SDK link veya firmware execution çalıştırmadı. GNU toolchain hedef sysroot henüz indirilmedi. SDK kaynakla birebir reproducible rebuild, bütün altcomponent lisansları, S3 GNU↔Clang unwinder ABI ve LLD script coverage açık işlerdir.

## C3 response files: arşivden birebir teknik kayıt

Aşağıdaki kayıt inceleme için; Clang'a aynen kopyalanacak reçete değildir. `ld_libs` native baseline'in sıralı tekrarlarını korur.

### flags/c_flags

```text
-march=rv32imc_zicsr_zifencei -ffunction-sections -fdata-sections -Wno-error=unused-function -Wno-error=unused-variable -Wno-error=unused-but-set-variable -Wno-error=deprecated-declarations -Wno-error=extra -Wno-unused-parameter -Wno-sign-compare -Wno-enum-conversion -gdwarf-4 -ggdb -freorder-blocks -Wwrite-strings -fstack-protector -fstrict-volatile-bitfields -fno-jump-tables -fno-tree-switch-conversion -std=gnu17 -Wno-old-style-declaration -DCHIP_HAVE_CONFIG_H -Wno-strict-prototypes 
```

### flags/cpp_flags

```text
-march=rv32imc_zicsr_zifencei -fno-rtti -ffunction-sections -fdata-sections -Wno-error=unused-function -Wno-error=unused-variable -Wno-error=unused-but-set-variable -Wno-error=deprecated-declarations -Wno-error=extra -Wno-unused-parameter -Wno-sign-compare -Wno-enum-conversion -gdwarf-4 -ggdb -freorder-blocks -Wwrite-strings -fstack-protector -fstrict-volatile-bitfields -fno-jump-tables -fno-tree-switch-conversion -std=gnu++2b -fexceptions -fuse-cxa-atexit -std=gnu++2a -DCHIP_HAVE_CONFIG_H 
```

### flags/S_flags

```text
-march=rv32imc_zicsr_zifencei -ffunction-sections -fdata-sections -Wno-error=unused-function -Wno-error=unused-variable -Wno-error=unused-but-set-variable -Wno-error=deprecated-declarations -Wno-error=extra -Wno-unused-parameter -Wno-sign-compare -Wno-enum-conversion -gdwarf-4 -ggdb -freorder-blocks -Wwrite-strings -fstack-protector -fstrict-volatile-bitfields -fno-jump-tables -fno-tree-switch-conversion -DCHIP_HAVE_CONFIG_H 
```

### flags/defines

```text
-DESP32_ARDUINO_LIB_BUILDER -DESP_MDNS_VERSION_NUMBER=\"1.11.0\" -DESP_PLATFORM -DIDF_VER=\"v5.5.4\" -DMBEDTLS_CONFIG_FILE=\"mbedtls/esp_config.h\" -DMD5_ENABLED=1 -DOPENTHREAD_CONFIG_FILE=\"openthread-core-esp32x-spinel-config.h\" -DOPENTHREAD_PROJECT_LIB_CONFIG_FILE=\"openthread-core-esp32x-spinel-config.h\" -DSERIAL_FLASHER_BOOT_HOLD_TIME_MS=50 -DSERIAL_FLASHER_RESET_HOLD_TIME_MS=100 -DSOC_MMU_PAGE_SIZE=CONFIG_MMU_PAGE_SIZE -DSOC_XTAL_FREQ_MHZ=CONFIG_XTAL_FREQ -DUNITY_INCLUDE_CONFIG_H -D_GLIBCXX_HAVE_POSIX_SEMAPHORE -D_GLIBCXX_USE_POSIX_SEMAPHORE -D_GNU_SOURCE -D_POSIX_READER_WRITER_LOCKS -DTF_LITE_STATIC_MEMORY -DCHIP_CONFIG_SOFTWARE_VERSION_NUMBER=0 -DCHIP_DNSSD_DEFAULT_PLATFORM=true -DCHIP_DNSSD_DEFAULT_NONE=false -DCHIP_DNSSD_DEFAULT_MINIMAL=false 
```

### flags/ld_flags

```text
-march=rv32imc_zicsr_zifencei -nostartfiles -fno-rtti -Wl,--cref -Wl,--defsym=IDF_TARGET_ESP32C3=0 -Wl,--no-warn-rwx-segments -Wl,--orphan-handling=warn -fno-lto -Wl,--gc-sections -Wl,--warn-common -u nvs_sec_provider_include_impl -Wl,--wrap=log_printf -u _Z5setupv -u _Z4loopv -u esp_app_desc -u esp_efuse_startup_include_func -u start_app -u __ubsan_include -u esp_system_include_startup_funcs -u __assert_func -u esp_security_init_include_impl -u esp_sleep_gpio_include -Wl,--undefined=FreeRTOS_openocd_params -u app_main -u esp_libc_include_memcpy_impl -u esp_libc_include_memmove_impl -u esp_libc_include_memcmp_impl -u esp_libc_include_strcpy_impl -u esp_libc_include_strncpy_impl -u esp_libc_include_strncmp_impl -u esp_libc_include_strcmp_impl -u esp_libc_include_heap_impl -u esp_libc_include_reent_syscalls_impl -u esp_libc_include_syscalls_impl -u esp_libc_include_pthread_impl -u esp_libc_include_assert_impl -u esp_libc_include_getentropy_impl -u esp_libc_include_init_funcs -u esp_libc_init_funcs -u pthread_include_pthread_impl -u pthread_include_pthread_cond_var_impl -u pthread_include_pthread_local_storage_impl -u pthread_include_pthread_rwlock_impl -u pthread_include_pthread_semaphore_impl -u __cxa_guard_dummy -u __cxx_init_dummy -u esp_timer_init_include_func -u uart_vfs_include_dev_init -u include_esp_phy_override -u usb_serial_jtag_vfs_include_dev_init -u usb_serial_jtag_connection_monitor_include -u esp_vfs_include_console_register -u vfs_include_syscalls_impl -u esp_vfs_include_nullfs_register -u esp_system_include_coredump_init 
```

### flags/ld_scripts

```text
-T rom.api.ld -T esp32c3.peripherals.ld -T esp32c3.rom.ld -T esp32c3.rom.api.ld -T esp32c3.rom.bt_funcs.ld -T esp32c3.rom.libgcc.ld -T esp32c3.rom.version.ld -T esp32c3.rom.ble_cca.ld -T esp32c3.rom.ble_test.ld -T esp32c3.rom.eco3.ld -T esp32c3.rom.eco3_bt_funcs.ld -T esp32c3.rom.libc.ld -T esp32c3.rom.newlib.ld -T memory.ld -T sections.ld 
```

### flags/ld_libs

```text
-lriscv -lesp_driver_gpio -lesp_pm -lmbedtls -lesp_app_format -lesp_bootloader_format -lapp_update -lesp_partition -lefuse -lbootloader_support -lesp_mm -lspi_flash -lesp_system -lesp_common -lesp_rom -lhal -llog -lheap -lsoc -lesp_security -lesp_hw_support -lfreertos -lnewlib -lpthread -lcxx -lesp_timer -lesp_driver_gptimer -lesp_ringbuf -lesp_psram -lesp_driver_uart -lapp_trace -lesp_event -lnvs_flash -lesp_phy -lesp_driver_usb_serial_jtag -lesp_vfs_console -lvfs -llwip -lesp_netif -lwpa_supplicant -lesp_coex -lesp_wifi -lesp_driver_spi -lesp_gdbstub -lbt -lunity -lcmock -lconsole -lesp_driver_i2s -lsdmmc -lesp_driver_sdspi -lesp_driver_rmt -lesp_driver_tsens -lesp_driver_sdm -lesp_driver_i2c -lesp_driver_ledc -lesp_driver_twai -ldriver -lhttp_parser -lesp-tls -lesp_adc -lesp_driver_cam -lesp_eth -lesp_hid -ltcp_transport -lesp_http_client -lesp_http_server -lesp_https_ota -lesp_https_server -lesp_lcd -lprotobuf-c -lprotocomm -lesp_local_ctrl -lespcoredump -lwear_levelling -lfatfs -ljson -lmqtt -lnvs_sec_provider -lopenthread -lrt -lspiffs -lwifi_provisioning -lespressif__esp-nn -lespressif__esp-tflite-micro -lespressif__esp_secure_cert_mgr -lespressif__json_parser -lespressif__json_generator -lespressif__mdns -lespressif__esp_delta_ota -lespressif__esp_encrypted_img -lespressif__rmaker_common -lespressif__esp_diagnostics -lespressif__cbor -lespressif__esp_diag_data_store -lespressif__esp_insights -lespressif__esp-serial-flasher -lespressif__esp_rcp_update -lespressif__esp_matter -lchmorgan__esp-libhelix-mp3 -lespressif__esp-modbus -lespressif__esp-zigbee-lib -lespressif__libsodium -lespressif__esp-dsp -lespressif__esp_modem -lespressif__esp_schedule -lespressif__network_provisioning -lespressif__esp_rainmaker -lespressif__qrcode -ljoltwallet__littlefs -lfb_gfx -lapp_trace -lapp_trace -lcmock -lunity -lesp_driver_cam -lesp_lcd -lnvs_sec_provider -lrt -lespressif__esp-tflite-micro -lespressif__esp-nn -lm -lesp_hid -lespressif__esp_matter -lfatfs -lwear_levelling -lspiffs -lespressif__esp_delta_ota -lespressif__esp_encrypted_img -lespressif__esp_insights -lespressif__esp_diagnostics -lespressif__cbor -lespressif__esp_diag_data_store -lchmorgan__esp-libhelix-mp3 -lespressif__esp-modbus -lespressif__esp-zigbee-lib -lespressif__esp-zigbee-lib -lopenthread -lespressif__libsodium -lespressif__esp-dsp -lespressif__esp_modem -lespressif__esp_rainmaker -lesp_local_ctrl -lesp_https_server -lwifi_provisioning -lespressif__esp_secure_cert_mgr -lespressif__json_parser -lespressif__json_generator -lespressif__mdns -lesp_eth -lespressif__esp_rcp_update -lespressif__esp-serial-flasher -lespressif__esp_schedule -lespressif__rmaker_common -lmqtt -lespressif__network_provisioning -lprotocomm -lbt -lbtdm_app -lble_mesh -lprotobuf-c -ljson -lopenthread -lconsole -lespressif__qrcode -ljoltwallet__littlefs -lriscv -lesp_driver_gpio -lesp_pm -lmbedtls -lesp_app_format -lesp_bootloader_format -lapp_update -lesp_partition -lefuse -lbootloader_support -lesp_mm -lspi_flash -lesp_system -lesp_common -lesp_rom -lhal -llog -lheap -lsoc -lesp_security -lesp_hw_support -lfreertos -lnewlib -lpthread -lcxx -lesp_timer -lesp_driver_gptimer -lesp_ringbuf -lesp_psram -lesp_driver_uart -lesp_event -lnvs_flash -lesp_phy -lesp_driver_usb_serial_jtag -lesp_vfs_console -lvfs -llwip -lesp_netif -lwpa_supplicant -lesp_coex -lesp_wifi -lesp_driver_spi -lesp_gdbstub -lesp_driver_i2s -lsdmmc -lesp_driver_sdspi -lesp_driver_rmt -lesp_driver_tsens -lesp_driver_sdm -lesp_driver_i2c -lesp_driver_ledc -lesp_driver_twai -ldriver -lhttp_parser -lesp-tls -lesp_adc -ltcp_transport -lesp_http_client -lesp_http_server -lesp_https_ota -lespcoredump -lmbedtls_2 -lmbedcrypto -lmbedx509 -leverest -lp256m -lcoexist -lcore -lespnow -lmesh -lnet80211 -lpp -lsmartconfig -lwapi -lriscv -lesp_driver_gpio -lesp_pm -lmbedtls -lesp_app_format -lesp_bootloader_format -lapp_update -lesp_partition -lefuse -lbootloader_support -lesp_mm -lspi_flash -lesp_system -lesp_common -lesp_rom -lhal -llog -lheap -lsoc -lesp_security -lesp_hw_support -lfreertos -lnewlib -lpthread -lcxx -lesp_timer -lesp_driver_gptimer -lesp_ringbuf -lesp_psram -lesp_driver_uart -lesp_event -lnvs_flash -lesp_phy -lesp_driver_usb_serial_jtag -lesp_vfs_console -lvfs -llwip -lesp_netif -lwpa_supplicant -lesp_coex -lesp_wifi -lesp_driver_spi -lesp_gdbstub -lesp_driver_i2s -lsdmmc -lesp_driver_sdspi -lesp_driver_rmt -lesp_driver_tsens -lesp_driver_sdm -lesp_driver_i2c -lesp_driver_ledc -lesp_driver_twai -ldriver -lhttp_parser -lesp-tls -lesp_adc -ltcp_transport -lesp_http_client -lesp_http_server -lesp_https_ota -lespcoredump -lmbedtls_2 -lmbedcrypto -lmbedx509 -leverest -lp256m -lcoexist -lcore -lespnow -lmesh -lnet80211 -lpp -lsmartconfig -lwapi -lriscv -lesp_driver_gpio -lesp_pm -lmbedtls -lesp_app_format -lesp_bootloader_format -lapp_update -lesp_partition -lefuse -lbootloader_support -lesp_mm -lspi_flash -lesp_system -lesp_common -lesp_rom -lhal -llog -lheap -lsoc -lesp_security -lesp_hw_support -lfreertos -lnewlib -lpthread -lcxx -lesp_timer -lesp_driver_gptimer -lesp_ringbuf -lesp_psram -lesp_driver_uart -lesp_event -lnvs_flash -lesp_phy -lesp_driver_usb_serial_jtag -lesp_vfs_console -lvfs -llwip -lesp_netif -lwpa_supplicant -lesp_coex -lesp_wifi -lesp_driver_spi -lesp_gdbstub -lesp_driver_i2s -lsdmmc -lesp_driver_sdspi -lesp_driver_rmt -lesp_driver_tsens -lesp_driver_sdm -lesp_driver_i2c -lesp_driver_ledc -lesp_driver_twai -ldriver -lhttp_parser -lesp-tls -lesp_adc -ltcp_transport -lesp_http_client -lesp_http_server -lesp_https_ota -lespcoredump -lmbedtls_2 -lmbedcrypto -lmbedx509 -leverest -lp256m -lcoexist -lcore -lespnow -lmesh -lnet80211 -lpp -lsmartconfig -lwapi -lriscv -lesp_driver_gpio -lesp_pm -lmbedtls -lesp_app_format -lesp_bootloader_format -lapp_update -lesp_partition -lefuse -lbootloader_support -lesp_mm -lspi_flash -lesp_system -lesp_common -lesp_rom -lhal -llog -lheap -lsoc -lesp_security -lesp_hw_support -lfreertos -lnewlib -lpthread -lcxx -lesp_timer -lesp_driver_gptimer -lesp_ringbuf -lesp_psram -lesp_driver_uart -lesp_event -lnvs_flash -lesp_phy -lesp_driver_usb_serial_jtag -lesp_vfs_console -lvfs -llwip -lesp_netif -lwpa_supplicant -lesp_coex -lesp_wifi -lesp_driver_spi -lesp_gdbstub -lesp_driver_i2s -lsdmmc -lesp_driver_sdspi -lesp_driver_rmt -lesp_driver_tsens -lesp_driver_sdm -lesp_driver_i2c -lesp_driver_ledc -lesp_driver_twai -ldriver -lhttp_parser -lesp-tls -lesp_adc -ltcp_transport -lesp_http_client -lesp_http_server -lesp_https_ota -lespcoredump -lmbedtls_2 -lmbedcrypto -lmbedx509 -leverest -lp256m -lcoexist -lcore -lespnow -lmesh -lnet80211 -lpp -lsmartconfig -lwapi -lriscv -lesp_driver_gpio -lesp_pm -lmbedtls -lesp_app_format -lesp_bootloader_format -lapp_update -lesp_partition -lefuse -lbootloader_support -lesp_mm -lspi_flash -lesp_system -lesp_common -lesp_rom -lhal -llog -lheap -lsoc -lesp_security -lesp_hw_support -lfreertos -lnewlib -lpthread -lcxx -lesp_timer -lesp_driver_gptimer -lesp_ringbuf -lesp_psram -lesp_driver_uart -lesp_event -lnvs_flash -lesp_phy -lesp_driver_usb_serial_jtag -lesp_vfs_console -lvfs -llwip -lesp_netif -lwpa_supplicant -lesp_coex -lesp_wifi -lesp_driver_spi -lesp_gdbstub -lesp_driver_i2s -lsdmmc -lesp_driver_sdspi -lesp_driver_rmt -lesp_driver_tsens -lesp_driver_sdm -lesp_driver_i2c -lesp_driver_ledc -lesp_driver_twai -ldriver -lhttp_parser -lesp-tls -lesp_adc -ltcp_transport -lesp_http_client -lesp_http_server -lesp_https_ota -lespcoredump -lmbedtls_2 -lmbedcrypto -lmbedx509 -leverest -lp256m -lcoexist -lcore -lespnow -lmesh -lnet80211 -lpp -lsmartconfig -lwapi -lriscv -lesp_driver_gpio -lesp_pm -lmbedtls -lesp_app_format -lesp_bootloader_format -lapp_update -lesp_partition -lefuse -lbootloader_support -lesp_mm -lspi_flash -lesp_system -lesp_common -lesp_rom -lhal -llog -lheap -lsoc -lesp_security -lesp_hw_support -lfreertos -lnewlib -lpthread -lcxx -lesp_timer -lesp_driver_gptimer -lesp_ringbuf -lesp_psram -lesp_driver_uart -lesp_event -lnvs_flash -lesp_phy -lesp_driver_usb_serial_jtag -lesp_vfs_console -lvfs -llwip -lesp_netif -lwpa_supplicant -lesp_coex -lesp_wifi -lesp_driver_spi -lesp_gdbstub -lesp_driver_i2s -lsdmmc -lesp_driver_sdspi -lesp_driver_rmt -lesp_driver_tsens -lesp_driver_sdm -lesp_driver_i2c -lesp_driver_ledc -lesp_driver_twai -ldriver -lhttp_parser -lesp-tls -lesp_adc -ltcp_transport -lesp_http_client -lesp_http_server -lesp_https_ota -lespcoredump -lmbedtls_2 -lmbedcrypto -lmbedx509 -leverest -lp256m -lcoexist -lcore -lespnow -lmesh -lnet80211 -lpp -lsmartconfig -lwapi -lc -lm -lstdc++ -lpthread -lnewlib -lgcc -lcxx -lphy -lbtbb -lesp_phy -lphy -lbtbb -lesp_phy -lphy -lbtbb 
```

Link inventory check: ld_libs contains 625 ordered -l occurrences and 132 unique library names. The general C/GCC/math/C++ runtime names (c, gcc, m, stdc++) are absent from SDK and supplied by the target toolchain. spi_flash must be resolved from the selected memory-type folder, not only lib/ or ld/. Preserve that search directory in the manifest.

