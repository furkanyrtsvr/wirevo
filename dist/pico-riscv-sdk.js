// Hazard3 machine-mode interrupt adapter; native CSR/trap execution, no boot ROM.
export const riscvIRQRuntimeC=`
#include <hardware/irq.h>
#include <hardware/sync.h>
static irq_handler_t cf_handlers[2][52];static gpio_irq_callback_t cf_gpio_callback[2];
static unsigned cf_csr_bank(unsigned csr,unsigned bank){unsigned v=0;if(csr==0xbe0)__asm__ volatile("csrrs %0, 0xbe0, %1":"=r"(v):"r"(bank));else if(csr==0xbe2)__asm__ volatile("csrrs %0, 0xbe2, %1":"=r"(v):"r"(bank));else __asm__ volatile("csrrs %0, 0xbe3, %1":"=r"(v):"r"(bank));return v;}
static void cf_csr_write(unsigned csr,unsigned v){if(csr==0xbe0)__asm__ volatile("csrw 0xbe0, %0"::"r"(v):"memory");else if(csr==0xbe2)__asm__ volatile("csrw 0xbe2, %0"::"r"(v):"memory");else __asm__ volatile("csrw 0xbe3, %0"::"r"(v):"memory");}
void __attribute__((interrupt("machine"),aligned(4))) cf_riscv_trap(void){unsigned cause,next;__asm__ volatile("csrr %0, mcause":"=r"(cause));if(cause!=0x8000000bu)Default_Handler();__asm__ volatile("csrr %0, 0xbe4":"=r"(next));unsigned n=(next>>2)&511;if(n<52&&cf_handlers[get_core_num()][n])cf_handlers[get_core_num()][n]();else Default_Handler();}
void cf_irq_init(void){__asm__ volatile("csrw mtvec, %0"::"r"(cf_riscv_trap):"memory");for(unsigned i=0;i<52;i++)irq_set_priority(i,128);__asm__ volatile("csrs mie, %0\\ncsrs mstatus, %1"::"r"(2048u),"r"(8u):"memory");}
uint32_t save_and_disable_interrupts(void){unsigned s;__asm__ volatile("csrrc %0, mstatus, %1":"=r"(s):"r"(8u):"memory");return s;}
void restore_interrupts(uint32_t s){if(s&8)__asm__ volatile("csrs mstatus, %0"::"r"(8u):"memory");else __asm__ volatile("csrc mstatus, %0"::"r"(8u):"memory");}
void irq_set_exclusive_handler(uint n,irq_handler_t h){if(n<52&&h)cf_handlers[get_core_num()][n]=h;}
irq_handler_t irq_get_exclusive_handler(uint n){return n<52?cf_handlers[get_core_num()][n]:(irq_handler_t)0;}
void irq_set_enabled(uint n,bool e){if(n<52){unsigned bank=n/16,v=cf_csr_bank(0xbe0,bank),mask=1u<<(16+(n&15));cf_csr_write(0xbe0,(e?v|mask:v&~mask)|bank);}}
bool irq_is_enabled(uint n){return n<52&&!!(cf_csr_bank(0xbe0,n/16)&(1u<<(16+(n&15))));}
void irq_set_pending(uint n){if(n<52)cf_csr_write(0xbe2,cf_csr_bank(0xbe2,n/16)|(1u<<(16+(n&15)))|(n/16));}
void irq_clear(uint n){if(n<52)cf_csr_write(0xbe2,(cf_csr_bank(0xbe2,n/16)&~(1u<<(16+(n&15))))|(n/16));}
void irq_set_priority(uint n,uint8_t p){if(n<52){unsigned bank=n/4,shift=16+(n&3)*4;cf_csr_write(0xbe3,(cf_csr_bank(0xbe3,bank)&~(15u<<shift))|((15u-(p>>4))<<shift)|bank);}}
uint8_t irq_get_priority(uint n){return n<52?(15-((cf_csr_bank(0xbe3,n/4)>>(16+(n&3)*4))&15))<<4:0;}
void irq_remove_handler(uint n,irq_handler_t h){if(n<52&&irq_get_exclusive_handler(n)==h){irq_set_enabled(n,0);cf_handlers[get_core_num()][n]=0;}}
`;
export function installRiscvIRQ(runtime){for(const core of runtime.rp.core){const raw=new Uint8Array(512),set=core.setInterrupt.bind(core),csr=core.setCSR.bind(core),get=core.getCSR.bind(core);let forcing=false;core.setInterrupt=(n,value)=>{if(!forcing)raw[n]=+!!value;set(n,!!(raw[n]||core.meifa[n]));};core.setCSR=(n,v,w)=>{const prior=forcing;forcing=n===0xbe2;try{return csr(n,v,w);}finally{forcing=prior;}};core.getCSR=(n,w)=>{const v=get(n,w);if(n===0xbe4&&!(v>>>31)){const irq=(v>>>2)&511;set(irq,!!(raw[irq]||core.meifa[irq]));}return v;};}}
