# Semiconductor drawings and DC model

Original CC0 SVG front-face illustrations represent onsemi P2N2222A (TO-92, C/B/E from left to right) and Infineon IRLZ44N (TO-220, G/D/S; metal tab = drain). Terminal metadata lands exactly on drawn wire endpoints. Their proportions are editor illustrations, not mechanical calibration.

Pin identity sources:
- https://www.onsemi.com/pdf/datasheet/p2n2222a-d.pdf — Case29 Style17, C1/B2/E3.
- https://www.infineon.com/assets/row/public/documents/24/49/infineon-irlz44n-datasheet-en.pdf — TO-220AB lead1 Gate,2 Drain,3 Source,4 Drain tab.

DC coefficients are declared approximations, not fitted manufacturer SPICE data or promised worst-case part performance:
- NPN: VBE0.7V, beta100. Active collector current100×IB. Load-limited saturation VCE0.2V. Base current is solved through the resistor network; emitter current is IB+IC. C/E on the same net bypasses the channel. Reverse C/E operation is rejected; base without current limiting fails. Reverse-active mode, capacitance, Early effect, temperature and breakdown are absent.
- MOSFET: gate has infinite DC impedance. Channel35mΩ at VGS≥4V, open below4V. The 1–4V transition region is explicitly reported as outside the model and treated OFF. Floating gate/source reference is reported and treated OFF. Body diode fixed0.7V from source to drain, including when channel is off; bidirectional on-channel. Gate charge, avalanche, temperature and linear transfer curve are absent.
- Absolute MOS VGS>16V and NPN IC>600mA are reported; thermal damage is not simulated.
- Bounded64 outer passes; outside-scope self-biased operation can fail to converge and does not inject guessed MCU inputs.

The DC solver extends its active-set MNA with diode-current controlled sources and active voltage constraints. Current-control sharing follows the explicitly reported equal-share convention for identical ideal parallel BE diodes. Internal BE/body diodes do not appear as LED currents or displays.

Artwork license: ../assets/SEMICONDUCTOR-LICENSE.txt. Manufacturer names identify the represented parts without endorsement; no manufacturer photos or datasheet artwork are reproduced.

0.12 editor mounting: compact drawings with exposed lead centers at the breadboard pitch. Three leads are mountable; the MOS drain tab remains electrically D but is never inserted into a board hole. Same-strip lead shorts are refused on placement. Dimensions are still illustrative rather than calibrated mechanical dimensions.
