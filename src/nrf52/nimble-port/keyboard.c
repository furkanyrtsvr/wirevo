#include <cf_hal.h>
#include <string.h>
#include "nimble/nimble_port.h"
#include "host/ble_hs.h"
#include "host/ble_sm.h"
#include "services/gap/ble_svc_gap.h"
#include "services/gatt/ble_svc_gatt.h"
#include "store/ram/ble_store_ram.h"
void wirevo_nimble_poll(void);
static volatile uint32_t*const bridge=(volatile uint32_t*)0x5fffb000;
static int central(void){return bridge[8];}
static void send(unsigned op,const uint8_t*data,unsigned n){while(bridge[1]&0x80000000u){}bridge[4]=(uint32_t)data;bridge[5]=n;bridge[6]=op;while(bridge[1]&0x80000000u){}}
static void ui(unsigned event,unsigned value){uint8_t b[5]={event,value,value>>8,value>>16,value>>24};send(6,b,5);}
volatile unsigned synced,secure,subscribed,leds,reports,pair_code,pair_pending,pair_error,probe_error;
static uint16_t connection=0xffff,input_handle,output_handle,map_handle,service_start,service_end,cccd,input_end;
static uint8_t report[8];
static unsigned desired_notify=1,suspended;
static const uint8_t report_map[]={5,1,9,6,161,1,5,7,25,224,41,231,21,0,37,1,117,1,149,8,129,2,149,1,117,8,129,1,149,5,117,1,5,8,25,1,41,5,145,2,149,1,117,3,145,1,149,6,117,8,21,0,37,101,5,7,25,0,41,101,129,0,192};
static const uint8_t ref_input[]={0,1},ref_output[]={0,2};
static int access_cb(uint16_t conn,uint16_t attr,struct ble_gatt_access_ctxt*ctx,void*arg){(void)conn;(void)attr;unsigned kind=(uintptr_t)arg;const void*data=0;unsigned n=0;static const uint8_t info[]={0x11,1,0,2};
 if(kind==1){data=info;n=sizeof(info);}else if(kind==2){data=report_map;n=sizeof(report_map);}else if(kind==3){data=report;n=8;}else if(kind==4){if(ctx->op==BLE_GATT_ACCESS_OP_WRITE_CHR){uint8_t v;if(OS_MBUF_PKTLEN(ctx->om)!=1||os_mbuf_copydata(ctx->om,0,1,&v))return BLE_ATT_ERR_INVALID_ATTR_VALUE_LEN;leds=v&31;ui(7,leds);return 0;}data=(const void*)&leds;n=1;}else if(kind==5){data=ref_input;n=2;}else if(kind==6){data=ref_output;n=2;}else if(kind==7){uint8_t v;if(OS_MBUF_PKTLEN(ctx->om)!=1||os_mbuf_copydata(ctx->om,0,1,&v)||v>1)return BLE_ATT_ERR_INVALID_ATTR_VALUE_LEN;suspended=!v;return 0;}else return BLE_ATT_ERR_UNLIKELY;
 return os_mbuf_append(ctx->om,data,n)?BLE_ATT_ERR_INSUFFICIENT_RES:0;
}
#define ENC (BLE_GATT_CHR_F_READ_ENC|BLE_GATT_CHR_F_READ_AUTHEN)
static const struct ble_gatt_svc_def services[]={
 {.type=BLE_GATT_SVC_TYPE_PRIMARY,.uuid=BLE_UUID16_DECLARE(0x1812),.characteristics=(struct ble_gatt_chr_def[]){
 {.uuid=BLE_UUID16_DECLARE(0x2a4c),.access_cb=access_cb,.arg=(void*)7,.flags=BLE_GATT_CHR_F_WRITE_NO_RSP|BLE_GATT_CHR_F_WRITE_ENC|BLE_GATT_CHR_F_WRITE_AUTHEN,.min_key_size=16},
 {.uuid=BLE_UUID16_DECLARE(0x2a4a),.access_cb=access_cb,.arg=(void*)1,.flags=BLE_GATT_CHR_F_READ},
 {.uuid=BLE_UUID16_DECLARE(0x2a4b),.access_cb=access_cb,.arg=(void*)2,.flags=BLE_GATT_CHR_F_READ|ENC,.val_handle=&map_handle,.min_key_size=16},
 {.uuid=BLE_UUID16_DECLARE(0x2a4d),.access_cb=access_cb,.arg=(void*)3,.flags=BLE_GATT_CHR_F_READ|ENC|BLE_GATT_CHR_F_NOTIFY,.val_handle=&input_handle,.min_key_size=16,.descriptors=(struct ble_gatt_dsc_def[]){
  {.uuid=BLE_UUID16_DECLARE(0x2908),.att_flags=BLE_ATT_F_READ,.access_cb=access_cb,.arg=(void*)5},{0}}},
 {.uuid=BLE_UUID16_DECLARE(0x2a4d),.access_cb=access_cb,.arg=(void*)4,.flags=BLE_GATT_CHR_F_READ|ENC|BLE_GATT_CHR_F_WRITE|BLE_GATT_CHR_F_WRITE_ENC|BLE_GATT_CHR_F_WRITE_AUTHEN,.val_handle=&output_handle,.min_key_size=16,.descriptors=(struct ble_gatt_dsc_def[]){
  {.uuid=BLE_UUID16_DECLARE(0x2908),.att_flags=BLE_ATT_F_READ,.access_cb=access_cb,.arg=(void*)6},{0}}},{0}}},{0}};
static int gap_cb(struct ble_gap_event*,void*);
static void connect_peer(void){ble_addr_t addr={.type=BLE_ADDR_PUBLIC,.val={1,0,0,0,0,0xc0}};int rc=ble_gap_connect(BLE_OWN_ADDR_PUBLIC,&addr,10000,0,gap_cb,0);if(rc)ui(8,rc);}
static void advertise(void){struct ble_hs_adv_fields fields={0};fields.flags=BLE_HS_ADV_F_DISC_GEN|BLE_HS_ADV_F_BREDR_UNSUP;fields.name=(uint8_t*)"Wirevo BLE Keyboard";fields.name_len=19;fields.name_is_complete=1;assert(!ble_gap_adv_set_fields(&fields));struct ble_gap_adv_params params={0};params.conn_mode=BLE_GAP_CONN_MODE_UND;params.disc_mode=BLE_GAP_DISC_MODE_GEN;assert(!ble_gap_adv_start(BLE_OWN_ADDR_PUBLIC,0,BLE_HS_FOREVER,&params,gap_cb,0));ui(2,1);}
static int subscribed_cb(uint16_t c,const struct ble_gatt_error*error,struct ble_gatt_attr*a,void*arg){(void)c;(void)a;(void)arg;if(!error->status){subscribed=desired_notify;ui(6,subscribed);}else ui(8,error->status);return 0;}
static int descriptor_cb(uint16_t c,const struct ble_gatt_error*e,uint16_t h,const struct ble_gatt_dsc*d,void*arg){(void)h;(void)arg;if(!e->status&&ble_uuid_u16(&d->uuid.u)==0x2902)cccd=d->handle;if(e->status==BLE_HS_EDONE){if(!cccd){ui(8,99);return 0;}uint8_t v[]={1,0};return ble_gattc_write_flat(c,cccd,v,2,subscribed_cb,0);}return 0;}
static uint8_t received_map[128];static unsigned map_length;
static int map_cb(uint16_t c,const struct ble_gatt_error*e,struct ble_gatt_attr*a,void*arg){(void)arg;if(!e->status){unsigned n=OS_MBUF_PKTLEN(a->om);if(a->offset+n>sizeof(received_map))return 1;os_mbuf_copydata(a->om,0,n,received_map+a->offset);map_length=a->offset+n;}else if(e->status==BLE_HS_EDONE){send(10,received_map,map_length);return ble_gattc_disc_all_dscs(c,input_handle,input_end,descriptor_cb,0);}else ui(8,e->status);return 0;}
static int probe_cb(uint16_t c,const struct ble_gatt_error*e,struct ble_gatt_attr*a,void*arg){(void)a;(void)arg;probe_error=e->status;ui(11,probe_error);if(probe_error)return ble_gap_security_initiate(c);return 0;}
static int chr_cb(uint16_t c,const struct ble_gatt_error*e,const struct ble_gatt_chr*chr,void*arg){(void)arg;if(!e->status){if(input_handle&&!input_end&&chr->def_handle>input_handle)input_end=chr->def_handle-1;unsigned uuid=ble_uuid_u16(&chr->uuid.u);if(uuid==0x2a4b)map_handle=chr->val_handle;if(uuid==0x2a4d){if(chr->properties&BLE_GATT_CHR_PROP_NOTIFY)input_handle=chr->val_handle;if(chr->properties&BLE_GATT_CHR_PROP_WRITE)output_handle=chr->val_handle;}}else if(e->status==BLE_HS_EDONE){if(!input_end)input_end=service_end;return ble_gattc_read(c,map_handle,probe_cb,0);}return 0;}
static int service_cb(uint16_t c,const struct ble_gatt_error*e,const struct ble_gatt_svc*s,void*arg){(void)arg;if(!e->status){service_start=s->start_handle;service_end=s->end_handle;}else if(e->status==BLE_HS_EDONE)return ble_gattc_disc_all_chrs(c,service_start,service_end,chr_cb,0);return 0;}
static int gap_cb(struct ble_gap_event*event,void*arg){(void)arg;switch(event->type){
 case BLE_GAP_EVENT_CONNECT:if(event->connect.status){ui(8,event->connect.status);break;}connection=event->connect.conn_handle;ui(3,1);if(central()){input_handle=output_handle=map_handle=input_end=cccd=0;ble_gattc_disc_svc_by_uuid(connection,BLE_UUID16_DECLARE(0x1812),service_cb,0);}break;
 case BLE_GAP_EVENT_DISCONNECT:connection=0xffff;secure=subscribed=pair_pending=0;suspended=0;ui(12,0);ui(3,0);ui(5,0);ui(6,0);if(!central())advertise();break;
 case BLE_GAP_EVENT_PASSKEY_ACTION:pair_code=event->passkey.params.numcmp;pair_pending=1;ui(4,pair_code);ui(12,1);break;
 case BLE_GAP_EVENT_ENC_CHANGE:{struct ble_gap_conn_desc desc;pair_pending=0;ui(12,0);pair_error=event->enc_change.status;if(pair_error){ui(8,pair_error);break;}assert(!ble_gap_conn_find(connection,&desc));secure=desc.sec_state.encrypted&&desc.sec_state.authenticated;ui(5,desc.sec_state.encrypted|(desc.sec_state.authenticated<<1)|(desc.sec_state.bonded<<2));if(central()&&secure){map_length=0;ble_gattc_read_long(connection,map_handle,0,map_cb,0);}break;}
 case BLE_GAP_EVENT_SUBSCRIBE:subscribed=event->subscribe.cur_notify;ui(6,subscribed);break;
 case BLE_GAP_EVENT_NOTIFY_RX:{uint8_t copy[8];if(OS_MBUF_PKTLEN(event->notify_rx.om)==8&&!os_mbuf_copydata(event->notify_rx.om,0,8,copy)){send(9,copy,8);reports++;}break;}
 }return 0;}
static int leds_cb(uint16_t c,const struct ble_gatt_error*e,struct ble_gatt_attr*a,void*arg){(void)c;(void)a;(void)arg;if(e->status)ui(8,e->status);return 0;}
void wirevo_ble_ui_input(unsigned op,unsigned value){if(op==1&&pair_pending){struct ble_sm_io io={.action=BLE_SM_IOACT_NUMCMP,.numcmp_accept=!!value};pair_pending=0;ui(12,0);int rc=ble_sm_inject_io(connection,&io);if(rc)ui(8,rc);}else if(op==2&&central()&&secure){uint8_t v=value&31;ble_gattc_write_flat(connection,output_handle,&v,1,leds_cb,0);}else if(op==3&&central()&&connection==0xffff)connect_peer();else if(op==4&&central()&&secure&&cccd){desired_notify=!!value;uint8_t v[]={desired_notify,0};ble_gattc_write_flat(connection,cccd,v,2,subscribed_cb,0);}}
static void on_sync(void){synced=1;ui(1,1);if(!central())advertise();}
static void on_reset(int reason){ui(8,reason);}
int main(void){nimble_port_init();ble_svc_gap_init();ble_svc_gatt_init();ble_svc_gap_device_name_set("Wirevo BLE Keyboard");ble_hs_cfg.sync_cb=on_sync;ble_hs_cfg.reset_cb=on_reset;ble_hs_cfg.sm_io_cap=BLE_HS_IO_DISPLAY_YESNO;ble_hs_cfg.sm_bonding=1;ble_hs_cfg.sm_mitm=1;ble_hs_cfg.sm_sc=1;ble_hs_cfg.sm_our_key_dist=3;ble_hs_cfg.sm_their_key_dist=3;ble_hs_cfg.store_read_cb=ble_store_ram_read;ble_hs_cfg.store_write_cb=ble_store_ram_write;ble_hs_cfg.store_delete_cb=ble_store_ram_delete;
 if(!central()){assert(!ble_gatts_count_cfg(services));assert(!ble_gatts_add_svcs(services));cf_gpio_mode(KEY_A,CF_INPUT_PULLUP);cf_gpio_mode(KEY_B,CF_INPUT_PULLUP);cf_gpio_mode(KEY_SHIFT,CF_INPUT_PULLUP);cf_gpio_mode(LED_BUILTIN,CF_OUTPUT);}unsigned previous=255;
 while(1){wirevo_nimble_poll();if(!central()){if(secure&&subscribed&&!suspended){unsigned state=(!cf_gpio_read(KEY_A))|((!cf_gpio_read(KEY_B))<<1)|((!cf_gpio_read(KEY_SHIFT))<<2);if(state!=previous){memset(report,0,8);report[0]=(state&4)?2:0;unsigned n=2;if(state&1)report[n++]=4;if(state&2)report[n++]=5;struct os_mbuf*om=ble_hs_mbuf_from_flat(report,8);if(om&&!ble_gatts_notify_custom(connection,input_handle,om)){previous=state;reports++;}}}else previous=255;cf_gpio_write(LED_BUILTIN,((leds&2)!=0)^BOARD_LED_ACTIVE_LOW);}}
}
