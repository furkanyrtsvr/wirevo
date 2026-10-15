# 74HC595 / 74HC165

Original CC0 PDIP16 artwork, correct manufacturer pin numbering and 2.54mm pitch. Models powered by actual 2…6V supply/common ground; 5V control on 3.3V HC invalid. No implicit pullups. 50Ω finite output impedance, tristate OE on595; Q7S unaffected. External self/cyclic shift-output supply cannot sustain the chip.

595: SER sampled at SRCLK rise; clear LOW asynchronous shift-only; storage latch at RCLK rise, simultaneous clocks sample old shift. OE LOW enables parallel output.165: PL LOW async parallel load; CLK OR CE rising clocks while PL HIGH, including CE rise with CLK LOW. Cascades sample all chips from the same previous DC solution before output updates. Q7N complementary.

Power-up zero is deterministic convenience; real power-up undefined. No ns propagation/setup/hold/metastability/current-limit/damage model. Floating controls/data do not claim valid transfer. Loaded165 missing inputs retains old word with connected=false.

Primary sources: https://www.ti.com/lit/ds/symlink/sn74hc595.pdf and https://www.ti.com/lit/ds/symlink/sn74hc165.pdf
