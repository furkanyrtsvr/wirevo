# Discrete diode / zener models

Original CC0 axial glass DO35 illustrations, black band at K (right). Bent leads at 4 breadboard pitches; each example occupies distinct breadboard electrical columns.

1N4148: approximate fixed forward0.7V / reverse open. BZX55C5V1: approximate forward0.7V / reverse5.1V. These are bounded piecewise-linear DC approximations, NOT fitted SPICE manufacturer curves. No reverse leakage/capacitance/recovery/temperature/tolerance/dynamic-resistance/damage. Junction voltage0.7V is an approximation, not a datasheet guaranteed forward value.

Actual external series/load resistors determine current; invalid unlimited ideal sources fail, over150mA warns. Signed current A→K; zener breakdown negative. Internal junctions are not LEDs, do not enter LED brightness or summed current. Native Uno ADC receives solved voltages; 12V zener example includes10k/10k divider for safe ADC.50Ω cycle sine generator clipped by diode at0.7V,64 samples/period as documented instrument model.

Primary package/marking/nominal voltage references: https://www.vishay.com/docs/81857/1n4148.pdf and https://www.vishay.com/docs/85604/bzx55.pdf
