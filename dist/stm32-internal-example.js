// Standalone register firmware: no JS-side substitution of ADC results.
export function internalADCSource(f4){const base=f4?0x40012000:0x40012400;return `#include <cf_hal.h>
#include <stdio.h>
#define R(a) (*(volatile unsigned *)(a))

/* Nominal internal ADC model. Set chip temperature / VBAT in STM32 Pins.
   VDDA is fixed at 3.3 V. These are model values, not factory calibration. */
static unsigned sample(unsigned channel) {
    R(${base+52}u) = channel;
    R(${base+8}u) |= 1u << ${f4?30:22};
    while (!(R(${base}u) & 2u)) {}
    return R(${base+76}u);
}
int main(void) {
    cf_uart_begin(115200);
    cf_adc_config(PB0);
    /* Longest sampling time for internal source settling. */
    R(${base+12}u) = (7u<<18) | (7u<<21) | (7u<<24);
    ${f4?'R(0x40012304u) = (1u<<16) | (1u<<23);':`R(${base+8}u) |= 1u<<23;`}
    cf_delay_ms(1);
    for (;;) {
        unsigned temp = sample(16), vref = sample(17);
        printf("INTERNAL TEMP_RAW=%u VREF_RAW=%u", temp, vref);
        ${f4?`/* VBAT/4 shares the temperature input: switch the internal mux. */
        R(0x40012304u) = (1u<<16) | (1u<<22);
        printf(" VBAT_RAW=%u", sample(18));
        R(0x40012304u) = (1u<<16) | (1u<<23);
        cf_delay_ms(1);`:'/* F103 has no ADC VBAT channel. */'}
        puts(" OK");
        cf_delay_ms(100);
    }
}
`;}
