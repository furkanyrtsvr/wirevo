export const PICO_GPIO104=`#include <pico/stdlib.h>
#include <hardware/gpio.h>
#include <stdio.h>

int main(void) {
    stdio_init_all();
    // GP15 -> resistor -> LED. GP14 -> GP16 is a feedback wire.
    const uint32_t outputs = (1u << 14) | (1u << 15);
    gpio_init_mask(outputs | (1u << 16));
    gpio_set_pulls(16, false, true);
    gpio_put_masked(outputs, outputs);
    gpio_set_dir_out_masked(outputs);
    sleep_us(10);
    bool ok = gpio_get(16) && gpio_get_out_level(15);
    puts(ok ? "GPIO104 feedback OK" : "GPIO104 check GP14 -> GP16 wire");
    while (1) {
        gpio_xor_mask(outputs);
        sleep_ms(100);
    }
}
`;
