# 0.12 kabulü

150 otomatik test geçti. Önceki132 korunuyor; semiconductormount10, sourcefiles/ELF5, compile cancellation/RAM1, actual multifileAVR1, historyCPP-only1.

Gerçek toolchain: node scripts/check-gcc-project.mjs (pinned0.2.0 installed research/compiler). Altı kabul: ayrı staticmarker1/2 + nestedheader gerçek6048byte HEX, SRAM660byte, GPIOHIGH/LOW veUART1:2; CPP dosya/satır hata; missingheader; undefinedsymbol; duplicateglobal linker; 2756byte SRAM fitsRam=false. Compiler/tools kopyalanmadı, özgün kaynakadaptörü unmodifiedupstreamfactoryleri kullanır.

Tarayıcı: IRLZ44N yeni eklemede G/C12,D/C13,S/C14, P2N2222A C/A8,B/A9,E/A10 otomatik takılı. Kompakt SVG ile uçlar delik merkezlerinde. MOSpreset G/E18,D/E19,S/E20 ve gate direnciJ18/J24; gerçekBlink 1msadımda5V VGS,13.63mA ID ON. Tab D ayrıalias, mount yalnız3bacak. Kapanan çizim gövdesi/dolu delik/aynıbusmontajıreddi ve4kartrotasyonu otomatiktest.

Tarayıcı3dosya: sketch.ino/led.cpp/led.h ayrıGCC6048byte, SRAM660byte,1.72s; gerçek AVR serial1:2. Codehistory reload kaynaklarıkoruyor. CPP3:25 hata Sorunlar→led.cpp Ln3. Her dosya/ad firmwarekey'i etkiler; sekmegeçişi kaynak değişimi değildir. Eski schema3 projeler ve cache okunur; yeni ekdosyalı JSONschema4.

ZIP üretimi bağımsız Pythonzipfile testzip/CRC veTürkçeUTF8, nestedheader doğrulandı. Tarayıcı ZIP indirmesi5girdi(sketch.ino/led.h/led.cpp/circuit.json/firmware.hex), CRC/schema4 doğrulandı. Hazırçoklukaynakörneği5710byte/SRAM676byte/1.74s. Yenilemedeüçkaynakvegeçerlifirmwarekorundu. notes.h→config.h yenidenadlandırma/silmeöncekisnapshot veüçdosya korunması görüldü. Yayın doğrulaması checkpointindesaklanır.

Sınır: bir sketch.ino, en fazla16dosya/100KB; .cpp/.h/.hpp. .ino otomatikprototip, ZIPimport, librarymanager ve I²C/SPIcihazmodellerihenüz yok. Statik.data/.bssSRAM heap/stackpeak değildir. MevcutDC/transientsınırı korunur.
