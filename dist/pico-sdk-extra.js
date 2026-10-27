export const timeSDKHeader=`
#ifndef WIREVO_PICO_TIME_TYPES
#define WIREVO_PICO_TIME_TYPES
typedef struct {uint64_t _private_us_since_boot;} absolute_time_t;
typedef int32_t alarm_id_t;typedef int64_t (*alarm_callback_t)(alarm_id_t,void*);
uint64_t time_us_64(void);absolute_time_t get_absolute_time(void);uint64_t to_us_since_boot(absolute_time_t);int64_t absolute_time_diff_us(absolute_time_t,absolute_time_t);absolute_time_t delayed_by_us(absolute_time_t,uint64_t);absolute_time_t make_timeout_time_ms(uint32_t);bool time_reached(absolute_time_t);void sleep_until(absolute_time_t);
alarm_id_t add_alarm_in_us(int64_t,alarm_callback_t,void*,bool);alarm_id_t add_alarm_in_ms(uint32_t,alarm_callback_t,void*,bool);alarm_id_t add_alarm_at(absolute_time_t,alarm_callback_t,void*,bool);bool cancel_alarm(alarm_id_t);
#endif
`;
export const syncSDKHeader=`
typedef volatile uint32_t spin_lock_t;
spin_lock_t*spin_lock_instance(uint);uint spin_lock_get_num(spin_lock_t*);int spin_lock_claim_unused(bool);void spin_lock_unclaim(uint);uint32_t spin_lock_blocking(spin_lock_t*);void spin_unlock(spin_lock_t*,uint32_t);bool spin_try_lock(spin_lock_t*,uint32_t*);bool is_spin_locked(spin_lock_t*);
`;
export const extraSDKHeaders={
 'pico/critical_section.h':`#pragma once
#include <hardware/sync.h>
typedef struct{spin_lock_t*spin_lock;uint32_t save;}critical_section_t;
void critical_section_init(critical_section_t*);void critical_section_init_with_lock_num(critical_section_t*,uint);void critical_section_enter_blocking(critical_section_t*);void critical_section_exit(critical_section_t*);void critical_section_deinit(critical_section_t*);
`,
 'pico/mutex.h':`#pragma once
#include <hardware/sync.h>
typedef struct{spin_lock_t*spin_lock;volatile uint32_t owner;}mutex_t;
void mutex_init(mutex_t*);void mutex_enter_blocking(mutex_t*);bool mutex_try_enter(mutex_t*,uint32_t*);void mutex_exit(mutex_t*);
`};
export function extraSDKRuntimeC(board){return`
#include <pico/critical_section.h>
#include <pico/mutex.h>
static unsigned cf_spin_claimed;
spin_lock_t*spin_lock_instance(uint n){return n<32?(spin_lock_t*)(0xd0000100u+n*4):(spin_lock_t*)0;}
uint spin_lock_get_num(spin_lock_t*p){return((unsigned)p-0xd0000100u)/4;}
uint32_t spin_lock_blocking(spin_lock_t*p){unsigned s=save_and_disable_interrupts();while(!*p){}return s;}
void spin_unlock(spin_lock_t*p,uint32_t s){*p=0;restore_interrupts(s);}
bool spin_try_lock(spin_lock_t*p,uint32_t*out){unsigned s=save_and_disable_interrupts();if(*p){if(out)*out=s;return 1;}restore_interrupts(s);return 0;}
bool is_spin_locked(spin_lock_t*p){return !!(REG(0xd000005cu)&(1u<<spin_lock_get_num(p)));}
int spin_lock_claim_unused(bool required){unsigned s=spin_lock_blocking(spin_lock_instance(31));int found=-1;for(uint i=16;i<31;i++)if(!(cf_spin_claimed&(1u<<i))){cf_spin_claimed|=1u<<i;found=i;break;}spin_unlock(spin_lock_instance(31),s);(void)required;return found;}
void spin_lock_unclaim(uint n){unsigned s=spin_lock_blocking(spin_lock_instance(31));cf_spin_claimed&=~(1u<<(n&31));spin_unlock(spin_lock_instance(31),s);}
void critical_section_init_with_lock_num(critical_section_t*c,uint n){c->spin_lock=spin_lock_instance(n);c->save=0;}
void critical_section_init(critical_section_t*c){int n=spin_lock_claim_unused(1);if(n<0)Default_Handler();critical_section_init_with_lock_num(c,n);}
void critical_section_enter_blocking(critical_section_t*c){c->save=spin_lock_blocking(c->spin_lock);}
void critical_section_exit(critical_section_t*c){spin_unlock(c->spin_lock,c->save);}
void critical_section_deinit(critical_section_t*c){spin_lock_unclaim(spin_lock_get_num(c->spin_lock));c->spin_lock=0;}
void mutex_init(mutex_t*m){int n=spin_lock_claim_unused(1);if(n<0)Default_Handler();m->spin_lock=spin_lock_instance(n);m->owner=0;}
bool mutex_try_enter(mutex_t*m,uint32_t*out){unsigned s=spin_lock_blocking(m->spin_lock);bool ok=!m->owner;if(ok)m->owner=get_core_num()+1;else if(out)*out=m->owner-1;spin_unlock(m->spin_lock,s);return ok;}
void mutex_enter_blocking(mutex_t*m){while(!mutex_try_enter(m,0))tight_loop_contents();}
void mutex_exit(mutex_t*m){unsigned s=spin_lock_blocking(m->spin_lock);if(m->owner==get_core_num()+1)m->owner=0;spin_unlock(m->spin_lock,s);}
#define CF_TIMER ${board.mcu==='RP2350'?'0x400b0000u':'0x40054000u'}
uint64_t time_us_64(void){unsigned hi,lo;do{hi=REG(CF_TIMER+0x24);lo=REG(CF_TIMER+0x28);}while(hi!=REG(CF_TIMER+0x24));return((uint64_t)hi<<32)|lo;}
absolute_time_t get_absolute_time(void){absolute_time_t t={time_us_64()};return t;}
uint64_t to_us_since_boot(absolute_time_t t){return t._private_us_since_boot;}
int64_t absolute_time_diff_us(absolute_time_t a,absolute_time_t b){return(int64_t)(b._private_us_since_boot-a._private_us_since_boot);}
absolute_time_t delayed_by_us(absolute_time_t t,uint64_t us){t._private_us_since_boot+=us;return t;}
absolute_time_t make_timeout_time_ms(uint32_t ms){return delayed_by_us(get_absolute_time(),ms<=2147483u?ms*1000u:0x7fffffffu);}
bool time_reached(absolute_time_t t){return absolute_time_diff_us(t,get_absolute_time())>=0;}
void sleep_until(absolute_time_t t){while(!time_reached(t))tight_loop_contents();}
typedef struct{alarm_id_t id;uint32_t due;alarm_callback_t cb;void*data;}cf_alarm;
static cf_alarm cf_alarms[16];static unsigned cf_alarm_next=1;
static void cf_alarm_arm(void){unsigned now=time_us_32(),best=0x7fffffffu;bool any=0;for(int i=0;i<16;i++)if(cf_alarms[i].id){int d=(int)(cf_alarms[i].due-now);unsigned delta=d<32?32:(unsigned)d;if(delta<best)best=delta;any=1;}if(any){REG(CF_TIMER+${board.mcu==='RP2350'?'0x40u':'0x38u'})|=1;REG(CF_TIMER+0x10)=now+best;}else{REG(CF_TIMER+${board.mcu==='RP2350'?'0x40u':'0x38u'})&=~1u;REG(CF_TIMER+0x20)=1;}}
static void cf_alarm_irq(void){REG(CF_TIMER+${board.mcu==='RP2350'?'0x3cu':'0x34u'})=1;unsigned now=time_us_32();for(int i=0;i<16;i++)if(cf_alarms[i].id&&(int)(cf_alarms[i].due-now)<=0){alarm_id_t id=cf_alarms[i].id;int64_t again=cf_alarms[i].cb(id,cf_alarms[i].data);if(cf_alarms[i].id!=id)continue;if(!again)cf_alarms[i].id=0;else{uint32_t delay=(uint32_t)(again<0?-again:again);cf_alarms[i].due=(again<0?time_us_32():cf_alarms[i].due)+delay;}}cf_alarm_arm();}
alarm_id_t add_alarm_in_us(int64_t us,alarm_callback_t cb,void*data,bool fire){if(get_core_num()!=0||!cb||us>0x7fffffffu||us<0||(!us&&!fire))return-1;unsigned saved=save_and_disable_interrupts();alarm_id_t id=-1;for(int i=0;i<16;i++)if(!cf_alarms[i].id){id=(cf_alarm_next++&0x7fffffff);if(!id)id=(cf_alarm_next++&0x7fffffff);cf_alarms[i]=(cf_alarm){id,time_us_32()+(uint32_t)us,cb,data};break;}irq_set_exclusive_handler(0,cf_alarm_irq);irq_set_enabled(0,1);cf_alarm_arm();restore_interrupts(saved);return id;}
alarm_id_t add_alarm_in_ms(uint32_t ms,alarm_callback_t cb,void*d,bool fire){return ms<=2147483u?add_alarm_in_us(ms*1000u,cb,d,fire):-1;}
alarm_id_t add_alarm_at(absolute_time_t t,alarm_callback_t cb,void*d,bool fire){int64_t us=absolute_time_diff_us(get_absolute_time(),t);return add_alarm_in_us(us<0?0:us,cb,d,fire);}
bool cancel_alarm(alarm_id_t id){unsigned saved=save_and_disable_interrupts();bool found=0;for(int i=0;i<16;i++)if(cf_alarms[i].id==id){cf_alarms[i].id=0;found=1;}cf_alarm_arm();restore_interrupts(saved);return found;}
`}
