export const usbClassHeader=`
#define WIREVO_USB_CDC 0
#define WIREVO_USB_HID 1
#define WIREVO_USB_MSC 2
#define WIREVO_USB_DFU 3
#define WIREVO_USB_MOUSE 4
#define HID_KEY_A 4
#define HID_KEY_B 5
#define HID_KEY_ENTER 40
typedef enum {HID_REPORT_TYPE_INVALID=0,HID_REPORT_TYPE_INPUT=1,HID_REPORT_TYPE_OUTPUT=2,HID_REPORT_TYPE_FEATURE=3} hid_report_type_t;
bool wirevo_usb_set_mode(uint);bool tud_hid_ready(void);bool tud_hid_report(uint8_t,const void*,uint16_t);bool tud_hid_keyboard_report(uint8_t,uint8_t,const uint8_t[6]);bool tud_hid_mouse_report(uint8_t,uint8_t,int8_t,int8_t,int8_t,int8_t);
uint16_t tud_hid_get_report_cb(uint8_t,uint8_t,hid_report_type_t,uint8_t*,uint16_t);void tud_hid_set_report_cb(uint8_t,uint8_t,hid_report_type_t,const uint8_t*,uint16_t);
void tud_msc_capacity_cb(uint8_t,uint32_t*,uint16_t*);bool tud_msc_test_unit_ready_cb(uint8_t);bool tud_msc_is_writable_cb(uint8_t);void tud_msc_inquiry_cb(uint8_t,uint8_t[8],uint8_t[16],uint8_t[4]);int32_t tud_msc_read10_cb(uint8_t,uint32_t,uint32_t,void*,uint32_t);int32_t tud_msc_write10_cb(uint8_t,uint32_t,uint32_t,uint8_t*,uint32_t);void tud_msc_set_sense(uint8_t,uint8_t,uint8_t,uint8_t);
void tud_dfu_download_cb(uint8_t,uint16_t,const uint8_t*,uint16_t);uint16_t tud_dfu_upload_cb(uint8_t,uint16_t,uint8_t*,uint16_t);void tud_dfu_manifest_cb(uint8_t);void tud_dfu_finish_flashing(uint8_t);
`;
export function usbClassRuntimeC(){return`
// Bounded polled device-class subset; protocol traffic still uses USB DPRAM.
static unsigned cf_usb_mode,cf_usb_control_kind,cf_usb_control_value,cf_usb_control_length;
static unsigned char cf_usb_control[256],cf_hid_last[64];static unsigned cf_hid_last_len,cf_hid_idle,cf_hid_protocol=1;
static const unsigned char cf_hid_report_descriptor[]={5,1,9,6,0xa1,1,5,7,0x19,0xe0,0x29,0xe7,0x15,0,0x25,1,0x75,1,0x95,8,0x81,2,0x95,1,0x75,8,0x81,1,0x95,5,0x75,1,5,8,0x19,1,0x29,5,0x91,2,0x95,1,0x75,3,0x91,1,0x95,6,0x75,8,0x15,0,0x25,0x65,5,7,0x19,0,0x29,0x65,0x81,0,0xc0};
static const unsigned char cf_hid_config[]={9,2,34,0,1,1,0,0x80,50,9,4,0,0,1,3,1,1,0,9,0x21,0x11,1,0,1,0x22,sizeof cf_hid_report_descriptor,0,7,5,0x81,3,64,0,10};
static const unsigned char cf_mouse_report_descriptor[]={5,1,9,2,0xa1,1,9,1,0xa1,0,5,9,0x19,1,0x29,8,0x15,0,0x25,1,0x95,8,0x75,1,0x81,2,5,1,9,0x30,9,0x31,9,0x38,0x15,0x81,0x25,0x7f,0x75,8,0x95,3,0x81,6,5,0x0c,0x0a,0x38,2,0x95,1,0x75,8,0x81,6,0xc0,0xc0};
static const unsigned char cf_mouse_config[]={9,2,34,0,1,1,0,0x80,50,9,4,0,0,1,3,1,2,0,9,0x21,0x11,1,0,1,0x22,sizeof cf_mouse_report_descriptor,0,7,5,0x81,3,64,0,10};
static const unsigned char cf_msc_config[]={9,2,32,0,1,1,0,0x80,50,9,4,0,0,2,8,6,0x50,0,7,5,0x81,2,64,0,0,7,5,2,2,64,0,0};
static const unsigned char cf_dfu_config[]={9,2,27,0,1,1,0,0x80,50,9,4,0,0,0,0xfe,1,2,0,9,0x21,7,0xe8,3,0,1,0x10,1};
static unsigned cf_msc_write,cf_msc_lba,cf_msc_blocks,cf_msc_offset,cf_msc_tag,cf_msc_expected,cf_msc_done,cf_msc_fault;
static unsigned char cf_msc_data[512],cf_msc_csw[13],cf_msc_sense[18]={0x70,0,0,0,0,0,0,10};
static unsigned cf_dfu_state=2,cf_dfu_status,cf_dfu_finished,cf_dfu_manifest;
bool wirevo_usb_set_mode(uint mode){if(cf_usb_started||mode>4)return false;cf_usb_mode=mode;return true;}
static const unsigned char*cf_usb_class_descriptor(unsigned type,unsigned*size){if(cf_usb_mode==4){if(type==0x22){*size=sizeof cf_mouse_report_descriptor;return cf_mouse_report_descriptor;}if(type==0x21){*size=9;return cf_mouse_config+18;}if(type==2){*size=sizeof cf_mouse_config;return cf_mouse_config;}}if(type==0x22&&cf_usb_mode==1){*size=sizeof cf_hid_report_descriptor;return cf_hid_report_descriptor;}if(type==0x21&&cf_usb_mode==1){*size=9;return cf_hid_config+18;}if(type==2){if(cf_usb_mode==1){*size=sizeof cf_hid_config;return cf_hid_config;}if(cf_usb_mode==2){*size=sizeof cf_msc_config;return cf_msc_config;}if(cf_usb_mode==3){*size=sizeof cf_dfu_config;return cf_dfu_config;}}return 0;}
static void cf_usb_send(const unsigned char*data,unsigned length){while(length){unsigned n=length>64?64:length;volatile unsigned char*d=(volatile unsigned char*)0x50100180u;for(unsigned i=0;i<n;i++)d[i]=data[i];DPR(0x88)=0x8400u|n;data+=n;length-=n;}}
__attribute__((weak)) uint16_t tud_hid_get_report_cb(uint8_t instance,uint8_t id,hid_report_type_t type,uint8_t*buffer,uint16_t len){(void)instance;if(id||type!=HID_REPORT_TYPE_INPUT)return 0;unsigned n=cf_hid_last_len<len?cf_hid_last_len:len;if(cf_usb_mode==4&&!cf_hid_protocol&&n>3)n=3;memcpy(buffer,cf_hid_last,n);return n;}
__attribute__((weak)) void tud_hid_set_report_cb(uint8_t instance,uint8_t id,hid_report_type_t type,const uint8_t*data,uint16_t len){(void)instance;(void)id;(void)type;(void)data;(void)len;}
bool tud_hid_ready(void){return (cf_usb_mode==1||cf_usb_mode==4)&&cf_usb_mounted;}
bool tud_hid_report(uint8_t id,const void*data,uint16_t len){if(!tud_hid_ready()||id||len!=(cf_usb_mode==1?8:cf_hid_protocol?5:3))return false;cf_hid_last_len=len;memcpy(cf_hid_last,data,len);cf_usb_send(cf_hid_last,len);return true;}
bool tud_hid_keyboard_report(uint8_t id,uint8_t modifier,const uint8_t keys[6]){if(cf_usb_mode!=1)return false;unsigned char data[8]={modifier,0,0,0,0,0,0,0};if(keys)memcpy(data+2,keys,6);return tud_hid_report(id,data,8);}
bool tud_hid_mouse_report(uint8_t id,uint8_t buttons,int8_t x,int8_t y,int8_t wheel,int8_t pan){if(cf_usb_mode!=4)return false;unsigned char data[5]={buttons,(unsigned char)x,(unsigned char)y,(unsigned char)wheel,(unsigned char)pan};return tud_hid_report(id,data,cf_hid_protocol?5:3);}
__attribute__((weak)) void tud_msc_capacity_cb(uint8_t lun,uint32_t*count,uint16_t*size){(void)lun;*count=0;*size=512;}
__attribute__((weak)) bool tud_msc_test_unit_ready_cb(uint8_t lun){(void)lun;return true;}
__attribute__((weak)) bool tud_msc_is_writable_cb(uint8_t lun){(void)lun;return true;}
__attribute__((weak)) void tud_msc_inquiry_cb(uint8_t lun,uint8_t vendor[8],uint8_t product[16],uint8_t revision[4]){(void)lun;memcpy(vendor,"WIREVO  ",8);memcpy(product,"C STORAGE       ",16);memcpy(revision,"0084",4);}
__attribute__((weak)) int32_t tud_msc_read10_cb(uint8_t lun,uint32_t lba,uint32_t off,void*data,uint32_t len){(void)lun;(void)lba;(void)off;(void)data;(void)len;return -1;}
__attribute__((weak)) int32_t tud_msc_write10_cb(uint8_t lun,uint32_t lba,uint32_t off,uint8_t*data,uint32_t len){(void)lun;(void)lba;(void)off;(void)data;(void)len;return -1;}
void tud_msc_set_sense(uint8_t lun,uint8_t key,uint8_t asc,uint8_t ascq){(void)lun;cf_msc_sense[2]=key;cf_msc_sense[12]=asc;cf_msc_sense[13]=ascq;}
static unsigned cf_le32(const unsigned char*p){return p[0]|((unsigned)p[1]<<8)|((unsigned)p[2]<<16)|((unsigned)p[3]<<24);}
static unsigned cf_be32(const unsigned char*p){return ((unsigned)p[0]<<24)|((unsigned)p[1]<<16)|((unsigned)p[2]<<8)|p[3];}
static void cf_putle(unsigned char*p,unsigned v){for(unsigned i=0;i<4;i++)p[i]=v>>(8*i);}
static void cf_putbe(unsigned char*p,unsigned v){for(unsigned i=0;i<4;i++)p[i]=v>>(24-8*i);}
static void cf_msc_status(unsigned status){cf_putle(cf_msc_csw,0x53425355u);cf_putle(cf_msc_csw+4,cf_msc_tag);cf_putle(cf_msc_csw+8,cf_msc_expected-cf_msc_done);cf_msc_csw[12]=status;cf_usb_send(cf_msc_csw,13);cf_msc_write=0;}
static void cf_msc_receive(const unsigned char*p,unsigned len){if(cf_msc_fault)return;if(cf_msc_write){if(len>512-cf_msc_offset){cf_msc_status(2);return;}memcpy(cf_msc_data+cf_msc_offset,p,len);cf_msc_offset+=len;if(cf_msc_offset==512){if(tud_msc_write10_cb(0,cf_msc_lba,0,cf_msc_data,512)!=512){tud_msc_set_sense(0,3,0x0c,0);cf_msc_status(1);return;}cf_msc_done+=512;cf_msc_offset=0;cf_msc_lba++;if(!--cf_msc_blocks)cf_msc_status(0);}return;}
 if(len!=31||cf_le32(p)!=0x43425355u||p[13]||!p[14]||p[14]>16){cf_msc_fault=1;return;}cf_msc_tag=cf_le32(p+4);cf_msc_expected=cf_le32(p+8);cf_msc_done=0;unsigned cmd=p[15],read=!!(p[12]&128),count=0;uint16_t size=0;tud_msc_capacity_cb(0,&count,&size);
 if(cmd==0){if(!count||!tud_msc_test_unit_ready_cb(0)){tud_msc_set_sense(0,2,0x3a,0);cf_msc_status(1);}else cf_msc_status(cf_msc_expected?2:0);return;}
 if(cmd==0x12){if(!read){cf_msc_status(2);return;}memset(cf_msc_data,0,36);cf_msc_data[1]=0x80;cf_msc_data[2]=4;cf_msc_data[3]=2;cf_msc_data[4]=31;tud_msc_inquiry_cb(0,cf_msc_data+8,cf_msc_data+16,cf_msc_data+32);unsigned n=cf_msc_expected<36?cf_msc_expected:36;cf_usb_send(cf_msc_data,n);cf_msc_done=n;cf_msc_status(0);return;}
 if(cmd==3){unsigned n=cf_msc_expected<18?cf_msc_expected:18;if(!read){cf_msc_status(2);return;}cf_usb_send(cf_msc_sense,n);tud_msc_set_sense(0,0,0,0);cf_msc_done=n;cf_msc_status(0);return;}
 if(cmd==0x25){if(!read||cf_msc_expected!=8){cf_msc_status(2);return;}if(!count||size!=512){tud_msc_set_sense(0,2,0x3a,0);cf_msc_status(1);return;}cf_putbe(cf_msc_data,count-1);cf_putbe(cf_msc_data+4,size);cf_usb_send(cf_msc_data,8);cf_msc_done=8;cf_msc_status(0);return;}
 if(cmd==0x28||cmd==0x2a){unsigned lba=cf_be32(p+17),blocks=((unsigned)p[22]<<8)|p[23];if(!count||size!=512||lba>count||blocks>count-lba||blocks>32){tud_msc_set_sense(0,5,0x21,0);cf_msc_status(1);return;}if(read!=(cmd==0x28)||cf_msc_expected!=blocks*512){cf_msc_status(2);return;}if(!blocks){cf_msc_status(0);return;}if(cmd==0x2a){if(!tud_msc_is_writable_cb(0)){tud_msc_set_sense(0,7,0x27,0);cf_msc_status(1);return;}cf_msc_write=1;cf_msc_lba=lba;cf_msc_blocks=blocks;cf_msc_offset=0;return;}for(unsigned i=0;i<blocks;i++){if(tud_msc_read10_cb(0,lba+i,0,cf_msc_data,512)!=512){tud_msc_set_sense(0,3,0x11,0);cf_msc_status(1);return;}cf_usb_send(cf_msc_data,512);cf_msc_done+=512;}cf_msc_status(0);return;}
 if((cmd==0x1b||cmd==0x35)&&!cf_msc_expected){cf_msc_status(0);return;}tud_msc_set_sense(0,5,0x20,0);cf_msc_status(1);
}
__attribute__((weak)) void tud_dfu_download_cb(uint8_t alt,uint16_t block,const uint8_t*data,uint16_t len){(void)alt;(void)block;(void)data;(void)len;tud_dfu_finish_flashing(3);}
__attribute__((weak)) uint16_t tud_dfu_upload_cb(uint8_t alt,uint16_t block,uint8_t*data,uint16_t len){(void)alt;(void)block;(void)data;(void)len;return 0;}
__attribute__((weak)) void tud_dfu_manifest_cb(uint8_t alt){(void)alt;tud_dfu_finish_flashing(0);}
void tud_dfu_finish_flashing(uint8_t status){cf_dfu_finished=1;cf_dfu_status=status;if(status)cf_dfu_state=10;}
static int cf_usb_class_setup(unsigned bm,unsigned req,unsigned value,unsigned len){if((bm&0x60)!=0x20)return 0;
 if(cf_usb_mode==1||cf_usb_mode==4){if(req==1&&(bm&128)){unsigned n=tud_hid_get_report_cb(0,value&255,(hid_report_type_t)(value>>8),cf_usb_control,len>64?64:len);if(n>64)n=64;cf_usb_reply(cf_usb_control,n,len);}else if(req==9&&!(bm&128)&&len<=64){cf_usb_rxpos=0;cf_usb_control_kind=1;cf_usb_control_value=value;cf_usb_control_length=len;if(len)DPR(0x84)=0x400u|len;else cf_usb_reply(cf_usb_control,0,0);}else if(req==10){cf_hid_idle=value>>8;cf_usb_reply(cf_usb_control,0,0);}else if(req==11){cf_hid_protocol=value?1:0;cf_usb_reply(cf_usb_control,0,0);}else if(req==3){cf_usb_control[0]=cf_hid_protocol;cf_usb_reply(cf_usb_control,1,len);}else if(req==2){cf_usb_control[0]=cf_hid_idle;cf_usb_reply(cf_usb_control,1,len);}else cf_usb_reply(cf_usb_control,0,0);return 1;}
 if(cf_usb_mode==2){if(req==0xfe&&(bm&128)){cf_usb_control[0]=0;cf_usb_reply(cf_usb_control,1,len);}else if(req==0xff){cf_msc_fault=cf_msc_write=0;DPR(0x94)=0x400u|64;cf_usb_reply(cf_usb_control,0,0);}else cf_usb_reply(cf_usb_control,0,0);return 1;}
 if(cf_usb_mode==3){if(req==1&&!(bm&128)){if((cf_dfu_state!=2&&cf_dfu_state!=5)||len>256){cf_dfu_status=15;cf_dfu_state=10;cf_usb_reply(cf_usb_control,0,0);}else if(!len){cf_dfu_state=6;cf_dfu_manifest=1;cf_dfu_finished=0;tud_dfu_manifest_cb(0);cf_usb_reply(cf_usb_control,0,0);}else{cf_usb_control_kind=2;cf_usb_control_value=value;cf_usb_control_length=len;cf_usb_rxpos=0;DPR(0x84)=0x400u|(len>64?64:len);}}else if(req==2&&(bm&128)){if((cf_dfu_state!=2&&cf_dfu_state!=9)||len>256){cf_dfu_status=15;cf_dfu_state=10;cf_usb_reply(cf_usb_control,0,0);}else{unsigned n=tud_dfu_upload_cb(0,value,cf_usb_control,len);if(n>len)n=len;cf_dfu_state=n==len&&n?9:2;cf_usb_reply(cf_usb_control,n,len);}}else if(req==3&&(bm&128)){if(cf_dfu_state==3||cf_dfu_state==4)cf_dfu_state=cf_dfu_finished?5:4;else if(cf_dfu_state==6)cf_dfu_state=cf_dfu_finished?7:6;else if(cf_dfu_state==7)cf_dfu_state=2;cf_usb_control[0]=cf_dfu_status;cf_usb_control[1]=cf_usb_control[2]=cf_usb_control[3]=0;cf_usb_control[4]=cf_dfu_state;cf_usb_control[5]=0;cf_usb_reply(cf_usb_control,6,len);}else if(req==5&&(bm&128)){cf_usb_control[0]=cf_dfu_state;cf_usb_reply(cf_usb_control,1,len);}else if(req==4||req==6){cf_dfu_status=0;cf_dfu_state=2;cf_usb_control_kind=0;cf_usb_reply(cf_usb_control,0,0);}else cf_usb_reply(cf_usb_control,0,0);return 1;}return 0;}
static void cf_usb_class_poll(void){if(cf_usb_control_kind&&(DPR(0x84)&0x8000)){unsigned n=DPR(0x84)&1023;if(n>cf_usb_control_length-cf_usb_rxpos)n=cf_usb_control_length-cf_usb_rxpos;volatile unsigned char*s=(volatile unsigned char*)0x50100100u;for(unsigned i=0;i<n;i++)cf_usb_control[cf_usb_rxpos+i]=s[i];cf_usb_rxpos+=n;DPR(0x84)=0;UREG(0x58)=2;if(cf_usb_rxpos<cf_usb_control_length){unsigned left=cf_usb_control_length-cf_usb_rxpos;DPR(0x84)=0x400u|(left>64?64:left);}else{if(cf_usb_control_kind==1)tud_hid_set_report_cb(0,cf_usb_control_value&255,(hid_report_type_t)(cf_usb_control_value>>8),cf_usb_control,cf_usb_control_length);else{cf_dfu_state=3;cf_dfu_finished=0;tud_dfu_download_cb(0,cf_usb_control_value,cf_usb_control,cf_usb_control_length);}cf_usb_control_kind=cf_usb_rxpos=0;cf_usb_reply(cf_usb_control,0,0);}}
 if(cf_usb_mode==2&&(DPR(0x94)&0x8000)){unsigned n=DPR(0x94)&1023;if(n>64)n=64;unsigned char data[64];volatile unsigned char*s=(volatile unsigned char*)0x501001c0u;for(unsigned i=0;i<n;i++)data[i]=s[i];DPR(0x94)=0;UREG(0x58)=1u<<5;cf_msc_receive(data,n);DPR(0x94)=0x400u|64;}}
static void cf_usb_class_reset(void){cf_usb_control_kind=cf_usb_rxpos=cf_msc_fault=cf_msc_write=0;cf_dfu_state=2;cf_dfu_status=0;cf_hid_last_len=0;cf_hid_protocol=1;DPR(0x84)=0;DPR(0x94)=0;}
`;}
