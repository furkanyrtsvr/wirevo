# Wirevo v0.95.0 — official SDK on the Compile button

Pico C/ARM projects can select the installed official SDK through an authenticated loopback helper. Compile sends the source snapshot, streams real CMake/Ninja/Arm GNU output, verifies the returned board/source identity, SHA-256 and UF2, then saves and automatically loads native firmware into the paused simulation. Run starts it. Manual JSON/UF2 transfer is no longer required per build.

The helper is loopback-only with exact allowed Origins/Host checks and an ephemeral bearer token. The connection is scoped to the browser tab and excluded from project exports. It executes trusted user CMake as the local user, not in an OS sandbox. Cancellation kills the owned process tree; timeout, build errors, stale source and corrupt/mismatched output cannot install firmware. A selected executable target maps to real CMake --target. Temporary build directories are checked and removed after use.

The downloadable helper ZIP provides one-time configuration and pairing. A new official SDK example uses real CMake math/configure_file, a separate static library, core-1 GPIO15 and USB stdout `SDK_DERLE095 73`. Projects remember their compiler choice/target; connection secrets do not affect or enter source caching. Existing quick compilation and manual firmware import remain available.

New validation only: six helper HTTP/security/lifecycle cases, four client identity/cancellation/project cases, four actual official SDK board-target builds booted on the native engine and one real compiler-error case, plus browser acceptance of Compile → automatic load → Run. The real builds cover pico, pico2, pico_w and pico2_w, mapping to eight board variants. Old test suites were not run. CI runs only the new transport/helper tests for this release; installed-toolchain integration was verified on the development computer.

This completes the local SDK integration requested for this release. It does not add browser-native upstream CMake, Hazard3 native-UF2 import, SDK DWARF source mapping or original CYW43 firmware/radio emulation. See dist/notices/PICO-SDK-BRIDGE.md.
