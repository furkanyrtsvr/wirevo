# Wirevo 0.86.0 — RP2040 original ROM inspection

This release does **not** complete Pico, CYW43 firmware/RF emulation, or general original-ROM flash boot/update.

New: Pico connections → Original ROM read-only inspection. A user-selected RP2040 B1 16 KiB ROM executes original machine instructions in an isolated worker. Supported targets: Pico, Pico H, Pico W and Pico WH. The ROM is identified by size and CRC32 bb547a1f; no ROM binary is distributed with the site. CRC identifies the supported revision; it is not a security signature.

Engine fixes in this isolated profile:
- VREG/CHIP_RESET power-on flags and writable/atomic flag handling, preventing the ROM's initial reset loop.
- USB narrow writes to buffer 1, double-buffer ownership/completion queue, correct buffer-selector status and bounded FIFO backpressure.
- Native ROM USB enumeration, INQUIRY, READ CAPACITY and repeated READ10 including original RPI-RP2 MBR/FAT sectors. Data comes from executed ROM, not a synthesized filesystem.

The application simulator, project circuit and mutable flash remain separate. The profile rejects writes; firmware update is still the functional v0.85 loader. RP2350's Secure/Non-secure transitions and original boot path remain unsupported. The attempted native ROM write returned successful SCSI status but did not change flash bytes; that unverified path was excluded. CYW43 has no internal firmware CPU/backplane/RF model and remains a virtual network helper only.

Validation: only six new checks in tests/pico-rom086.test.mjs, plus the new ROM UI interaction. No prior test suite. ROM tests use the pinned dependency's B1 image as a local fixture, not a shipped site asset.

Original source: https://github.com/raspberrypi/pico-bootrom/tree/00a4a19114195e20fb817bdfbca1165e157eef37
The repository's LICENSE.TXT excludes mufplib.S/mufplib-double.S, which have separate terms. This release does not redistribute those ROM bytes.
