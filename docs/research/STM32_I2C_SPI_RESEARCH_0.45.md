# ST birincil kaynak notları · 0.45

RM0008 (F103) §§25/26, RM0368 (F401) §§18/20, RM0383 (F411) §§18/20; AN2824 Rev4 pp5–8. Bounded salt-okunur araştırma sonucudur; kod desteğini tek başına onaylamaz.

- https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf
- https://www.st.com/resource/en/reference_manual/rm0368-stm32f401xbc-and-stm32f401xde-advanced-armbased-32bit-mcusstmicroelectronics.pdf
- https://www.st.com/resource/en/reference_manual/dm00119316.pdf
- https://www.st.com/resource/en/application_note/an2824-stm32f10xxx-ic-optimized-examples-stmicroelectronics.pdf

SPI1 0x40013000 APB2, IRQ35; enable/reset bit12 F1 ENR+18/RSTR+0C, F4+44/+24. PA4 NSS/PA5 SCK/PA6 MISO/PA7 MOSI; F1 AF push-pull/MISO input, remap PA15/PB3/PB4/PB5 MAPR bit0. F4 AF5. CR1 MSTR2/SPE6/SSM9/SSI8; BR5:3÷2..256. CR2 ERRIE5/RXNEIE6/TXEIE7. SR RXNE0/TXE1/OVR6/BSY7. OVR DR→SR okumasıyla temizlenir; önceki alınan bayt korunur. TXE buffer boşluğu, BSY shift tamamlanmasıdır.

I2C1 0x40005400 APB1, EV31/ER32. Enable/reset bit21 F1 ENR+1C/RSTR+10, F4+40/+20. F1 PB6SCL/PB7SDA veya PB8/9 MAPR bit1; F4 AF4 open-drain. Register CR1+00,CR2+04,DR+10,SR1+14,SR2+18,CCR+1C,TRISE+20. SB SR1→DR, ADDR SR1→SR2; ADDR/BTF receive full sırasında SCL tutulur. FREQ=PCLK1MHz (36/42/50), standard100k CCR180/210/250, TRISE37/43/51.

Bir byte: ACK0→ADDR clear→STOP→RXNE→DR. İki byte: POS1/ACK1→ADDR clear→ACK0→BTF→STOP→DR×2, POS/ACK geri yükle. N>2: ACK1/POS0; üç kalınca BTF→ACK0→DR N−2→BTF→STOP→DR N−1,N. Kesme korunması ve iki register ilerlemesi gerekir. TX sonlandırmada BTF sonra STOP. EV için ITEVTEN; TXE/RXNE için ITBUFEN de gerekli; errors ITERREN/ER. Saat PCLK; timer doubling uygulanmaz.

ARM MVN immediate bayrak güncellemesi S bitine bağlıdır. Resmî Arm instruction reference: https://developer.arm.com/documentation/ddi0403/latest ; koşul bayrakları açıklaması https://developer.arm.com/community/arm-community-blogs/b/architectures-and-processors-blog/posts/condition-codes-1-condition-flags-and-codes . Derlenen MVN→ITPL akışı ile mevcut motor hatası gösterilip kaynakta S bit20 düzeltildi; MVN/MVNS ayrı gerçek CPU kabulü var.
