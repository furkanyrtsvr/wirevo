// Wirevo: native IRQ, two-core NVIC, DMA ring/byte swap/abort and internal ADC.
// All eight Pico ARM profiles. GPIO14 rising/falling edges use the callback.
// Watch the volatile variables in the C debugger after execution.
#include <pico/stdlib.h>
#include <hardware/irq.h>
#include <hardware/sync.h>
#include <hardware/dma.h>
#include <hardware/adc.h>
#include <pico/multicore.h>
volatile unsigned soft,adc_events,adc_last,adc_seen_temp,adc_seen_vsys,gpio_events,gpio_pin,dma_events,core1_events,core1_ready,temp,vsys,done,priority,enabled,masked,ring0,ring3,swapped,aborted;
unsigned src[8]={1,2,3,4,5,6,7,8};unsigned dst[4] __attribute__((aligned(16)));unsigned bs;
void sw(void){soft++;}
void sw1(void){core1_events++;}
void second(void){irq_set_exclusive_handler(PIO0_IRQ_1,sw1);irq_set_priority(PIO0_IRQ_1,0xc0);irq_set_enabled(PIO0_IRQ_1,1);irq_set_pending(PIO0_IRQ_1);while(!core1_events){}core1_ready=irq_get_priority(PIO0_IRQ_1);while(1){}}
void edge(uint pin,uint32_t events){gpio_pin=pin;gpio_events|=events;}
void adc_done(void){while(!adc_fifo_is_empty()){adc_last=adc_fifo_get();if(adc_last==temp)adc_seen_temp=1;if(adc_last==vsys)adc_seen_vsys=1;adc_events++;}if(adc_events>=4){adc_run(0);adc_irq_set_enabled(0);irq_set_enabled(ADC_IRQ_FIFO,0);}}
void dma_done(void){if(dma_irqn_get_channel_status(0,0)){dma_channel_acknowledge_irq0(0);dma_events++;}}
int main(void){
 irq_set_exclusive_handler(PIO0_IRQ_1,sw);irq_set_priority(PIO0_IRQ_1,0x80);priority=irq_get_priority(PIO0_IRQ_1);irq_set_enabled(PIO0_IRQ_1,1);enabled=irq_is_enabled(PIO0_IRQ_1);
 unsigned flags=save_and_disable_interrupts();irq_set_pending(PIO0_IRQ_1);for(volatile int i=0;i<10;i++){}masked=soft;restore_interrupts(flags);while(!soft){}irq_remove_handler(PIO0_IRQ_1,sw);
 gpio_init(14);gpio_set_irq_enabled_with_callback(14,GPIO_IRQ_EDGE_RISE|GPIO_IRQ_EDGE_FALL,1,edge);
 adc_init();adc_set_temp_sensor_enabled(1);adc_select_input(4);temp=adc_read();adc_select_input(3);vsys=adc_read();
 adc_select_input(4);adc_set_round_robin((1u<<3)|(1u<<4));adc_fifo_setup(1,0,1,0,0);adc_set_clkdiv(95.0f);irq_set_exclusive_handler(ADC_IRQ_FIFO,adc_done);adc_irq_set_enabled(1);irq_set_enabled(ADC_IRQ_FIFO,1);adc_run(1);while(adc_events<4){}adc_fifo_drain();
 irq_set_exclusive_handler(DMA_IRQ_0,dma_done);dma_channel_set_irq0_enabled(0,1);irq_set_enabled(DMA_IRQ_0,1);
 dma_channel_config c=dma_channel_get_default_config(0);channel_config_set_write_increment(&c,1);channel_config_set_ring(&c,1,4);dma_channel_configure(0,&c,dst,src,8,1);dma_channel_wait_for_finish_blocking(0);while(!dma_events){}ring0=dst[0];ring3=dst[3];
 dma_channel_config b=dma_channel_get_default_config(1);channel_config_set_bswap(&b,1);unsigned x=0x12345678;dma_channel_configure(1,&b,&bs,&x,1,1);dma_channel_wait_for_finish_blocking(1);swapped=bs;
 dma_channel_config a=dma_channel_get_default_config(2);channel_config_set_dreq(&a,0);dma_channel_configure(2,&a,&bs,src,4,1);dma_channel_abort(2);aborted=!dma_channel_is_busy(2);
 multicore_launch_core1(second);while(!core1_ready){}done=1;while(1){}
}