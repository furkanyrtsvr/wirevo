# QA 0.24

62 parça /62 örnek. Native AVR-GCC3316Flash/225staticSRAM.337test/0hata.

- SPI GPIO actualLED7.89mA/ADC943, GPB7inputpullupB128, buttonB0/IRQ0/FLAGS128, GPIOreadclear; realSO→MISO.
- HAENwrongaddress/opcode, BANK/SEQOP/INTCAP/A7/B7bidirectional; abortaddressreadIRQretention; missingVDD/RESET/CS/SI; ownoutputcannotphantomVDD.
- Tarayıcı: bb28pinmounted, GPIO01/80DIRFE/FF; buton basınca terminalB0IRQ0FLAGS128, sonrakiIRQ1FLAGS0; actualLED/ADC0/943. NativecachedsourceHEX ve mevcutMCP23017geriyeuyumluluktestleri.
- Model sınırları notices/SPI-GPIO-MODELS.md.
