#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include "os/os.h"
#include "nimble/transport.h"
#include "nimble/nimble_port.h"
#include "host/ble_hs.h"
#include "tinycrypt/aes.h"
#include "tinycrypt/ccm_mode.h"
static volatile uint32_t * const hw=(volatile uint32_t*)0x5fffb000;
static struct ble_npl_eventq eventq;
static struct ble_npl_callout *callouts;
static unsigned critical;
void wirevo_assert(const char*f,int line){hw[4]=(uint32_t)f;hw[5]=line;hw[6]=5;while(1){}}
static int command(unsigned op){while(hw[1]&0x80000000u){}hw[6]=op;while(hw[1]&0x80000000u){}return hw[7];}
static void hci_poll(void);
static unsigned encrypted;
static uint8_t link_iv[8];static uint64_t tx_counter,rx_counter;
static struct tc_aes_key_sched_struct session_schedule;
static void nonce(uint8_t*n,uint64_t counter,unsigned direction){for(unsigned i=0;i<5;i++)n[i]=(uint8_t)(counter>>(8*i));n[4]=(n[4]&127)|(direction<<7);memcpy(n+5,link_iv,8);}
__attribute__((weak)) void wirevo_ble_ui_input(unsigned op,unsigned value){(void)op;(void)value;}
static void install_key(uint8_t*b){uint8_t key[16],skd[16],out[16];struct tc_aes_key_sched_struct schedule;for(unsigned i=0;i<16;i++){key[i]=b[15-i];skd[i]=b[31-i];}assert(tc_aes128_set_encrypt_key(&schedule,key));assert(tc_aes_encrypt(out,skd,&schedule));assert(tc_aes128_set_encrypt_key(&session_schedule,out));memcpy(link_iv,b+32,8);tx_counter=rx_counter=0;encrypted=1;}

bool ble_npl_os_started(void){return true;}
void*ble_npl_get_current_task_id(void){return (void*)1;}
void ble_npl_eventq_init(struct ble_npl_eventq*q){q->head=q->tail=0;}
void ble_npl_event_init(struct ble_npl_event*e,ble_npl_event_fn*f,void*a){e->fn=f;e->arg=a;e->queued=0;e->next=0;}
bool ble_npl_event_is_queued(struct ble_npl_event*e){return e->queued;}
void*ble_npl_event_get_arg(struct ble_npl_event*e){return e->arg;}
void ble_npl_event_set_arg(struct ble_npl_event*e,void*a){e->arg=a;}
void ble_npl_eventq_put(struct ble_npl_eventq*q,struct ble_npl_event*e){if(e->queued)return;e->queued=1;e->next=0;if(q->tail)q->tail->next=e;else q->head=e;q->tail=e;}
struct ble_npl_event*ble_npl_eventq_get(struct ble_npl_eventq*q,ble_npl_time_t timeout){(void)timeout;struct ble_npl_event*e=q->head;if(e){q->head=e->next;if(!q->head)q->tail=0;e->queued=0;e->next=0;}return e;}
void ble_npl_eventq_remove(struct ble_npl_eventq*q,struct ble_npl_event*e){struct ble_npl_event*prev=0;for(struct ble_npl_event*x=q->head;x;x=x->next){if(x==e){if(prev)prev->next=x->next;else q->head=x->next;if(q->tail==x)q->tail=prev;x->queued=0;x->next=0;return;}prev=x;}}
bool ble_npl_eventq_is_empty(struct ble_npl_eventq*q){return !q->head;}
void ble_npl_event_run(struct ble_npl_event*e){if(e&&e->fn)e->fn(e);}
ble_npl_error_t ble_npl_mutex_init(struct ble_npl_mutex*m){m->count=0;return 0;}
ble_npl_error_t ble_npl_mutex_pend(struct ble_npl_mutex*m,ble_npl_time_t t){(void)t;m->count++;return 0;}
ble_npl_error_t ble_npl_mutex_release(struct ble_npl_mutex*m){assert(m->count);m->count--;return 0;}
ble_npl_error_t ble_npl_sem_init(struct ble_npl_sem*s,uint16_t n){s->count=n;return 0;}
ble_npl_error_t ble_npl_sem_pend(struct ble_npl_sem*s,ble_npl_time_t t){uint32_t start=hw[9];while(!s->count){hci_poll();if(t!=BLE_NPL_TIME_FOREVER&&(uint32_t)(hw[9]-start)>=t)return BLE_NPL_TIMEOUT;}s->count--;return 0;}
ble_npl_error_t ble_npl_sem_release(struct ble_npl_sem*s){s->count++;return 0;}
uint16_t ble_npl_sem_get_count(struct ble_npl_sem*s){return s->count;}
void ble_npl_callout_init(struct ble_npl_callout*c,struct ble_npl_eventq*q,ble_npl_event_fn*f,void*a){struct ble_npl_callout*x=callouts;while(x&&x!=c)x=x->next;if(!x){c->next=callouts;callouts=c;}c->q=q;c->active=0;ble_npl_event_init(&c->ev,f,a);}
ble_npl_error_t ble_npl_callout_reset(struct ble_npl_callout*c,ble_npl_time_t t){if(c->q)ble_npl_eventq_remove(c->q,&c->ev);c->at=hw[9]+(t?t:1);c->active=1;return 0;}
void ble_npl_callout_stop(struct ble_npl_callout*c){c->active=0;if(c->q)ble_npl_eventq_remove(c->q,&c->ev);}
bool ble_npl_callout_is_active(struct ble_npl_callout*c){return c->active;}
ble_npl_time_t ble_npl_callout_get_ticks(struct ble_npl_callout*c){return c->at;}
ble_npl_time_t ble_npl_callout_remaining_ticks(struct ble_npl_callout*c,ble_npl_time_t n){return c->active&&(int32_t)(c->at-n)>0?c->at-n:0;}
void ble_npl_callout_set_arg(struct ble_npl_callout*c,void*a){c->ev.arg=a;}
ble_npl_time_t ble_npl_time_get(void){return hw[9];}
ble_npl_error_t ble_npl_time_ms_to_ticks(uint32_t n,ble_npl_time_t*out){*out=n;return 0;}
ble_npl_error_t ble_npl_time_ticks_to_ms(ble_npl_time_t n,uint32_t*out){*out=n;return 0;}
ble_npl_time_t ble_npl_time_ms_to_ticks32(uint32_t n){return n;}
uint32_t ble_npl_time_ticks_to_ms32(ble_npl_time_t n){return n;}
void ble_npl_time_delay(ble_npl_time_t n){uint32_t start=hw[9];while((uint32_t)(hw[9]-start)<n)hci_poll();}
uint32_t ble_npl_hw_enter_critical(void){return critical++;}
void ble_npl_hw_exit_critical(uint32_t c){critical=c;}
bool ble_npl_hw_is_in_critical(void){return critical!=0;}
struct ble_npl_eventq*nimble_port_get_dflt_eventq(void){return &eventq;}
extern void os_msys_init(void);extern void os_mempool_module_init(void);
void nimble_port_init(void){ble_npl_eventq_init(&eventq);os_mempool_module_init();os_msys_init();ble_transport_init();command(1);ble_hs_init();}
void wirevo_nimble_poll(void){hci_poll();for(struct ble_npl_callout*c=callouts;c;c=c->next)if(c->active&&(int32_t)(hw[9]-c->at)>=0){c->active=0;if(c->q)ble_npl_eventq_put(c->q,&c->ev);else ble_npl_event_run(&c->ev);}for(unsigned i=0;i<16;i++){struct ble_npl_event*e=ble_npl_eventq_get(&eventq,0);if(!e)break;ble_npl_event_run(e);hci_poll();}}
void nimble_port_run(void){while(1)wirevo_nimble_poll();}
static uint8_t rxbuf[512];
static void hci_poll(void){if(!(hw[1]&1))return;unsigned n=hw[2],kind=hw[3];assert(n<=sizeof(rxbuf));hw[4]=(uint32_t)rxbuf;hw[5]=n;if(command(4))return;if(kind==8){assert(n==40);install_key(rxbuf);return;}if(kind==9){assert(n==2);wirevo_ble_ui_input(rxbuf[0],rxbuf[1]);return;}if(kind==10){encrypted=0;memset(&session_schedule,0,sizeof(session_schedule));memset(link_iv,0,8);tx_counter=rx_counter=0;return;}if(kind==0x82){assert(encrypted&&n>=8);uint8_t out[512],iv[13],aad=2;struct tc_ccm_mode_struct ctx;assert(rx_counter < (1ULL<<39));nonce(iv,rx_counter,hw[8]?1:0);assert(tc_ccm_config(&ctx,&session_schedule,iv,13,4));if(!tc_ccm_decryption_verification(out,sizeof(out),&aad,1,rxbuf+4,n-4,&ctx)){hw[6]=7;return;}rx_counter++;n-=4;memcpy(rxbuf+4,out,n-4);rxbuf[2]=(uint8_t)(n-4);rxbuf[3]=(uint8_t)((n-4)>>8);kind=2;}if(kind==4){void*p=ble_transport_alloc_evt(0);assert(p);memcpy(p,rxbuf,n);ble_transport_to_hs_evt(p);}else if(kind==2){struct os_mbuf*om=ble_transport_alloc_acl_from_ll();assert(om);assert(os_mbuf_append(om,rxbuf,n)==0);ble_transport_to_hs_acl(om);}}
int ble_transport_to_ll_cmd_impl(void*buf){uint8_t*b=buf;hw[4]=(uint32_t)b;hw[5]=b[2]+3;int rc=command(2);ble_transport_free(buf);return rc;}
int ble_transport_to_ll_acl_impl(struct os_mbuf*om){uint8_t packet[512];unsigned n=OS_MBUF_PKTLEN(om);assert(n<=sizeof(packet));assert(os_mbuf_copydata(om,0,n,packet)==0);if(encrypted){uint8_t out[512],iv[13],aad=2;struct tc_ccm_mode_struct ctx;assert(tx_counter < (1ULL<<39));nonce(iv,tx_counter,hw[8]?0:1);assert(tc_ccm_config(&ctx,&session_schedule,iv,13,4));assert(tc_ccm_generation_encryption(out,sizeof(out),&aad,1,packet+4,n-4,&ctx));memcpy(packet+4,out,n);n+=4;packet[2]=(uint8_t)(n-4);packet[3]=(uint8_t)((n-4)>>8);tx_counter++;}hw[4]=(uint32_t)packet;hw[5]=n;int rc=command(encrypted?8:3);os_mbuf_free_chain(om);return rc;}
int ble_transport_to_ll_iso_impl(struct os_mbuf*om){os_mbuf_free_chain(om);return 1;}
void ble_transport_ll_init(void){}
static unsigned char heap[32768] __attribute__((aligned(8)));
struct block{size_t n;struct block*next;unsigned used;};static struct block*blocks;
void*malloc(size_t n){n=(n+7)&~7u;if(!n)n=8;if(!blocks){blocks=(void*)heap;blocks->n=sizeof(heap)-sizeof(struct block);blocks->next=0;blocks->used=0;}for(struct block*b=blocks;b;b=b->next)if(!b->used&&b->n>=n){if(b->n>n+sizeof(struct block)+8){struct block*x=(void*)((char*)(b+1)+n);x->n=b->n-n-sizeof(*x);x->used=0;x->next=b->next;b->next=x;b->n=n;}b->used=1;return b+1;}return 0;}
void free(void*p){if(!p)return;struct block*b=(struct block*)p-1;assert((unsigned char*)b>=heap&&(unsigned char*)b<heap+sizeof(heap));b->used=0;for(b=blocks;b&&b->next;)if(!b->used&&!b->next->used){b->n+=sizeof(*b)+b->next->n;b->next=b->next->next;}else b=b->next;}
void*calloc(size_t n,size_t s){if(n&&s>0xffffffffu/n)return 0;void*p=malloc(n*s);if(p)memset(p,0,n*s);return p;}
void*realloc(void*p,size_t n){if(!p)return malloc(n);if(!n){free(p);return 0;}struct block*b=(struct block*)p-1;if(b->n>=n)return p;void*q=malloc(n);if(q){memcpy(q,p,b->n);free(p);}return q;}
void*memcpy(void*d,const void*s,size_t n){unsigned char*a=d;const unsigned char*b=s;while(n--)*a++=*b++;return d;}
void*memset(void*d,int c,size_t n){unsigned char*a=d;while(n--)*a++=c;return d;}
void*memmove(void*d,const void*s,size_t n){unsigned char*a=d;const unsigned char*b=s;if(a<b)return memcpy(d,s,n);while(n){n--;a[n]=b[n];}return d;}
int memcmp(const void*a,const void*b,size_t n){const unsigned char*x=a,*y=b;while(n--){if(*x!=*y)return *x-*y;x++;y++;}return 0;}
size_t strlen(const char*s){size_t n=0;while(s[n])n++;return n;}
int strcmp(const char*a,const char*b){while(*a&&*a==*b){a++;b++;}return (unsigned char)*a-(unsigned char)*b;}
int strncmp(const char*a,const char*b,size_t n){while(n--){if(*a!=*b)return (unsigned char)*a-(unsigned char)*b;if(!*a)return 0;a++;b++;}return 0;}
char*strcpy(char*d,const char*s){char*p=d;while((*p++=*s++)){}return d;}
char*strncpy(char*d,const char*s,size_t n){size_t i=0;for(;i<n&&s[i];i++)d[i]=s[i];while(i<n)d[i++]=0;return d;}
char*strcat(char*d,const char*s){strcpy(d+strlen(d),s);return d;}
char*strncat(char*d,const char*s,size_t n){char*p=d+strlen(d);while(n--&&*s)*p++=*s++;*p=0;return d;}
char*strchr(const char*s,int c){do{if(*s==(char)c)return (char*)s;}while(*s++);return 0;}
void abort(void){wirevo_assert("abort",0);}
int abs(int n){return n<0?-n:n;}

void __aeabi_memcpy(void*d,const void*s,size_t n){memcpy(d,s,n);}
void __aeabi_memcpy4(void*d,const void*s,size_t n){memcpy(d,s,n);}
void __aeabi_memclr(void*d,size_t n){memset(d,0,n);}
void __aeabi_memclr4(void*d,size_t n){memset(d,0,n);}
void __aeabi_memset(void*d,size_t n,int c){memset(d,c,n);}

#include <stdarg.h>
void __aeabi_memcpy8(void*d,const void*s,size_t n){memcpy(d,s,n);}
void __aeabi_memclr8(void*d,size_t n){memset(d,0,n);}
int vsnprintf(char*out,size_t size,const char*fmt,va_list args){unsigned n=0;
#define EMIT(c) do{if(size&&n<size-1)out[n]=(char)(c);n++;}while(0)
while(*fmt){if(*fmt!='%'){EMIT(*fmt++);continue;}fmt++;char pad=' ';if(*fmt=='0'){pad='0';fmt++;}unsigned width=0;while(*fmt>='0'&&*fmt<='9')width=width*10+*fmt++-'0';char spec=*fmt++;if(spec=='s'){const char*s=va_arg(args,const char*);if(!s)s="(null)";while(*s){EMIT(*s++);}continue;}if(spec=='c'){EMIT(va_arg(args,int));continue;}if(spec=='%'){EMIT('%');continue;}if(spec=='u'||spec=='d'||spec=='x'||spec=='X'||spec=='p'){unsigned v=va_arg(args,unsigned),base=(spec=='x'||spec=='X'||spec=='p')?16:10;char digits[33];unsigned k=0;if(spec=='d'&&(int)v<0){EMIT('-');v=0-v;}do{unsigned d=v%base;digits[k++]=d<10?'0'+d:(spec=='X'?'A':'a')+d-10;v/=base;}while(v);while(width>k){EMIT(pad);width--;}while(k){EMIT(digits[--k]);}continue;}EMIT('?');}if(size)out[n<size?n:size-1]=0;
#undef EMIT
return n;}
int snprintf(char*out,size_t n,const char*fmt,...){va_list a;va_start(a,fmt);int r=vsnprintf(out,n,fmt,a);va_end(a);return r;}
int sprintf(char*out,const char*fmt,...){va_list a;va_start(a,fmt);int r=vsnprintf(out,0xffffffffu,fmt,a);va_end(a);return r;}

int ble_sm_alg_gen_key_pair(uint8_t*pub,uint8_t*priv){uint8_t b[96]={0};hw[4]=(uint32_t)b;hw[5]=96;int rc=command(12);if(rc)return rc;memcpy(pub,b,64);memcpy(priv,b+64,32);memset(b,0,96);return 0;}
int ble_sm_alg_gen_dhkey(const uint8_t*x,const uint8_t*y,const uint8_t*priv,uint8_t*out){uint8_t b[128]={0};memcpy(b,x,32);memcpy(b+32,y,32);memcpy(b+64,priv,32);hw[4]=(uint32_t)b;hw[5]=128;int rc=command(13);if(!rc)memcpy(out,b+96,32);memset(b,0,128);return rc;}
