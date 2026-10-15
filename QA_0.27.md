# QA 0.27

68 parça /69 örnek. İki özgünDO35görsel/A-Kkatotbandı ve tam4delikmontaj. İki native GCC:2388Flash/216SRAM,2338/198. DCölçüm: ileri0.7V/4.3mA, terszener5.1V/6.645mA, ArduinoADC143/522. Gerilimi12→3Vdeğiştirme: zeneroff/2.857V/ADC292, tarayıcıgerçekinput.

Altı kabul: nativeADC, terskesim, yükte regülasyondançıkış, sınırsızkaynak hata,0…24VsweepKCL,50ΩsinüsgerçekcycleADC0…143. DiodeinternalLEDakımından ayrılır. Sınırlar notices/DIODE-MODELS.md. SabitVF/VZyaklaşımı, sıcaklık/recovery/capacitance/dynamicZhenüz yok.

Son regresyon: 361 test /0 hata. Tarayıcı sinüs clipping: native UART ADC9/22/84/143 ve canlı DC scope/akım.
