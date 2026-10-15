# CircuitForge Studio 0.5 QA

84 otomatik test geçti. Önceki 0.4 kapsamına eşzamanlı worker DC ve gerçek PWM akım integrali eklendi.

- Gerçek GCC fixture: 32 kez D8 HIGH→D2/A0 oku; LOW→D2/A0 oku. 16000 ve 160000 cycle dilimlerinde 32×512:1,0:0; hiçbir UI inputs paketi yok. Tek seferlik giriş aktarımı aynı sonucu veremiyor.
- GPIO source için AVRIOPort listener içinde PIN henüz güncellenmediği için yeni pinState kullanılır. ADC onADCRead hook aynı cycle çözümü örnekler. 30k iç pull-up self-feedback üretmez.
- Topoloji/parametre değişimi cache'i temizler. Yalnız elektriksel pad state anahtarı; en çok128 LRU. Başlangıç hatasında hook temizliği/fix-retry; GPIO kısa devresi ilk drive instruction içinde durur.
- Gerçek Timer2 D3/D11 ~490.196Hz, 128/255 duty. Aynı faz LED 0A; ters faz ~6.82mA. GPIO kenarlarından bağımsız referans integral ile fark<1e-10 A; eşit olmayan report pencereleri ağırlıklı olarak aynı sonucu verir.
- Worker snapshot LED ortalaması cycle integrali/windowCycles içerir; circuitId eski topolojinin akımını yeni projeye taşımaz.
- Tarayıcıda GPIO→ADC projesi 32×512:1,0:0 verdi. Duraklatıp R1'i 30k yaptık, Reset/Devam ile 32×256:1,0:0. D8/D2/A0 gerçek kenarları aynı cycle ekseninde.
- Tarayıcı iki PWM: ters faz 6.77mA, aynı faz0.00mA, ~490.20Hz, sorun yok; grafik faz farkını gösterdi. 33ms rapor penceresindeki son kısmi periyot nedeniyle akım küçük miktarda dalgalanır; bu gerçek integral sonucudur.
- Duraklatılmış LED seçimi inspector akımını anında günceller; panelde7.04mA ile seçili ölçüm aynı. GRID9.6 etiketi mekanik mm ölçeği iddiasını kaldırır.

DC sıfır gecikmeli ideal kaynak/direnç/sabit Vf modelidir; analog transient/propagasyon gecikmesi değildir. Dijital analizör analog osiloskop değildir. Kaynak/binary lisansları korunur. Public yayın sonrası doğrulama kaydı sonraki checkpoint'e eklenecek.

Yayın v5: d51dd932861879dd0fc4bf3cd756c63f2c13e2c2; deployment başarılı; mevcut public URL. Public 0.5 brand, AVR·DC SYNC, Durdur, gerçek 1Hz Blink/UART doğrulandı; CircuitForge-Studio-0.5.jpg.
