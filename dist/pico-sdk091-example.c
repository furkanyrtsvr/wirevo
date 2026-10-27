#include <pico/stdlib.h>
#include <pico/time.h>
#include <pico/multicore.h>
#include <pico/util/queue.h>
#include <pico/sem.h>
#include <pico/mutex.h>
#include <stdio.h>
queue_t q;semaphore_t sem;mutex_t m;repeating_timer_t timer;
volatile unsigned done,fail,sum,produced,hits,timeout_ok,invalid_ok,peek_ok,cancel_ok;
typedef struct{unsigned n,check;} item;
void producer(void){for(unsigned i=1;i<=40;i++){item v={i,i^0x55aa};queue_add_blocking(&q,&v);}produced=40;sem_release(&sem);while(1){}}
bool repeated(repeating_timer_t*t){hits++;if(t->user_data!=&sum)fail++;return hits<3;}
int main(void){
 invalid_ok=!queue_init(&q,1025,1)&&!queue_init(&q,1,0);if(!queue_init(&q,sizeof(item),2))fail++;
 item a={7,9},b={0,0};queue_try_add(&q,&a);queue_try_add(&q,&a);peek_ok=queue_is_full(&q)&&!queue_try_add(&q,&a)&&queue_try_peek(&q,&b)&&b.n==7&&queue_get_level(&q)==2;queue_try_remove(&q,&b);queue_try_remove(&q,&b);if(!queue_is_empty(&q)||queue_try_remove(&q,&b))fail++;
 sem_init(&sem,0,1);if(sem_try_acquire(&sem)||sem_acquire_timeout_ms(&sem,0))fail++;if(!sem_release(&sem)||sem_release(&sem))fail++;sem_reset(&sem,0);
 mutex_init(&m);mutex_enter_blocking(&m);timeout_ok=!mutex_enter_timeout_ms(&m,1);mutex_exit(&m);if(!mutex_enter_until(&m,make_timeout_time_us(100)))fail++;mutex_exit(&m);
 if(!is_nil_time(nil_time)||!is_at_the_end_of_time(at_the_end_of_time)||absolute_time_diff_us(nil_time,delayed_by_ms(nil_time,2))!=2000)fail++;
 multicore_launch_core1(producer);for(unsigned i=1;i<=40;i++){queue_remove_blocking(&q,&b);if(b.n!=i||b.check!=(i^0x55aa))fail++;sum+=b.n;}if(!sem_acquire_timeout_ms(&sem,100))fail++;
 if(!add_repeating_timer_us(-1000,repeated,(void*)&sum,&timer))fail++;while(hits<3){}sleep_ms(3);if(hits!=3)fail++;
 if(!add_repeating_timer_ms(5,repeated,(void*)&sum,&timer))fail++;cancel_ok=cancel_repeating_timer(&timer)&&!cancel_repeating_timer(&timer);sleep_ms(8);if(hits!=3)fail++;queue_free(&q);if(q.capacity)fail++;done=1;while(1){}
}