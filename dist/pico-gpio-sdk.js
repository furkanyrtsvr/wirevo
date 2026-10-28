// Bank-0 GPIO helpers for the 30 GPIO RP2040 / RP2350A Pico packages.
export const gpioSDKHeader=`
#ifndef WIREVO_GPIO104_H
#define WIREVO_GPIO104_H
typedef uint gpio_function_t;
enum gpio_override {GPIO_OVERRIDE_NORMAL=0,GPIO_OVERRIDE_INVERT=1,GPIO_OVERRIDE_LOW=2,GPIO_OVERRIDE_HIGH=3};
enum gpio_slew_rate {GPIO_SLEW_RATE_SLOW=0,GPIO_SLEW_RATE_FAST=1};
enum gpio_drive_strength {GPIO_DRIVE_STRENGTH_2MA=0,GPIO_DRIVE_STRENGTH_4MA=1,GPIO_DRIVE_STRENGTH_8MA=2,GPIO_DRIVE_STRENGTH_12MA=3};
#define GPIO_FUNC_NULL 31
void gpio_init_mask(uint32_t);void gpio_deinit(uint);gpio_function_t gpio_get_function(uint);void gpio_set_function_masked(uint32_t,gpio_function_t);
void gpio_put_all(uint32_t);void gpio_put_masked(uint32_t,uint32_t);void gpio_set_mask(uint32_t);void gpio_clr_mask(uint32_t);void gpio_xor_mask(uint32_t);uint32_t gpio_get_all(void);bool gpio_get_out_level(uint);
void gpio_set_dir_all_bits(uint32_t);void gpio_set_dir_masked(uint32_t,uint32_t);void gpio_set_dir_out_masked(uint32_t);void gpio_set_dir_in_masked(uint32_t);uint gpio_get_dir(uint);bool gpio_is_dir_out(uint);
void gpio_set_pulls(uint,bool,bool);bool gpio_is_pulled_up(uint);bool gpio_is_pulled_down(uint);
void gpio_set_outover(uint,uint);void gpio_set_inover(uint,uint);void gpio_set_oeover(uint,uint);
void gpio_set_input_enabled(uint,bool);void gpio_set_input_hysteresis_enabled(uint,bool);bool gpio_is_input_hysteresis_enabled(uint);
void gpio_set_slew_rate(uint,enum gpio_slew_rate);enum gpio_slew_rate gpio_get_slew_rate(uint);
void gpio_set_drive_strength(uint,enum gpio_drive_strength);enum gpio_drive_strength gpio_get_drive_strength(uint);
#endif
`;
export function gpioSDKRuntimeC(board){const n=board.mcu==='RP2350';return`
#define CF_GPIO_MASK 0x3fffffffu
#define CF_GPIO_OUT 0xd0000010u
#define CF_GPIO_OE ${n?'0xd0000030u':'0xd0000020u'}
#define CF_GPIO_SET ${n?'0xd0000018u':'0xd0000014u'}
#define CF_GPIO_CLR ${n?'0xd0000020u':'0xd0000018u'}
#define CF_GPIO_XOR ${n?'0xd0000028u':'0xd000001cu'}
void gpio_init_mask(uint32_t m){for(uint p=0;p<30;p++)if(m&(1u<<p))gpio_init(p);}
void gpio_deinit(uint p){gpio_set_function(p,GPIO_FUNC_NULL);}
uint gpio_get_function(uint p){return cf_gpio_valid(p)?REG(IO+4+p*8)&31u:GPIO_FUNC_NULL;}
void gpio_set_function_masked(uint32_t m,gpio_function_t f){for(uint p=0;p<30;p++)if(m&(1u<<p))gpio_set_function(p,f);}
void gpio_put_all(uint32_t v){REG(CF_GPIO_OUT)=v&CF_GPIO_MASK;}
void gpio_put_masked(uint32_t m,uint32_t v){REG(CF_GPIO_XOR)=(REG(CF_GPIO_OUT)^v)&m&CF_GPIO_MASK;}
void gpio_set_mask(uint32_t m){REG(CF_GPIO_SET)=m&CF_GPIO_MASK;}
void gpio_clr_mask(uint32_t m){REG(CF_GPIO_CLR)=m&CF_GPIO_MASK;}
void gpio_xor_mask(uint32_t m){REG(CF_GPIO_XOR)=m&CF_GPIO_MASK;}
uint32_t gpio_get_all(void){return REG(0xd0000004u)&CF_GPIO_MASK;}
bool gpio_get_out_level(uint p){return cf_gpio_valid(p)&&!!(REG(CF_GPIO_OUT)&(1u<<p));}
void gpio_set_dir_all_bits(uint32_t v){REG(CF_GPIO_OE)=v&CF_GPIO_MASK;}
void gpio_set_dir_masked(uint32_t m,uint32_t v){REG(CF_GPIO_OE+${n?24:12})=(REG(CF_GPIO_OE)^v)&m&CF_GPIO_MASK;}
void gpio_set_dir_out_masked(uint32_t m){REG(CF_GPIO_OE+${n?8:4})=m&CF_GPIO_MASK;}
void gpio_set_dir_in_masked(uint32_t m){REG(CF_GPIO_OE+${n?16:8})=m&CF_GPIO_MASK;}
uint gpio_get_dir(uint p){return cf_gpio_valid(p)&&!!(REG(CF_GPIO_OE)&(1u<<p));}
bool gpio_is_dir_out(uint p){return gpio_get_dir(p)==GPIO_OUT;}
static void cf_gpio_pad(uint p,uint32_t mask,uint32_t value){if(cf_gpio_valid(p))REG(PADS+4+p*4)=(REG(PADS+4+p*4)&~mask)|value;}
void gpio_set_pulls(uint p,bool u,bool d){cf_gpio_pad(p,12,(u?8u:0)|(d?4u:0));}
bool gpio_is_pulled_up(uint p){return cf_gpio_valid(p)&&!!(REG(PADS+4+p*4)&8u);}
bool gpio_is_pulled_down(uint p){return cf_gpio_valid(p)&&!!(REG(PADS+4+p*4)&4u);}
static void cf_gpio_override(uint p,uint shift,uint v){if(cf_gpio_valid(p)&&v<4)REG(IO+4+p*8)=(REG(IO+4+p*8)&~(3u<<shift))|(v<<shift);}
void gpio_set_outover(uint p,uint v){cf_gpio_override(p,8,v);}
void gpio_set_oeover(uint p,uint v){cf_gpio_override(p,12,v);}
void gpio_set_inover(uint p,uint v){cf_gpio_override(p,16,v);}
void gpio_set_input_enabled(uint p,bool e){cf_gpio_pad(p,64,e?64u:0);}
void gpio_set_input_hysteresis_enabled(uint p,bool e){cf_gpio_pad(p,2,e?2u:0);}
bool gpio_is_input_hysteresis_enabled(uint p){return cf_gpio_valid(p)&&!!(REG(PADS+4+p*4)&2u);}
void gpio_set_slew_rate(uint p,enum gpio_slew_rate v){if(v<2)cf_gpio_pad(p,1,v);}
enum gpio_slew_rate gpio_get_slew_rate(uint p){return cf_gpio_valid(p)?REG(PADS+4+p*4)&1u:0;}
void gpio_set_drive_strength(uint p,enum gpio_drive_strength v){if(v<4)cf_gpio_pad(p,48,(uint)v<<4);}
enum gpio_drive_strength gpio_get_drive_strength(uint p){return cf_gpio_valid(p)?(REG(PADS+4+p*4)>>4)&3u:0;}
`;}
