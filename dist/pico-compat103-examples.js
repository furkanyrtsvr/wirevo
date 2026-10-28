export const PICO_PWM103=`#include <pico/stdlib.h>
#include <hardware/pwm.h>
#include <hardware/irq.h>
#include <stdio.h>

volatile unsigned wraps = 0;
void pwm_handler(void) {
    pwm_clear_irq(7);
    wraps++;
    pwm_set_chan_level(7, PWM_CHAN_B, (wraps & 255) * 4);
}

int main(void) {
    stdio_init_all();
    gpio_set_function(15, GPIO_FUNC_PWM);
    pwm_config config = pwm_get_default_config();
    pwm_config_set_clkdiv(&config, 125.5f);
    pwm_config_set_wrap(&config, 1023);
    pwm_init(7, &config, false);
    irq_set_exclusive_handler(PWM_IRQ_WRAP, pwm_handler);
    pwm_clear_irq(7);
    pwm_set_irq_enabled(7, true);
    irq_set_enabled(PWM_IRQ_WRAP, true);
    pwm_set_mask_enabled(1u << 7);
    sleep_ms(10);
    puts(wraps ? "PWM103 IRQ OK" : "PWM103 IRQ error");
    // The wrap interrupt changes the brightness of the GP15 LED.
    while (1) tight_loop_contents();
}
`;
export const PICO_I2C103=`#include <pico/stdlib.h>
#include <hardware/i2c.h>
#include <stdio.h>

int main(void) {
    stdio_init_all();
    gpio_init(15);
    gpio_set_dir(15, GPIO_OUT);
    gpio_set_function(4, GPIO_FUNC_I2C);
    gpio_set_function(5, GPIO_FUNC_I2C);
    gpio_pull_up(4);
    gpio_pull_up(5);
    i2c_init(i2c0, 100000);
    // The example circuit contains a 24LC256 at address 0x50.
    uint8_t data[3] = {0, 16, 0x5a};
    int count = i2c_write_timeout_us(i2c0, 0x50, data, 3, false, 50000);
    if (count != 3) {
        puts(count == PICO_ERROR_TIMEOUT ? "I2C timeout" : "I2C device did not respond");
        while (1) tight_loop_contents();
    }
    sleep_ms(6);
    uint8_t address[2] = {0, 16}, value = 0;
    count = i2c_write_blocking_until(i2c0, 0x50, address, 2, true,
                                    delayed_by_us(get_absolute_time(), 50000));
    if (count == 2)
        count = i2c_read_timeout_us(i2c0, 0x50, &value, 1, false, 50000);
    bool ok = count == 1 && value == 0x5a;
    gpio_put(15, ok);
    puts(ok ? "I2C103 EEPROM 0x5A OK" : "I2C103 read error");
    while (1) tight_loop_contents();
}
`;
