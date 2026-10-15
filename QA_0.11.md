# 0.11 güç geri besleme kabulü

132test: önceki128 + contact-powered sensor source withdrawal, self-controlled NC feedback bounded16pass/rejected, subthreshold stable bias, OUT/VCC dropout inconsistency/source conflict ve gerçek32 rapidGPIO→relay→sensorADC512:1,0:0.

Tarayıcı dört1ms adım seri512:1,0:0; sensör OFF HiZ/izboşluğu. Kendi NCbeslemesini kontrol eden örnek adımda AVR sensör/kontak besleme geri beslemesi kararlı değil hatası. Sorunlar bileşenleri relay1,sensor1 gösteriyor.

Kod yazıp aynı otomasyon çağrısında hemen reload: reload immediately0.11 marker korundu. pagehide/hidden flush. Bu lifecycle değişimi için ek ayna test yazılmadı; gerçek tarayıcı kontrolü yapıldı.

Bu halen anlık DC; analog sensor transfer/coil/transient modeli değildir.
