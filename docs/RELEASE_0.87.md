# Wirevo 0.87.0 — native ROM USB boot and flash programming

Two of the three requested areas now have working new paths: RP2350 original-ROM USB boot, and original-ROM flash erase/program on both families. **CYW43 firmware/radio remains unimplemented. This is not full Pico silicon support.**

All eight boards accept their matching user-supplied original ROM: RP2040 B1 (16 KiB, CRC32 bb547a1f), RP2350 A2 (32 KiB, CRC32 8ea874c3). ROM images are not distributed. CRC identifies a tested revision, not a security signature.

New engine behavior in the isolated ROM session:
- RP2350 BXNS/SG register-bank transitions and APSR_nzcvqg writes, permitting A2 NSBOOT to execute original instructions and enumerate USB MSC. This is a boot-profile subset, not complete TrustZone/SAU/MPU/secure-interrupt enforcement.
- RP2040 and RP2350 XIP cache SRAM, required for original ROM UF2 bookkeeping.
- USB abort, buffer-selector reset, cancellation of stale completions and delayed buffer ownership. This fixes native UF2 OUT data being delivered to an old buffer after a transfer reset.
- SSI (RP2040) and QMI (RP2350) serial NOR command/FIFO state: write-enable, status, JEDEC ID, read, sector/block erase and page programming with 1-to-0 NOR semantics. QMI 16-bit FIFO records preserve the ROM's byte order. Timing is synchronous; analog flash latency/cache hazards are not modeled.

UI: Pico connections → Original ROM / BOOTSEL / flash. Select the matching local ROM, select UF2, wait for executed ROM USB/SSI/QMI transfers and byte-for-byte verification, then download the flash binary. Files are prevalidated for complete 256-byte blocks, target family, bounds and duplicate/overlapping records. Original ROM still makes its own acceptance decisions; a successful SCSI response alone is never reported as a successful update.

This session is independent of the project circuit/application runtime. It is paused between operations and retains flash until the dialog closes. One UF2 download per session; export before starting another session. Vendor boot ROM flash updates and RAM downloads are tested; arbitrary application images, signed boot, OTP, partition policies, Hazard3 and all Pico SDK firmware are not claimed. The functional v0.85 project loader remains separate.

CYW43: existing virtual AP/UDP/BLE helpers are unchanged. Internal firmware execution, chip ROM/backplane and radio behavior are absent. Manufacturer documentation describes internal ROM-based Bluetooth execution and downloaded patches; having host-driver firmware files alone does not supply a working emulated chip. A complete vendor-firmware/RF implementation was not achieved in this release.

Validation: only tests/pico-rom087.test.mjs (16 new checks), including all eight original-ROM flash paths, both families' native RAM UF2 transfer, negative/duplicate UF2 cases, register-bank/status behavior, byte-offset inputs and worker verification/export, plus new browser UI checks. Historical tests were not run. The v0.86 assertions that explicitly expected read-only behavior were updated without running that old suite.

Sources:
- https://github.com/raspberrypi/pico-bootrom
- https://github.com/raspberrypi/pico-bootrom-rp2350/releases/tag/A2
- https://github.com/raspberrypi/pico-sdk/blob/master/src/rp2350/hardware_regs/include/hardware/regs/qmi.h
- https://arm-software.github.io/acle/cmse/cmse.html
- https://www.infineon.com/part/CYW43439
