export const PICO_ADVANCED_CODE={
 usb:`#include <pico/stdlib.h>
#include <pico/stdio_usb.h>
#include <tusb.h>
#include <stdio.h>

int main(void) {
    stdio_usb_init();
    while (!stdio_usb_connected()) { tud_task(); }
    puts("Pico USB CDC hazir");
    while (1) {
        tud_task();
        if (tud_cdc_available()) {
            int harf = tud_cdc_read_char();
            tud_cdc_write_char((char)harf);
        }
    }
}
`,
 advanced:`#include <pico/stdlib.h>
#include <pico/multicore.h>
#include <hardware/pio.h>
#include <hardware/dma.h>
#include <stdio.h>

void ikinci_cekirdek(void) {
    while (1) {
        unsigned sayi = multicore_fifo_pop_blocking();
        multicore_fifo_push_blocking(sayi + 1);
    }
}
int main(void) {
    stdio_init_all();
    multicore_launch_core1(ikinci_cekirdek);
    multicore_fifo_push_blocking(41);
    printf("Core 1 cevabi: %u\\n", multicore_fifo_pop_blocking());
    const uint16_t komutlar[] = {0x80a0, 0x6001}; // pull block, out pins 1
    const pio_program_t program = {komutlar, 2, -1};
    int baslangic = pio_add_program(pio0, &program);
    pio_sm_config ayar = pio_get_default_sm_config();
    sm_config_set_wrap(&ayar, baslangic, baslangic + 1);
    sm_config_set_out_pins(&ayar, 15, 1);
    sm_config_set_clkdiv_int_frac(&ayar, 10000, 0);
    pio_sm_init(pio0, 0, baslangic, &ayar);
    pio_gpio_init(pio0, 15);
    pio_sm_set_consecutive_pindirs(pio0, 0, 15, 1, true);
    pio_sm_set_enabled(pio0, 0, true);
    unsigned desen[] = {1,0,1,0,1,0,1,0};
    int kanal = dma_claim_unused_channel(false);
    dma_channel_config dma_ayar = dma_channel_get_default_config(kanal);
    channel_config_set_dreq(&dma_ayar, pio_get_dreq(pio0, 0, true));
    while (1) {
        dma_channel_configure(kanal, &dma_ayar, &pio0->txf[0], desen, 8, true);
        dma_channel_wait_for_finish_blocking(kanal);
        sleep_ms(20);
    }
}
`,
 radio:`#include <pico/stdlib.h>
#include <pico/cyw43_arch.h>
#include <wirevo/net.h>
#include <stdio.h>

// Sanal laboratuvar; fiziksel Wi-Fi / BTstack / Internet degildir.
int main(void) {
    stdio_init_all();
    if (cyw43_arch_init()) return 1;
    cyw43_arch_enable_sta_mode();
    int sonuc = cyw43_arch_wifi_connect_timeout_ms(
        "WirevoLab", "wirevo1234", CYW43_AUTH_WPA2_AES_PSK, 100);
    printf("Sanal AP sonucu: %d\\n", sonuc);
    if (!sonuc) {
        char yanit[4];
        wirevo_udp_send("192.168.4.1", 7, "PING", 4);
        int n = wirevo_udp_recv(yanit, 4);
        printf("UDP alinan bayt: %d\\n", n);
        cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, true);
    }
    wirevo_ble_advertise("PicoLab");
    // Pico baglantilari penceresinden sanal BLE baglantisi kurun.
    while (1) {
        if (wirevo_ble_connected()) {
            char veri[64];
            int n = wirevo_ble_read(veri, sizeof veri);
            if (n > 0) wirevo_ble_write(veri, n);
        }
        cyw43_arch_poll();
    }
}
`};
