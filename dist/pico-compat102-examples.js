export const PICO_UART102=`#include <pico/stdlib.h>
#include <hardware/uart.h>
#include <stdio.h>

int main(void) {
    stdio_init_all();
    gpio_init(15);
    gpio_set_dir(15, GPIO_OUT);
    uart_init(uart1, 57600);
    uart_set_format(uart1, 8, 1, UART_PARITY_NONE);
    uart_set_fifo_enabled(uart1, true);
    // PL011 internal loopback: no external UART wire is needed.
    uart_get_hw(uart1)->cr |= 0x80;
    uart_puts(uart1, "PICO");
    char text[5] = {0};
    for (int i = 0; i < 4; i++) {
        if (!uart_is_readable_within_us(uart1, 1000)) {
            puts("UART timeout");
            while (1) tight_loop_contents();
        }
        text[i] = uart_getc(uart1);
    }
    puts(text);
    puts("UART loopback OK");
    gpio_put(15, 1);
    while (1) tight_loop_contents();
}
`;
export const PICO_SPI102=`#include <pico/stdlib.h>
#include <hardware/spi.h>
#include <stdio.h>

int main(void) {
    stdio_init_all();
    gpio_init(15);
    gpio_set_dir(15, GPIO_OUT);
    // Circuit wire: GP19 (TX) -> GP16 (RX). Clock is GP18.
    gpio_set_function(16, GPIO_FUNC_SPI);
    gpio_set_function(18, GPIO_FUNC_SPI);
    gpio_set_function(19, GPIO_FUNC_SPI);
    spi_init(spi0, 250000);
    spi_set_format(spi0, 16, SPI_CPOL_0, SPI_CPHA_0, SPI_MSB_FIRST);
    uint16_t tx[2] = {0xa53c, 0x192e};
    uint16_t rx[2] = {0, 0};
    int count = spi_write16_read16_blocking(spi0, tx, rx, 2);
    bool ok = count == 2 && rx[0] == tx[0] && rx[1] == tx[1];
    gpio_put(15, ok);
    puts(ok ? "SPI16 OK" : "SPI16 error: check GP19 -> GP16 wire");
    while (1) tight_loop_contents();
}
`;
