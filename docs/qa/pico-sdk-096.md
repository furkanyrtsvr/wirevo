# SDK connection acceptance — 2026-10-28

Public origin: https://wirevo-furka.equalwood4.chatgpt.site/

- New client tests: 6 passed (direct timeout/error, pairing validation, exact peer identity, abort/close, blocked popup).
- New helper tests: 3 passed (static CSP/no credentials, same-origin bearer requirement, foreign origin/Host rejection).
- Hosted UI: choose local connection file → Yerel pencereyle bağlan → authenticated helper status.
- Hosted Compile: real official Pico SDK 2.3.1 / CMake / Ninja / Arm GNU, Pico 2 W / pico2_w ARM, 94 native objects linked, returned firmware 28672 bytes.
- Firmware loaded automatically, state Duraklatıldı at t=0. No manual UF2 import.
- Run: USB serial SDK_DERLE095 73, GPIO15-connected LED visibly on.
- Browser console had no error/warning during the accepted flow.

Earlier test suites were not run. Direct background HTTP still times out in the tested in-app browser; the explicit companion-window transport is the validated hosted path. It requires the updated 0.96 helper package and an open companion window. Source debugger and radio/silicon coverage are unchanged.
