# Wirevo 0.60 devam planı

Güncel kullanıcı işi: Wirevo adı/logo ve TR / EN. STM32 için son teknik checkpoint 0.59; 0.60 bir marka/dil sürümüdür.

- i18n: dist/i18n.js + dist/locales/en.js. Yeni UI metinlerini sözlüğe ekle; kullanıcı verisine/firmware koduna çeviri uygulama. Teknik hata/diagnostic metinlerini sonraki turda tipli hata kodlarıyla yerelleştirmek tercih edilir. Teknik belgeler/eskiden kalmış ayrıntılı açıklamalarda kaynak dil kalabilir.
- Uyumluluk: circuitforge.studio.v2, proje formatı, CF_ ve cf_hal isimleri korunur. Yeni URL farklı origin olduğundan eski yayın depolamasını otomatik taşındı varsayma; JSON/ZIP gerekir.
- Yayın/GitHub: AGENTS.md akışına uy. GitHub depo adresi circuitforge kalır; depo taşınmadı/yeniden adlandırılmadı.
- Kart geliştirme: docs/STM32_PLAN_0.59.md içindeki açık alt özellikleri tamamlandı diye gösterme. Kullanıcının diğer kartlara geçme isteği doğrultusunda RP2040/Pico için resmi pinout, M0+ motoru/firmware ve elektriksel devre kabulüyle ayrı somut aşama planla. Henüz kart desteği var deme.
- Zamanlayıcı kurulmaz; eski otomasyon yeniden başlatılmaz.
