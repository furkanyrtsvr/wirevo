# Contact DC model —0.8

Relay artwork Wokwi Docs (MIT CodeMagic LTD2021–2024), commit1b91bec815b31d336cf1122c004ade238a8abec5. SPDT Wokwi Elements (MIT Uri Shaked2020),1.9.2 commit72d8b5b1f472121987d8c74b60a0e7a5d756c54c. Both notices retained here. Pin geometry derives from actual SVG lead tips/screw centres; no manufacturer mechanical calibration claimed.

SPDT common2→1 left /2→3 right. Relay deenergized COM→NC, energized COM→NO; control terminals VCC/GND/IN electrically separate from contacts. Closed path50mΩ, open absent. This coefficient is an explicit DC approximation, not a manufacturer tolerance. Current sign common→selected throw. Coil/transient/bounce/delay/AC/thermal models absent.

Relay nominal5V model: solved VCC-GND≥4.5V; IN relative to solved GND. HIGH(default)=IN-GND≥2.5V, LOW=≤2V. Floating IN, supply or reference forces OFF. DefaultHIGH preserves existing greenhouse files. No Wokwi emulator compatibility claim; upstream relay docs contain contradictory polarity descriptions.

Contact/control iteration max16 passes; unstable feedback rejected. Incompatible ideal sources across closed contacts rejected. Contact voltage/current fed into GPIO/ADC in same AVR cycle. Contact load may use separate voltage, without injecting module5V.

Sources: https://docs.wokwi.com/parts/wokwi-relay-module ; https://docs.wokwi.com/parts/wokwi-slide-switch ; https://github.com/wokwi/wokwi-docs/blob/1b91bec815b31d336cf1122c004ade238a8abec5/docs/parts/wokwi-relay-module.svg
