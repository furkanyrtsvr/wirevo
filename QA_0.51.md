# CircuitForge 0.51 kabul kaydı · 14 Ekim 2026

TIM2 capture **32/32**,0fail/cancelled/skipped,21155.525ms; `.sites-runtime/capture51-last.log`. Genel nihai paket ayrıca çalıştırılır. Önceki capture18/18 ve ilk10/10 ara kapılardır; API/genişleten27/27 sonrası Nucleo C04, ortak timebase, ADC-PWM istasyonu eklendi.

Dokuz kartta directTI1 rising/indirectTI1 falling ve gerçekIRQ28. CCRtimestamp bağımsız CEN MMIO cycle ve boardHz/1MHz ile karşılaştırılır. F103C6/NucleoF401/WeActF411 /1-/2-/4-/8inputprescaler,8/4/2/1gerçeklatch, overcapture/CCRread-only/IF-OFclear. F4both-edge/softwarecapture/CEN0 IRQ. F10316bit/F432bitcounter; disconnectednetno-fakecapture. C API fresh0/empty−1/over−2/badargs; generatedCinit+ZIP; Nucleo3kart PA2/PA3rezerv/VCP; conflictingcaptureclockveGUI PWM/capturemix reddi. TI3→IC3/indirectIC4 ve gerçekTIM2PWMpin→capture loopback.

Önceki PWM22/22 ve pin/labs30/30 ile capture31/31 birleşik83/83,123524.4077ms; `.sites-runtime/timer51-final.log`. Son capture istasyonu sonradan32. NativeARM WASM0.50ileaynıbridge0.6/hash;327/327M3 ve477/477M4FRust0.50kabulü korunur. Bu aşamada motor kaynağı değişmedi.

## Tarayıcı

CUA/local4174/no-store/freshreload0.51. ADC+PWMcaptureistasyonuClang2720B. Pot50→REQ50/MEAS50/WIDTH500µs/PERIOD1000µs/ADC2048; pot75→75/75/750µs/1000µs/3071. PA1PWM→PA0capture fizikselnet; gerçekCIRQ28handler. Devrede2bileşen/4kablo, PCBdışıroute. `../CircuitForge-0.51-PWM-Capture.png`.

STM32PinlerPA0/TIM2_CH1Girişyakalama,iki-kenar,/1,1MHz;generatedcf_tim2_capture_begin(PA0,2,1,1000000),PB1ADCconfig. `../CircuitForge-0.51-Capture-Pin-Panel.png`. Sağsütunayrıkayar;projeyeözelayarlar. Demo main aynıTIM2timebaseiçinPWMvecaptureberaberkurar; GUIstartayarlarınınsonradanmainiledeğişmesi açıkCyorumunda gösterilir.

## Sınırlar

Digitalfilter/synchronizer,encoder/TRC/external-slave/masterTRGO/DMA,outputcomparematchIRQ,center/down/OPM/UDIS/URS,PSCaltfazı/clockgating ve diğerTIMler tamamlanmadı. Kalan17audit başlığı yeni devamplanında korunur. DokuzSTM/29toplamkart; dilC17. İki ana hazır lab/kart korunur; ayrıcaADCtarama vePWMölçümJSONkabulörnekleri teslim edilir. TümSTM32tamamlandı denmez.

Son genel regresyon: **1018/1018**,0fail/cancelled/skipped,416016.9923ms; `.sites-runtime/full051.log`. Eski AVR/ESP/STM/DC/bus/worker/ZIP ve yeni capture istasyonu birlikte geçti.
Son build başarılı; `.sites-runtime/build051-release.log`: appshell403dosya/19425364bayt <20MiB. Backendden sonra yalnız docs/notices değişti; tarayıcı kabulü tamamlandı.
