# Wirevo 0.63 — STM32 kapanış kaydı

Durum: **kapalı**. Dokuz kartlık STM32 uygulama profili tamamlandı ve donduruldu. ADC2/F103 ile SDIO/Nucleo F4 son açık çevrebirim kapılarıydı; gerçek ARM firmware, register/IRQ ve negatif kart-varlık testleriyle kabul edildi.

Bu kayıt yeni küçük STM32 sürümleri için yapılacaklar listesi değildir. `dist/notices/STM32-SUPPORT-PROFILE.md` desteklenen sözleşmedir. Profil dışındaki tüm STM32 aileleri, başka kart revizyonları, vendor Cube/HAL eşdeğerliği, fiziksel debug/programlama ve haricî PC/USB/CAN/SD donanımı yeni bir ürün talebi olmadıkça bu projenin açık işi sayılmaz.

Sonraki kart ailesine geçerken bu dokuz kartın regresyonu korunur. Yeni aile mevcut F1/F4 modeline isim alias’ı verilerek çalışıyor sayılmaz; kendi CPU/register/pinout/toolchain/devre kabulünü tamamlamalıdır.
