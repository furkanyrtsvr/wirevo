# Wirevo 0.85.0

Pico functional flash update, all eight ARM board profiles.

- Native C `hardware/flash.h`: sector erase (4096 bytes), page program (256 bytes), bounds/alignment checks and 1-to-0 programming. Both engine flash and persistent session backing bytes change; MCU reset preserves them.
- `pico/bootrom.h`: `reset_usb_boot` enters a functional BOOTSEL state and stops instruction execution. It does not execute vendor ROM. The UI can also enter BOOTSEL after starting firmware.
- Pico connections: export compiled firmware to UF2, enter BOOTSEL, select UF2, validate complete file before writing, reset to the new code, then Run. Imported firmware is saved in the project; obsolete source debug metadata is removed.
- UF2 supports 256-byte pages, family IDs RP2040 / RP2350 Arm Secure, blocks in arbitrary order. Wrong family, unsupported flags, missing/duplicate/overlapping blocks, invalid vectors and out-of-range writes are rejected without modifying flash. Only affected sectors are erased.

Limits: this is a functional Wirevo loader, not the physical USB mass-storage ROM, boot2, RP2350 picobin/partition/security loader, or a universal Pico SDK UF2 runner. Images must begin with a directly executable ARM vector table at 0x10000000. Exported files are simulation images, not promised hardware firmware. Flash erase/program timing, XIP stall/cache hazards and flash-safe multicore lockout are not modeled. User data persists across resets in the current runtime, not across recompilation, project reload or page reload. The project stores the imported firmware, not a complete mutable flash snapshot.

CYW43 is unchanged: no CYW43 firmware CPU/backplane/RF model exists. Virtual AP/UDP/BLE helpers do not implement the vendor firmware, RF, lwIP or BTstack. Full Pico/silicon completion is explicitly not claimed.

Validation: only `tests/pico-flash085.test.mjs`, 24 new checks across eight boards. No historical test suite. New UI BOOTSEL interaction verified in local preview.

References:
- https://www.raspberrypi.com/documentation/pico-sdk/hardware.html#flash_range_erase
- https://github.com/microsoft/uf2/blob/master/README.md
- https://github.com/microsoft/uf2/blob/master/utils/uf2families.json
