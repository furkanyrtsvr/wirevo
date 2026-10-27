# Original Pico ROM sources — v0.93.0

Wirevo loads pinned RP2040 B1 and RP2350 A2 ROM data on demand from the public **rp2350js 2.0.1 npm distribution**, through jsDelivr. This distributor is not Raspberry Pi. The download is a numeric array parsed as data; its JavaScript is never executed. SHA-256, byte count and decoded ROM CRC are verified before use. First use needs Internet; verified data is cached locally when the browser permits it. Local ROM file import remains available in the isolated BOOTSEL panel.

* [Pinned RP2040 data](https://cdn.jsdelivr.net/npm/rp2350js@2.0.1/dist/esm/bootroms/bootrom-rp2040-b1.js)
* [Pinned RP2350 data](https://cdn.jsdelivr.net/npm/rp2350js@2.0.1/dist/esm/bootroms/bootrom-rp2350-a2.js)
* [rp2350js source and distribution](https://github.com/wokwi/rp2350js)
* [Raspberry Pi RP2040 boot ROM source and licensing](https://github.com/raspberrypi/pico-bootrom)
* [Raspberry Pi RP2350 boot ROM source and licensing](https://github.com/raspberrypi/pico-bootrom-rp2350)

The application does not bundle the ROM byte images. The ROM sources include component-specific licenses: the RP2040 root BSD license explicitly excludes the floating-point library. That library has its own Mark Owen/Raspberry Pi terms, including a GPLv2 alternative; do not assume the entire ROM is covered by the root BSD text. Refer to the upstream source notices and your distribution's license obligations before redistributing or modifying ROM images. This source notice does not relicense upstream code.

The bundled MicroPython images are separate, unmodified official RP2 firmware, decoded from UF2 to flash bytes. Their exact download addresses and source/flash SHA-256 hashes are in [provenance.json](../pico-native-fw/provenance.json), with component notices in [LICENSES.txt](../pico-native-fw/LICENSES.txt).

RP2040/RP2350 boot ROM availability does **not** supply the CYW43439 wireless chip's internal ROM. Native CYW43 firmware/radio execution remains unavailable. Full TrustZone, OTP, signed secure-boot and cycle-exact silicon equivalence are not claimed.
