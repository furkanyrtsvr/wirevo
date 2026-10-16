# Wirevo 0.60 — identity and TR / EN

CircuitForge Studio is now Wirevo. The header, browser title, favicon, current help and roadmap use the new name. The SVG mark is a mint circuit-shaped W with terminal pads. No raster image or external font dependency.

TR / EN controls are at the top right and in dialog headers. Selection is browser-local (`wirevo.ui.language`), separate from project data. Menus, new-project forms, component library, common inspector labels, window presets and peripheral controls translate without closing the project. English component search matches translated names as well as the Turkish source names. Translation uses curated phrases with longest-match and Unicode word boundaries, observes new UI nodes and restores Turkish captions from per-node source records. Text-only options retain their original submission values.

Source code, serial/build output, circuit labels and pin identifiers are protected from translation. User project names and input values are preserved. Technical model documents, historical release notes and raw compiler/runtime diagnostics may remain in their source languages; this is not a claim that every technical string has been translated. Old project/persistence keys and firmware ABI identifiers are intentionally retained.

Site title and slug: Wirevo / wirevo-furka. The deployment stays on the same Sites project and public audience. Browser storage is origin-bound: projects saved on the old hosted address require JSON/ZIP transfer to the new address. No local storage is deleted or silently migrated.

Validation: npm run build; 51/51 focused tests (i18n, project history, common project JSON/ZIP, genuine STM32 C++ firmware/source linkage, cache/supply). Browser: English persists after reload; TR -> EN inside a populated STM32 new-project draft preserves name, board, language and starter values; English resistor search returns three expected parts. Existing Nucleo F411 MicroPython project remains open with its 27 components / 41 wires. Further browser acceptance is recorded in the handoff.

No STM32 runtime features are added by this release. 0.59 device USB/CAN scope and limitations remain applicable.
