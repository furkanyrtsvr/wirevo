// Original source-compatible helpers. Queue storage is bounded, not a libc allocator.
export const containerHeaders={
 'pico/sem.h':`#pragma once
#include <pico/stdlib.h>
#include <hardware/sync.h>
typedef struct {int16_t permits,max_permits;} semaphore_t;
void sem_init(semaphore_t*,int16_t,int16_t);int sem_available(semaphore_t*);bool sem_release(semaphore_t*);void sem_reset(semaphore_t*,int16_t);bool sem_try_acquire(semaphore_t*);void sem_acquire_blocking(semaphore_t*);bool sem_acquire_timeout_ms(semaphore_t*,uint32_t);bool sem_acquire_until(semaphore_t*,absolute_time_t);
`,
 'pico/util/queue.h':`#pragma once
#include <pico/stdlib.h>
#include <hardware/sync.h>
typedef struct {spin_lock_t*lock;uint16_t size,capacity,read,write,level;uint8_t data[1024];} queue_t;
bool queue_init(queue_t*,uint,uint);bool queue_init_with_spinlock(queue_t*,uint,uint,uint);void queue_free(queue_t*);uint queue_get_level(queue_t*);bool queue_is_empty(queue_t*);bool queue_is_full(queue_t*);bool queue_try_add(queue_t*,const void*);bool queue_try_remove(queue_t*,void*);bool queue_try_peek(queue_t*,void*);void queue_add_blocking(queue_t*,const void*);void queue_remove_blocking(queue_t*,void*);void queue_peek_blocking(queue_t*,void*);
`};
export const repeatingHeader=`
#ifndef WIREVO_PICO_REPEATING
#define WIREVO_PICO_REPEATING
typedef struct repeating_timer repeating_timer_t;
typedef bool (*repeating_timer_callback_t)(repeating_timer_t*);
struct repeating_timer {int64_t delay_us;void*pool;alarm_id_t alarm_id;repeating_timer_callback_t callback;void*user_data;};
bool add_repeating_timer_us(int64_t,repeating_timer_callback_t,void*,repeating_timer_t*);bool add_repeating_timer_ms(int32_t,repeating_timer_callback_t,void*,repeating_timer_t*);bool cancel_repeating_timer(repeating_timer_t*);
absolute_time_t make_timeout_time_us(uint64_t);absolute_time_t delayed_by_ms(absolute_time_t,uint32_t);bool is_nil_time(absolute_time_t);bool is_at_the_end_of_time(absolute_time_t);
#define nil_time ((absolute_time_t){0})
#define at_the_end_of_time ((absolute_time_t){0x7fffffffffffffffULL})
#endif
`;
export const containersRuntimeC=`
#include <pico/sem.h>
#include <pico/util/queue.h>
static spin_lock_t*cf_shared_lock(void){return spin_lock_instance(15);}
void sem_init(semaphore_t*s,int16_t n,int16_t max){if(max<1||n<0||n>max)Default_Handler();s->max_permits=max;s->permits=n;}
int sem_available(semaphore_t*s){unsigned irq=spin_lock_blocking(cf_shared_lock());int n=s->permits;spin_unlock(cf_shared_lock(),irq);return n;}
bool sem_try_acquire(semaphore_t*s){unsigned irq=spin_lock_blocking(cf_shared_lock());bool ok=s->permits>0;if(ok)s->permits--;spin_unlock(cf_shared_lock(),irq);return ok;}
bool sem_release(semaphore_t*s){unsigned irq=spin_lock_blocking(cf_shared_lock());bool ok=s->permits<s->max_permits;if(ok)s->permits++;spin_unlock(cf_shared_lock(),irq);return ok;}
void sem_reset(semaphore_t*s,int16_t n){if(n<0||n>s->max_permits)Default_Handler();unsigned irq=spin_lock_blocking(cf_shared_lock());s->permits=n;spin_unlock(cf_shared_lock(),irq);}
void sem_acquire_blocking(semaphore_t*s){while(!sem_try_acquire(s))tight_loop_contents();}
bool sem_acquire_until(semaphore_t*s,absolute_time_t t){do{if(sem_try_acquire(s))return true;}while(!time_reached(t));return false;}
bool sem_acquire_timeout_ms(semaphore_t*s,uint32_t ms){return sem_acquire_until(s,make_timeout_time_ms(ms));}
bool queue_init_with_spinlock(queue_t*q,uint size,uint count,uint n){if(!size||!count||size>1024||count>1024/size||n>31)return false;q->lock=spin_lock_instance(n);q->size=size;q->capacity=count;q->read=q->write=q->level=0;return true;}
bool queue_init(queue_t*q,uint size,uint count){return queue_init_with_spinlock(q,size,count,15);}
void queue_free(queue_t*q){q->size=q->capacity=q->level=0;}
uint queue_get_level(queue_t*q){unsigned irq=spin_lock_blocking(q->lock);uint n=q->level;spin_unlock(q->lock,irq);return n;}
bool queue_is_empty(queue_t*q){return !queue_get_level(q);}bool queue_is_full(queue_t*q){return queue_get_level(q)==q->capacity;}
bool queue_try_add(queue_t*q,const void*src){unsigned irq=spin_lock_blocking(q->lock);bool ok=q->level<q->capacity;if(ok){memcpy(q->data+q->write*q->size,src,q->size);q->write=(q->write+1)%q->capacity;q->level++;}spin_unlock(q->lock,irq);return ok;}
static bool cf_queue_read(queue_t*q,void*dst,bool remove){unsigned irq=spin_lock_blocking(q->lock);bool ok=q->level>0;if(ok){if(dst)memcpy(dst,q->data+q->read*q->size,q->size);if(remove){q->read=(q->read+1)%q->capacity;q->level--;}}spin_unlock(q->lock,irq);return ok;}
bool queue_try_remove(queue_t*q,void*d){return cf_queue_read(q,d,true);}bool queue_try_peek(queue_t*q,void*d){return cf_queue_read(q,d,false);}
void queue_add_blocking(queue_t*q,const void*s){while(!queue_try_add(q,s))tight_loop_contents();}void queue_remove_blocking(queue_t*q,void*d){while(!queue_try_remove(q,d))tight_loop_contents();}void queue_peek_blocking(queue_t*q,void*d){while(!queue_try_peek(q,d))tight_loop_contents();}
absolute_time_t make_timeout_time_us(uint64_t us){return delayed_by_us(get_absolute_time(),us);}
absolute_time_t delayed_by_ms(absolute_time_t t,uint32_t ms){return delayed_by_us(t,((uint64_t)ms<<10)-((uint64_t)ms<<4)-((uint64_t)ms<<3));}
bool is_nil_time(absolute_time_t t){return !to_us_since_boot(t);}bool is_at_the_end_of_time(absolute_time_t t){return to_us_since_boot(t)==0x7fffffffffffffffULL;}
bool mutex_enter_until(mutex_t*m,absolute_time_t t){do{if(mutex_try_enter(m,0))return true;}while(!time_reached(t));return false;}
bool mutex_enter_timeout_ms(mutex_t*m,uint32_t ms){return mutex_enter_until(m,make_timeout_time_ms(ms));}
static int64_t cf_repeat_alarm(alarm_id_t id,void*d){repeating_timer_t*t=d;if(t->alarm_id!=id)return 0;if(!t->callback(t)){t->alarm_id=0;return 0;}return -t->delay_us;}
bool add_repeating_timer_us(int64_t us,repeating_timer_callback_t cb,void*d,repeating_timer_t*t){if(!t||!cb||us>2147483647LL||us< -2147483647LL)return false;if(!us)us=1;t->delay_us=us;t->callback=cb;t->user_data=d;t->pool=0;t->alarm_id=add_alarm_in_us(us<0?-us:us,cf_repeat_alarm,t,true);return t->alarm_id>0;}
bool add_repeating_timer_ms(int32_t ms,repeating_timer_callback_t cb,void*d,repeating_timer_t*t){if(ms>2147483||ms< -2147483)return false;return add_repeating_timer_us(ms*1000,cb,d,t);}
bool cancel_repeating_timer(repeating_timer_t*t){if(!t||t->alarm_id<=0)return false;bool ok=cancel_alarm(t->alarm_id);t->alarm_id=0;return ok;}
`;
