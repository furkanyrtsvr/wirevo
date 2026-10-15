# MAX7219 chain · 0.23

Mevcut matrix8/digits8 modülünün giriş pin koordinatları değişmedi. Sağda ayrı DOUT pad eklendi; MAX7219 chip pin24. Tüm aygıtlar kendi16bit shiftregister ve LOADrising latch kullanır. CLK yükselenDINshift, düşenDOUTMSB; DOUT powered durumda50Ω push-pull ve LOADhigh durumunda da etkin. MCUkomut değişkeninden chainframe üretilmez: birinciDOUT→ikinciDIN ve ortakCLK/LOAD gerçekDCnets.

Chainfar-first words, NO-OPadres0, decode/intensity/scan/shutdown/test mevcutcontroller'da. Üçmatris native örneği: ilkdiagonal, ikincimerkezikişerit, üçüncükenarlar;parlaklık2/5/8. CLKshared olduğundan tümDINlevels aynıkenardanönceki DOUTdeğerinden sample; fallingoutput ardından DCsolve. BrokenDIN/DOUT veya beslemesiz cihaız sonraki zincireveri üretmez. Chipregisterreset güçkaybında uygulanır; tam brownoutretention/time veya electricaldamage yok.

10MHz datasheetmax; bu aşamada setup/hold/ns tDO ölçülmez, cyclequantization ve50Ωidealfiniteoutput. LEDISET/scan-duty supplyload ve multiplexdalga henüz modeldışı; intensity görüntüparlaklığına etki eder. DOUTpadgenericmoduleconnector; her fizikselvendorboard aynıpadlayoutdeğildir.

[Analog Devices MAX7219/MAX7221 primary datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/MAX7219-MAX7221.pdf), pin24/timing/serial addressing/NO-OP. YalnızMAX7219LOAD davranışı uygulanır; MAX7221CSclockgating iddia edilmez.
