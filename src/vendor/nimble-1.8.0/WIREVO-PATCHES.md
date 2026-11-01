# Apache NimBLE 1.8.0 browser host port

Upstream: https://github.com/apache/mynewt-nimble/tree/nimble_1_8_0_tag
Host, RAM store, GAP/GATT services and TinyCrypt only. Nordic controller / RADIO is not linked.

- Public upstream headers are flattened to the include paths used by the host. Internal `../src/` includes are rooted at `nimble/host/src/` for the WASI filesystem.
- `ble_sm.c`: SC_ONLY validation branch now handles only invalid requests. In upstream 1.8.0 a valid SC-only request entered this branch and never constructed a response. SC-required and 16-byte key checks remain mandatory.
- `ble_sm_alg.c`: software P-256 entry points are renamed. The NPL port implements the same entry points using native WebCrypto P-256 ECDH, with the LE byte ordering required by NimBLE. Actual f4/f5/f6/g2 and AES-CMAC remain C/TinyCrypt. Debug keys are disabled.
- `syscfg/syscfg.h`: fixed single-link, SC-only, MITM profile, no EATT/extended advertising/ISO/controller.
- Freestanding libc headers and `nimble_npl_os.h` implement the bounded single-thread event port, not a general RTOS.
- `src/nrf52/nimble-port/wirevo_npl.c` is Wirevo code. It implements event queues, callouts, memory allocation, SRAM HCI transfer, P-256 bridge and actual C TinyCrypt AES-CCM with counters/MIC. The bridge is not Nordic hardware MMIO.

Rebuild library: `node scripts/nrf52/build-nimble-package.mjs`. All 71 translation units compile with the bundled WASM Clang (no desktop ARM compiler). Rebuild pinned C central and sample: `node scripts/nrf52/build-nimble-host.mjs`. Normal npm build verifies the source fingerprint, reuses the pinned library if unchanged, and rebuilds the central. Source/object hashes are in dist/notices/NIMBLE-SOURCES.json.

LICENSE and NOTICE apply to NimBLE; TINYCRYPT-LICENSE applies to TinyCrypt. Original copyright banners are retained.
