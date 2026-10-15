# QA 0.22 · TFT

-61parça/60örnek; iki nativeAVR-GCC sketch3076Flash/171staticSRAM, cached source/HEXmatches.
- Controller RGB565/pencerewrap/BGR, MADCTL RAMdönüş/retention/sleepgate; hardwareSPI→HC4050→realTFTpixels, beslemesiz/SCKkopuk/5Vred; gerçek CS arası pixelpair ve incompletebyte; HC4050 mount16ayrışerit/exactholes.
- Tarayıcı ST7735 TFT RGB565 READY;26416pixel/53289SPIbyte/0hata. ST7789 aynıterminal,61063pixel/123397byte/0hata. Kırmızı/yeşil/mavi/whiteblock ve animasyon; tekekrananalizör/gerçek3.3Vbufferpinleri.
- notices/TFT-MODELS.md açıklanan genericcrop, RGB565-only, conservativereset/sleep, advancedscan/readback sınırları.

0.22 son doğrulama: 327 test /0 hata.
