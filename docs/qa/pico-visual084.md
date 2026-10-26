# Pico photo comparison · v0.84

All eight official product photographs were downloaded from Raspberry Pi's documentation repository. The two official top-down family photographs were also downloaded and visually inspected, covering Pico, H, W, WH, Pico 2, Pico 2 with headers, Pico 2 W and Pico 2 W with headers.

The original vector assets now distinguish bare plated pads from pre-soldered contacts, the SWD pads/connector variants, RP2040 versus RP2350, and the W shield/antenna keepout. USB shell/contacts, four mounting holes, BOOTSEL, LED, regulator, flash and crystal were repositioned and detailed against the photos. In particular, the W MCU and shield sit higher than on the non-wireless layouts. Pin captions have stronger contrast and larger type; the four corner captions avoid mounting holes. No label background boxes or downloaded photo embeds are used.

All existing 85×216 viewBoxes, 40 pin names and 40 pin-centre coordinates per board are unchanged. The drawings are photo-informed approximations, not manufacturing CAD or exact component-placement measurements.

- New targeted test: `node --test tests/pico-visual084.test.mjs` — 8/8 passed.
- All eight new SVGs were raster-rendered and inspected with the official family photos.
- Local references: workspace `references/pico084/`; downloaded source URLs and SHA-256 values: `pico-photo-references084.json`.
- Local comparison artifact: workspace `outputs/pico-photo-comparison084.png`.
- No old tests were run. No runtime, SDK, circuit topology, GitHub or Sites publication was changed by this visual subtask.
