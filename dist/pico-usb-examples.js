export const PICO_USB_EXAMPLES={
 hid:`#include <pico/stdlib.h>
#include <tusb.h>
// Sanal USB klavye. Host raporlarini Pico baglantilari penceresinden izleyin.
void tud_hid_set_report_cb(uint8_t instance, uint8_t id, hid_report_type_t type, const uint8_t *data, uint16_t length) {
    if (length) gpio_put(15, (data[0] & 2) != 0); // Caps Lock -> GP15 LED
}
int main(void) {
    gpio_init(15); gpio_set_dir(15, GPIO_OUT);
    wirevo_usb_set_mode(WIREVO_USB_HID); tud_init(0);
    while (!tud_mounted()) tud_task();
    uint8_t tuslar[6] = {HID_KEY_A,0,0,0,0,0};
    tud_hid_keyboard_report(0, 0, tuslar); // A bas
    tud_hid_keyboard_report(0, 0, 0);      // Birak
    while (1) tud_task();
}
`,mouse:`#include <tusb.h>
int main(void) {
    wirevo_usb_set_mode(WIREVO_USB_MOUSE); tud_init(0);
    while (!tud_mounted()) tud_task();
    tud_hid_mouse_report(0, 0, 20, -10, 1, 0);
    while (1) tud_task();
}
`,msc:`#include <tusb.h>
// Volatil RAM disk. Reset veriyi siler; dosya sistemi otomatik eklenmez.
static uint8_t disk[4096];
void tud_msc_capacity_cb(uint8_t lun, uint32_t *count, uint16_t *size) { *count=8; *size=512; }
int32_t tud_msc_read10_cb(uint8_t lun, uint32_t lba, uint32_t offset, void *buffer, uint32_t count) {
    if (lba>=8 || offset+count>512) return -1;
    uint8_t *out=buffer;
    for (uint32_t i=0;i<count;i++) out[i]=disk[lba*512+offset+i];
    return count;
}
int32_t tud_msc_write10_cb(uint8_t lun, uint32_t lba, uint32_t offset, uint8_t *buffer, uint32_t count) {
    if (lba>=8 || offset+count>512) return -1;
    for (uint32_t i=0;i<count;i++) disk[lba*512+offset+i]=buffer[i];
    return count;
}
int main(void) {
    wirevo_usb_set_mode(WIREVO_USB_MSC); tud_init(0);
    while (1) tud_task();
}
`,dfu:`#include <tusb.h>
// Uygulama DFU ornegi: 512 baytlik RAM staging. BOOTSEL/ROM degildir.
static uint8_t staging[512];
volatile bool hazir;
void tud_dfu_download_cb(uint8_t alt, uint16_t block, const uint8_t *data, uint16_t length) {
    if (block>1 || length>256) { tud_dfu_finish_flashing(8); return; }
    for (unsigned i=0;i<length;i++) staging[block*256+i]=data[i];
    tud_dfu_finish_flashing(0);
}
uint16_t tud_dfu_upload_cb(uint8_t alt, uint16_t block, uint8_t *data, uint16_t length) {
    if (block>1) return 0;
    for (unsigned i=0;i<length;i++) data[i]=staging[block*256+i];
    return length;
}
void tud_dfu_manifest_cb(uint8_t alt) { hazir=true; tud_dfu_finish_flashing(0); }
int main(void) {
    wirevo_usb_set_mode(WIREVO_USB_DFU); tud_init(0);
    while (1) tud_task();
}
`};
