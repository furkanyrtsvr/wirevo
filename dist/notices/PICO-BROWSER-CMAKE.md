# Browser CMake profile — v0.94

Select **Projects → Pico C · Tarayıcı CMake / USB** for the working example. Source files compile to ARM or Hazard3 machine code inside the browser. No local compiler is needed for this accepted profile.

Supported additions: function scopes and arguments (ARGC/ARGV/ARGN/ARGVn), set/unset and PARENT_SCOPE, option, list APPEND, if/elseif/else (NOT, AND/OR, DEFINED, STREQUAL and numeric comparisons), foreach IN ITEMS/LISTS, include_guard(GLOBAL), and configure_file(input output [@ONLY|COPYONLY]). Nested-parenthesis conditions, macros, policies, arbitrary generators and shell commands are not supported. Function bodies resolve relative paths at the calling directory in this profile.

Templates may be imported as .h.in. configure_file emits .h or .c under the virtual .wirevo-cmake directory; add ${CMAKE_CURRENT_BINARY_DIR} to target include directories. @VAR@, optionally ${VAR}, #cmakedefine and #cmakedefine01 are supported. Templates stay in project JSON/ZIP; generated files are rebuilt and passed to Clang, never written to the user's computer. Output must stay within the virtual build directory and cannot overwrite project sources.

Selected board values supply PICO_BOARD, PICO_PLATFORM, PICO_RP2040 and PICO_RP2350. pico_enable_stdio_usb(target 1) and pico_enable_stdio_uart(target 0) configure stdio_init_all for the existing polled USB CDC implementation. This does not add a full interrupt-driven TinyUSB implementation or upstream SDK binary compatibility. The example waits for stdio_usb_connected and services tud_task in its loop.

The evaluator has explicit depth/operation/output limits. Unsupported commands fail; they are not silently treated as successful builds. FetchContent, execute_process, general add_custom_command, .pio assembly and all upstream SDK libraries remain outside the browser profile. For those host build operations use [the real local CMake workflow](PICO-SDK-NATIVE.md). Firmware peripheral support still depends on the emulated hardware.

Semantics references: [CMake function](https://cmake.org/cmake/help/latest/command/function.html), [if](https://cmake.org/cmake/help/latest/command/if.html), [configure_file](https://cmake.org/cmake/help/latest/command/configure_file.html).
