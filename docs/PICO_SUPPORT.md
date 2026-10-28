# Güncel destek durumu — 0.104

Bu bölüm güncel özettir. Aşağıdaki eski sürüm kayıtları tarihçedir; özellikle 0.93–0.98 yerel SDK uygulaması kaldırılmıştır. Daha önce kaydedilen sınırlar yeni bulunmuş hata gibi değerlendirilmemelidir.

| Alan | Kullanılabilir kapsam | Tamamlanmış sayılmayan kapsam |
|---|---|---|
| Tarayıcı C | Sekiz kartta ARM, dört Pico 2 kartında Hazard3; çok dosya; C/H kaynak paketi; sınırlı CMake değerlendirmesi | Resmi SDK'nın tamamı, gerçek CMake çalıştırma, rastgele native derleme araçları/kütüphaneler |
| GPIO | Temel giriş/çıkış ve kesmeler; 0.104 toplu pin/yön/fonksiyon, override, pad API'leri ve fiziksel OD/ISO çıkış ayırma | Tüm GPIO API'leri, bus keeper, pad analog geçiş/akım/gürültü ve tam IRQ/izolasyon eşdeğerliği |
| PWM / ADC / veri yolları | 0.102 SPI 4–16 bit ve UART FIFO/IRQ; 0.103 PWM bölücü/IRQ/sistem saati ve I2C süre sınırı; mevcut ADC/devre modelleri | Tam donanım FIFO/DMA/slave çerçevesi, her çevrebirim modu ve çevrim doğruluğu |
| PIO / DMA / iki çekirdek | Önceki sürümlerdeki işlevsel motor ve SDK alt kümeleri | SDK'nın tüm API'leri, genel yarış/zamanlama ve birebir silikon eşdeğerliği |
| MicroPython | WASM adaptörü ve ayrı native RP2 firmware profili | Bütün modüller, her donanım API'si, tam ağ ve kaynak debug |
| USB / flash / ROM | Önceki sürümlerdeki sınırlı cihaz/flash ve ROM içe aktarma profilleri | Tam TinyUSB/host/composite, OTP/security, tüm açılış modları |
| CYW43 | Host kayıtçı/taşıma modeli ve ayrı sanal eğitim ağı | Özgün CYW43 CPU/ROM/firmware/radyo yürütümü, gerçek Wi-Fi/Bluetooth/Internet |

Tam Pico SDK ve donanım eşdeğerliği **tamamlanmış değildir**. Son genişleme [0.104 GPIO kapsamı](../dist/notices/PICO-COMPAT104.md); önceki genişleme [0.103 PWM/I2C](../dist/notices/PICO-COMPAT103.md). Kullanıcı için ek uygulama gerekmez. Güncel sürümde yalnız yeni GPIO akışı doğrulanmıştır; eski alanların tümü yeniden test edilmiş sayılmaz.

## 0.103 — PWM / I2C

Kesirli PWM bölücüsü, wrap IRQ ve I2C timeout/deadline desteği genişletildi. [Doğrulanan kapsam](../dist/notices/PICO-COMPAT103.md).

## 0.102 — SPI/UART ve GPIO genişlemesi

SPI 4–16 bit aktarım, UART FIFO/loopback/alım kesmesi ve doğru GPIO pad seçimi eklendi. Yeni örnekler ve sınırlar [burada](../dist/notices/PICO-COMPAT102.md).

## Güncel ek: 0.100 kaynak paketleri

Varsayılan tarayıcı derlemesine ek olarak isteğe bağlı C/H kaynak paketi eklenebilir. Bu tam resmi SDK/CMake değildir; kurulum veya yardımcı uygulama gerektirmez. [Kapsam ve kullanım](../dist/notices/PICO-SOURCE-PACKAGES.md).

# Güncel kullanım — 0.99

Wirevo yardımcı uygulama gerektirmeden tarayıcı derleyicisini kullanır. 0.95–0.98 dönemindeki yerel SDK bağlantısı, Python yardımcıları ve masaüstü pencere paketleri kaldırıldı. JSON/ZIP projeleri ve kaynak dosyaları korunur; eski sdk-local ayarı tarayıcı moduna geçirilir.

Pico C tarafında desteklenen SDK/CMake alt kümesi için [güncel kapsam](../dist/notices/PICO-BROWSER-CMAKE.md), isteğe bağlı hazır firmware için [UF2 içe aktarımı](../dist/notices/PICO-SDK-NATIVE.md) belgelerine bakın. Aşağıdaki kayıtlar tarihsel geliştirme notlarıdır; kaldırılan yerel yardımcıların hâlâ mevcut olduğu anlamına gelmez.

# Pico support record — v0.95.0

This is the current record, replacing assumptions based on accumulated release requests. Earlier release notes describe historical scopes. A future release should update this record rather than repeatedly present known limitations as newly discovered defects.

| Area | Implemented profile | Limits / remaining work |
|---|---|---|
| Boards | Pico, H, W, WH, Pico 2, Pico 2 headers, Pico 2 W, Pico 2 W headers; C17 ARM on all eight; Hazard3 C on four RP2350 boards; MicroPython WASM on all eight | CircuitPython is not executed; native RP2 engine added in v0.93 (see below) |
| Projects/debug | Multiple C/header files, source linking, declarative CMake target/source/include/definition import, address breakpoints, source step-into and scalar RAM/register watches on core 0 | Browser build system is bounded; actual SDK/CMake desktop build/import added in v0.93. Call stack, expression evaluation, step-over/out, core 1 source debugger; MicroPython source debugger |
| GPIO/IRQ | Electrical circuit GPIO; per-core GPIO interrupts; exclusive NVIC or Hazard3 CSR handlers; pending/priority; both native cores | Shared handler chains, raw-handler SDK surface, nested IRQ and timing coverage beyond the newly checked profile; GPIO interrupt register adapter handles word accesses |
| New C SDK helpers | Absolute time; core-0 alarm callbacks/cancellation; SIO spinlocks, critical sections, mutexes, deadline mutex entry, semaphores, fixed-element queues, repeating timers | 16 alarm slots, core 0 only, minimum 32 us rearm service margin; delay at most 2^31-1 us; no alarm pools or shared handler chains; queues have at most 1024 payload bytes per queue; semaphores/default queues share SIO spinlock 15; lock claim pool 16–30, resource guard 31 |
| MicroPython | Genuine WASM interpreter; circuit-backed Pin/ADC/PWM/mem; GPIO I2C/SPI; terminal UART; cooperative GPIO/PIO IRQ; virtual Timer, ticks, IRQ mask, PWM duty_ns, UART readline, rp2.asm_pio/StateMachine/DMA; W LED and virtual WLAN | This WASM profile is an adapter. Separate native RP2 firmware and real _thread added in v0.93; no _thread in WASM or PIO management class, sockets/real network or USB classes. PIO assembler covers eight instruction groups, labels, wrap, delay and sideset; one native SM API per ID (8 on RP2040, 12 on RP2350), 32 instruction slots per PIO unit with shared program reuse. No program unloading/compaction, special RP2350 GPIO-bank or PIO-v1 instruction profile. FIFO blocking has a 10000 us simulated wait limit. UART is terminal-only; explicit TX/RX pins rejected. GPIO buses have approximate timing. IRQ callbacks are drained at Pin/time calls; hard IRQ rejected. Timer/PIO callbacks are cooperative too; overdue periodic timer callbacks coalesce at a polling boundary. Timer periods: 1 us..10 s. unique_id is a stable simulated board-profile identity, not a physical chip ID. Interactive infinite programs must yield with await js.cf.sleep(ms), as the starters do. |
| ADC | External GP26–28 circuit voltages; configured temperature and VSYS/3; FIFO, continuous conversion, round-robin, IRQ helpers | Analog noise, full electrical power/thermal model and complete silicon timing; shared CYW43 pin must be released for VSYS |
| DMA | Native SRAM/PIO DREQ, ring addresses, byte swap, channel IRQ and abort SDK helpers | Complete SDK, sniffer/timer/reverse-increment acceptance coverage; new C acceptance tests cover IRQ0 and the ring/byte-swap/abort profile |
| PIO/multicore | Native state machines, instruction arrays, FIFO/DREQ, two cores, SIO FIFO, per-core vectors | Automatic .pio assembler, full SDK API, general scheduling/race/cycle equivalence |
| Peripheral buses | Existing UART, ADC, PWM; source-compatible I2C/SPI GPIO masters and external device models | Full hardware/DMA SDK adapters, every framing/clock mode, UART1 external-device adapter |
| USB | Bounded polled CDC/HID/MSC/DFU device profiles | Full TinyUSB, composite devices and general USB host |
| Flash/BOOTSEL | Existing project flash service; original RP2040 B1/RP2350 A2 ROM download/import, isolated BOOTSEL writes, native RP2 and ARM SDK normal boot on the circuit | Full partition/security behavior, OTP, secure boot; isolated BOOTSEL panel is separate from native circuit mode; Hazard3 ROM/UF2 boot is deferred |
| CYW43439 host chip | GPIO gSPI, test/status/interrupt registers, RAM/windows, LED/supply GPIO state, VBUS input, reset wrappers and SRAM PDA registers | Full transport modes/timing, all peripheral registers, OTP, ARMCM3 execution; F2 frames remain pending without firmware |
| CYW43439 firmware/radio | Separate virtual AP, bounded UDP echo and BLE UART teaching services | Original WLAN ROM, native chip firmware, 802.11 MAC/PHY, Bluetooth baseband, lwIP/BTstack and Internet connectivity |
| Other silicon | Existing pinned native engine behavior | Full clocks/power/reset/watchdog/RTC/security/TrustZone, CPU instruction and cycle fidelity have not been exhaustively implemented/validated |

Historical v0.89 status (the v0.93 native additions below supersede ROM deferral): Other items in the right column are also unfinished; obtaining a ROM does not complete them. They are not hidden or claimed complete. New acceptance work in v0.89 covers 15 checks; prior checks were deliberately not rerun at the user's request. The downloadable C hardware example is validated on all eight boards, and new CYW43 control-register behavior is validated on the four wireless boards.

New v0.90 checks: 22, covering all eight MicroPython profiles and all twelve C architecture/board combinations. Only new checks were run. Hazard3 executes actual machine code/CSR interrupts with both cores; its direct vector startup is a Wirevo project format, not the original RP2350 ROM boot sequence. The existing native engine does not imply complete instruction/cycle fidelity. Existing right-column limitations remain recorded here; they are not newly discovered claims or silently completed by this release.

New v0.91 checks only: 20 board/architecture cases, exercising the added queue/semaphore/deadline/repeating timer APIs on 12 C profiles and genuine Python Timer/PIO/FIFO/IRQ/LED/ticks/UART/PWM on eight boards. Full upstream SDK/CMake integration, arbitrary libraries and the native RP2 MicroPython port are still not implemented. This release does not rename those limitations as completed work.

## v0.92 additions and unresolved request

CMakeLists.txt/.cmake files can now be edited, imported and saved with Pico C projects. A strict declarative importer resolves one executable, local STATIC/INTERFACE targets, target_sources, add_subdirectory/include, simple set variables, include directories, compile definitions with visibility, and supported Wirevo SDK target names. It selects only linked C sources, with per-unit flags. It does not run CMake, arbitrary scripts, FetchContent, generators, configure_file, functions/conditionals, host commands or upstream SDK builds. Unsupported commands fail with file/line diagnostics. Linked C library sources are flattened into object inputs, not a general archive/link-order implementation. The supplied SDK import helper is for external CMake with an installed upstream SDK; browser compilation uses Wirevo SDK adapters. Full SDK/CMake remains unfinished.

Python rp2.DMA now claims native channels, drives DMA registers/bus/DREQ, supports native SRAM/peripheral addresses, Python buffer staging, StateMachine FIFOs and DMA register slices, pack/unpack control, active/abort/close, counts and cooperative IRQ. Python buffers are mirrored into native-chip SRAM (0x20004000 to SRAM end minus 4096 bytes), aligned to 256 bytes, retained until close; changes copy back at completion/abort/cooperative polls. Buffers: maximum 65536 bytes each, bounded by available SRAM; these are not zero-copy RP2 pointers. Staged buffer rings are limited to 256 bytes. Reconfiguration requires an idle channel. Sniffer, DMATimer class, native hard Python IRQ, arbitrary WASM pointers from uctypes.addressof and RP2350 special transfer modes are not implemented. Zero-count active starts are rejected.

_thread is still absent: the shipped genuine MicroPython WASM runtime rejects import _thread. Adding a Python facade would not implement shared-interpreter preemptive execution. A new interpreter/thread backend is required; no sequential fake is presented as multicore support. This is not a ROM-dependent limitation. ROM work remains deferred.

New validation only: 21 cases (12 C board/architecture executions, one CMake file/ZIP/unsupported-command case and eight genuine MicroPython DMA/circuit profiles). Old suites were not rerun.


## v0.93 current native profile

Original RP2040 B1 / RP2350 A2 ROM can be fetched on demand from pinned external data, verified with SHA-256, size and CRC, with local-file fallback for BOOTSEL sessions. Images are not bundled; see dist/notices/PICO-ROM-SOURCES.md for distribution/component license distinctions. This does not supply CYW43439 internal ROM.

The new rp2-native Python option runs unmodified official MicroPython 1.29.0 ARM firmware. _thread executes on the real emulated second CPU; shared Python objects, native locks, module imports/files and normal time.sleep run inside the upstream interpreter. The existing WASM adapter remains a separate profile. All eight board choices use generic RPI_PICO or RPI_PICO2 CPU firmware; wireless is not initialized. Standard machine/rp2 use native chip peripherals, with compatibility limited by the chip model; every upstream peripheral API and hard IRQ behavior has not been accepted. No source Python debugger or full cycle-equivalence claim.

SDK/CMake: the new desktop build tool invokes real CMake and installed official Pico SDK/Arm GNU/Ninja, preserving user CMake scripts, generated files and linked sources. Imported ARM UF2 boots through original ROM/SDK boot2/picobin, drives electrical GPIO from both cores and uses native USB CDC. Native SDK imports lack a source DWARF debug map. The browser quick compiler still has its previous declarative subset. See dist/notices/PICO-SDK-NATIVE.md. Real CMake capability does not mean all SDK peripherals work in the chip model.

Current limits remain explicit: CYW43 internal ROM/firmware/radio, full physical/cycle equivalence, OTP/secure signed boot, arbitrary SDK peripheral completeness. These are not silently completed or reclassified as new defects.


## v0.94 current browser additions

The quick browser path now supports bounded function scopes/arguments/PARENT_SCOPE, if/elseif/else with accepted logical/numeric/string predicates, foreach, options, list APPEND, GLOBAL include guards and configure_file with .h.in inputs. Generated C/header files reach Clang WASM, and CMake stdio switches enable USB CDC/disable UART. The new Projects example is available on all eight boards and twelve C architecture profiles. Full upstream CMake/SDK, general generators/FetchContent/host processes and all peripheral libraries remain unsupported in the browser. See dist/notices/PICO-BROWSER-CMAKE.md for exact bounds.

CYW43439 ROM data import: local 640 KiB user image at 0x00800000, immutable through gSPI/backplane, CRC32 metadata, power/reset persistence within the session. Bytes are not bundled, server-uploaded or stored in project JSON. Native SDK/W firmware and native MicroPython generic CPU sessions do not gain a CYW43 CPU. The chip execution/radio flags stay false even with a ROM image. New acceptance uses synthetic data to check memory/bus behavior; it does not validate original ROM execution.

The latest request is therefore only partly fulfilled: original CYW43 ROM/firmware/radio and complete upstream browser SDK/CMake still require work. This release does not label ROM-data access or bounded CMake evaluation as those completed features. Only 20 newly added cases were run; old suites were not run.


## v0.95 official SDK button integration

The accepted local SDK workflow is integrated with Compile: authenticated loopback helper → installed official CMake/Ninja/Arm GNU/SDK → streamed build log → board/source/SHA/UF2 verification → automatic paused native firmware load. Run starts the resulting firmware. Sources/targets remain in project JSON/ZIP; machine connection credentials remain tab-local. No per-build manual source export or firmware import is needed. A new official SDK starter uses math/configure_file, a static C library, core-1 LED and USB stdout.

The helper runs trusted project CMake as the user's OS account, binds only loopback and enforces Origin/Host/bearer authentication. Cancellation, timeouts, errors and stale/corrupt results cannot install a new artifact. Eight board profiles map to four official SDK board targets; all four targets were newly compiled and run. Native load remains ARM-only with no SDK source DWARF map. The quick browser compiler remains its bounded profile; original CYW43 execution/radio is unchanged.

New checks: 6 helper protocol/lifecycle, 4 client/project, 4 actual official SDK target builds plus 1 compiler error; browser Compile → paused load → Run and cancellation acceptance. Old test files were not run. Exact setup: dist/notices/PICO-SDK-BRIDGE.md.


## v0.96 hosted SDK connection

The hosted page can pair through an explicitly opened local companion window. Exact peer origin/window/nonce checks, fixed SDK routes and bearer authentication protect the relay; it is not a generic proxy. The window performs same-origin loopback requests and returns SDK progress/artifacts to the hosted page. Direct HTTP is optional with actionable timeouts. Closing/blocked windows require re-pairing. No network security configuration changes.

New checks only: six client/handshake/lifecycle and three local static/auth/origin cases. Hosted Pico 2 W acceptance: real CMake/Arm GNU compile, automatic paused load of 28672 bytes, Run, USB output SDK_DERLE095 73 and a visibly lit GPIO15 LED. Earlier test suites were not executed.
