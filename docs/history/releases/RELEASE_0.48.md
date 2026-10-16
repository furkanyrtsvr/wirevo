# CircuitForge 0.48 · STM32 I²C EEPROM

14 Ekim2026. cf_i2c1_write_read gerçek repeated START ile write-prefix→read, cf_i2c1_probe adres-only ACK polling. Dokuz kart random read1/2/3/6 bayt; page wrap/WP/busy NACK, MCU reset in-flight commit ve power loss/read address NACK kabulü. Yeni environment lab8 bayt alarm record+checksum/verify ve reset load. Router ilk örtüşen rotayı kabul etmeden diğer çıkışları dener; testler gevşetilmedi. Core cf-stm32-0.7.

[API/sınırlar](../../../dist/notices/STM32-I2C-EEPROM.md), [kabul](https://github.com/furkanyrtsvr/wirevo/blob/c867d52a6474f82a01240d5449e26a0708c9c8bc/QA_0.48.md), [devam](../plans/STM32_PLAN_0.48.md). STM32 tüm aileler/periferikler/Cube HAL/C++/MicroPython tamamlanmış değildir.
