# 0.7 kabul doğrulaması

111 otomatik test: diferansiyel prob, işaretli dal akımı, gerçek32GPIO/ADC değişimi, zaman integrali, kayıp tampon, config/topology reset, Hi-Z, NPN IB/IC/IE ve worker protokolü.

Tarayıcı:10k/10k divider2.50V, V+/V− ters−2.50V, r1 akımı0.25mA; pinlerden prob seçerken kablo sayısı değişmedi. GPIO/DC seçimi ve adım/reset kontrolü. Rapid fixture gerçek seri512:1,0:0; DC CSV ilk yüksek5823cycle(2.5V/0.00025A), düşük9193cycle; A/B3370cycle=0.2106ms. Kayıt cycle16MHz ekseniyle aynı.

0.6 yayın makbuzu: commit4ad9d1962ddfa13b231e11a0143a1ce730cffc06, version appgver_5d409379a0d4819182b60f92eb912465, deployment appgdep_6ac982c39b748191a6ed4f6bf0fbab46 succeeded. Public0.6 gerçek Blink ve yeni kütüphane doğrulandı.

DC kayıt transient/SPICE değildir. Floating değerler boş, boş aralıklar çizilmez.

0.7 yayın: commit e0431be3c753a8ee3f2c2d0c34fc0ae9c67a4d87, version appgver_06709c2244888191b0c910d3e48de22a, deployment appgdep_6ac9874bc6f081919f65d2a7e4359274 succeeded. Public0.7 Blink2ms5V/r1 13.64mA, project4component9wires korundu.
