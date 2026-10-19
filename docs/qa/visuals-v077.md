# v0.77 new-only verification

- Only `visuals-v077-*.test.mjs` are selected. No previous test file is executed.
- White-card UID, initial block 4 and removal are read through compiled firmware and PN532 I²C on Uno/AVR, ESP32-C3, STM32F103C8 and TM4C123.
- New card/pairing/custom RGB wire colors import on all 30 board profiles; malformed card text is rejected. Card preset memory preserves firmware writes through reset/card swaps within one reader's runtime.
- Compiled Tiva C emits BOOT at first startup and after MCU reset, then continues handling UART. UI reset sends reset followed by run with running execution intent.
- Dark SPST changes its actual finite-resistance DC contact branch; keyboard control state and both SPDT asset variants are checked.
- All 50 regenerated manifest assets retain 385 connector IDs/anchors and display rectangles. SVG dimensions, label sizes/rotation, distinct reader/audio/GPS/CAN features and offline file inclusion are checked.
- Local browser QA: white card present/remove, person/service preset change, editable UID/data fields, PN532 card selection, direct SPST OFF, Tiva DEVICE/DEBUG selection, and board RESET. After RESET the terminal contains BOOT and the status remains “Simülasyon çalışıyor”.
- Static build succeeds within the existing 21 MiB offline shell budget. No budget increase.

Visual research is separately recorded in `visual-references-v077.md`; illustrations are original and preserve simulator connector coordinates, not calibrated manufacturer footprints. Existing non-expansion modules were researched by family where documented, not all redrawn. Physical USB/ICDI and RF/Crypto1 are not introduced.
