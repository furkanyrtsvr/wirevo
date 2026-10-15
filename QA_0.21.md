# QA 0.21 — RGB ve motor modülleri

317test/0hata; nativeGCC WS2476/166, stepper2670/168, L2982922/208byteFlash/staticSRAM. NativeSPIasmGRB→8RGB; yanlışDIN/power/malformedHIGH, iki fizikselşeritDOUTve supplybrownout. Stepper half/full/reverse, actualcoil80.39mA, editablegear32/64, poweroffpositionretained. L298 actualEN/IN→forward/reverse/equalinputbrake/offHi-Z→ADC836/166; disconnectedVSS/ENoff; load-dependent current.

Tarayıcı localhost: WS8renk ve seriGRBframe; stepper5017halfstep440.95°, iki aktifcoil80.4mA; L298 OUT1.815V/OUT2 4.085V, differential−3.27V ve−32.71mA; ADC836→166. parent/CircuitForge-0.21.png.

Model electrical approximation/torque/inductance/currentlimiter limitations notices/ACTUATOR-MODELS.md. TFT asset preparation remains inactive until nextstage.
