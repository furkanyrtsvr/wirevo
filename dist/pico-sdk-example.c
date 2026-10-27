// Wirevo SDK example: all eight ARM profiles and four RP2350 Hazard3 profiles.
// Add lesson.h: unsigned lesson_answer(void);
// Add lesson.c: unsigned lesson_answer(void){return 42;}
#include <pico/stdlib.h>
#include <stdio.h>
#include <pico/multicore.h>
#include <pico/critical_section.h>
#include <pico/mutex.h>
#include <hardware/irq.h>
#include "lesson.h"
volatile unsigned atomics,done,count,other,alarm_hits,bad_hits,soft_hits,locked,unlocked,cancelled,answer,mutex_busy,owner;
critical_section_t section;mutex_t mutex;
static void atomic_increment(void){
#if PICO_RISCV
__atomic_fetch_add(&atomics,1,5);
#endif
}
void sw(void){soft_hits++;}
void core1(void){for(int i=0;i<25;i++){critical_section_enter_blocking(&section);count++;atomic_increment();critical_section_exit(&section);}other=1;while(1){}}
int64_t alarm_tick(alarm_id_t id,void*data){alarm_hits++;return alarm_hits<3?1000:0;}
int64_t bad_tick(alarm_id_t id,void*data){bad_hits++;return 0;}
int main(void){atomics=0;answer=lesson_answer();critical_section_init(&section);critical_section_enter_blocking(&section);locked=is_spin_locked(section.spin_lock);critical_section_exit(&section);unlocked=!is_spin_locked(section.spin_lock);
 mutex_init(&mutex);mutex_enter_blocking(&mutex);uint32_t held;mutex_busy=!mutex_try_enter(&mutex,&held);owner=held;mutex_exit(&mutex);
 irq_set_exclusive_handler(PIO0_IRQ_0,sw);irq_set_enabled(PIO0_IRQ_0,1);irq_set_pending(PIO0_IRQ_0);while(!soft_hits){}
 cancelled=cancel_alarm(add_alarm_in_us(200,bad_tick,0,1));add_alarm_in_ms(1,alarm_tick,0,1);
 multicore_launch_core1(core1);for(int i=0;i<25;i++){critical_section_enter_blocking(&section);count++;atomic_increment();critical_section_exit(&section);}while(!other||alarm_hits<3){}
 absolute_time_t until=make_timeout_time_ms(1);sleep_until(until);gpio_init(15);gpio_set_dir(15,1);gpio_put(15,1);done=1;while(1){}
}