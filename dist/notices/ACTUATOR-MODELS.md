# CircuitForge 0.21 actuator models

Original CC0 generic modules explicitly label their connector order. Model behavior comes from electrical GPIO and AVR cycle events, not parsing application source or reading command variables.

## WS2812B classic strip

Eight pixels, GRB/MSB first, 24 bits each; ZERO high 0.2…0.5 µs, ONE high 0.75…1.05 µs, LOW >50 µs latches. Instruction quantization remains visible. Invalid high pulses reject a frame; the current decoder accepts interbit LOW gaps below reset without rejecting individual low/total-period violations. It does not claim all newer WS2812 revisions. DOUT is a finite 50 Ω regenerated logic approximation forwarding pulses after 192 consumed bits; a second strip physically connected to DOUT receives the next 192 bits. Propagation delay/line capacitance are not modeled. Payload limit is sixteen strips; other frames are flagged invalid. Raw supply 4.5…5.3 V, shared ground required.

Approximate supply load is a resistor referenced to 5 V: 8 mA idle plus 20 mA×sum(R,G,B)/255 for all eight pixels at 5 V. This is an explicit older LED approximation, not calibrated current/brightness; actual current falls with supply voltage in this resistor approximation. Losing valid supply clears colors. Current is available through the LED VCC probe. No thermal/damage/optical gamma or calibrated LED current regulation. Native example has unrolled inline AVR assembly; byte boundaries are accepted as gaps below reset. [Classic Worldsemi data sheet](https://www.seeedstudio.com/document/pdf/WS2812B%20Datasheet.pdf).

## ULN2003 + 5 V unipolar stepper assembly

Four windings connected internally to VCC and finite Darlington sinks; default winding R=50 Ω, sink0.9 V+1 Ω approximation. At5 V a driven coil is80.39 mA. IN1…4 have a2.7 kΩ resistive input-load approximation (two base-emitter junctions are not separately modeled). Pins IN1…4 require an actual HIGH≥2.5 V; empty/LOW releases the winding sink. VCC4.5…5.5 V and common ground required. Driver COM/clamp common is internally tied to motorVCC in this assembly.

Half-step masks8,12,4,6,2,3,1,9; adjacent state changes ±1, full-step jumps ±2. Other jumps are counted ambiguous, not fabricated motion. The first valid energized phase aligns the model without counting a step. Shaft angle = halfsteps/(64 rotorhalfsteps×editablegearRatio)×360; defaultgear64 is nominal. Unpowered position is retained. No inductance/current-rise/torque/stall/backlash/inertia/clamp transient or thermal model; this is R-only electrical plus kinematic motion. Coil resistance and gear ratio require calibration for the selected real motor. [TI ULN2003A](https://www.ti.com/lit/gpn/ULN2003A), [Joy-IT sequence](https://www.joy-it.net/files/files/Produkte/SBC-Moto1/SBC-Moto1_Manual_2024-05-08.pdf), [supplier motor data](https://www.mouser.com/datasheet/2/758/stepd-01-data-sheet-1143075.pdf).

## L298N dual H bridge

VS motor rail and VSS logic rail are separate exposed inputs; no assumed onboard regulator/enable jumpers. VSS4.5…7 V, VS4.8…46 V. EN<2.3 V releases outputs. IN≤1.5 V LOW / ≥2.3 V HIGH; intermediate inputs release that output as unsupported. EN HIGH plus opposite INs drives opposite rails; equal inputs brake by driving both to the same rail. Each output is an explicit affine approximation: HIGH sourceVS−0.9 V with0.45 Ω, LOW sourceGND+0.8 V with0.45 Ω. It approximates bipolar saturation losses and actual loading; it is not a complete fitted L298 transistor model. Inputs use defined50 kΩ loads and VSS1 kΩ quiescent load.

Output/coil branch currents can be selected in measurement. >2 A output current is diagnosed in the inspector; no automatic limiter is claimed. L2982 A per bridge is a rating, not a built-in regulator. Examples use100 Ω/200 Ω resistive loads and a5 V motor rail so direct UnoADC remains in range. Raising VS needs an external ADC divider. Back-EMF, DC-motor mechanics, external flyback behavior and transistor heating require later models. [ST L298 primary sheet](https://www.st.com/resource/en/datasheet/l298.pdf).
