# Laboratory / basic Arduino models · 0.19

Original CC0-1.0 SVGs and explicit generic breakout connector layouts; module clones can use other header orders. LM35 TO-92: 1 +Vs, 2 OUT, 3 GND, simple 4–30V / 2–150°C / 10mV per degree. Basic AO drivers finite resistance; no noise/thermal/destruction. MQ-2 Rs/RL electrical divider (not ppm/heater/warmup chemistry); NTC nominal R25/Beta divisor, joystick two 10k pots/contact. Flame/sound level is normalized environment, not audio waveform/dB; DO polarity editable, ideal threshold (not complete LM393 common-mode analog model). Hall boolean magnetic activation (no field/hysteresis curve). PIR H/L cycle hold/inhibit; optional warmup default0, not universal clone startup timing. Capacitive soil AO normalized0.8…0.2 VCC, not calibration.

Generator grounded OUT with50Ω, adjustable wave,0.1…10000Hz, amplitude0…10Vpeak, offset±10V, duty1…99%. Square exact cycle edges; sine/triangle sampled64/period, min10µs; high frequencies lose phase resolution. ADC existing0…5V clamp; no input protection/damage model. Instruments require existing Uno firmware clock to advance; static measurement works before run. V input10MΩ; A shunt0.1Ω with ±10A display overload, no fuse protection. Ω uses separate1V linear passive network, not powered V/I; resistor/pot/LDR/inductorDCR/contacts and meter impedance; capacitor open at DC. Energetic sources→LIVE even0V GPIO; active semiconductor/sensor→ACTIVE; disconnected→OL. No calibrated handheld accuracy, AC RMS, capacitance/diode mode.

HC-SR04 5V module: ≥10µs trigger,8×40kHz burst-derived200µs chosen delay,echo width cm×58µs,2…400cm,≥60ms measurement interval. Missing reflection no echo. No acoustic cones/multipath/temperature/sound-speed or power current. Finite50Ω echo reaches actualGPIO/pulseIn. Servo is generic calibrated mechanism; not guaranteed SG90 endpoints. Default544–2400µs and180° from Arduino Servo library convention; editable min/max/angle. Valid10…30ms frame; actual pin width determines angle; no inertia/load/torque/current simulation. Native digitalWrite/interrupt timing affects measured pulse, as real firmware.

Sources: https://www.ti.com/lit/ds/symlink/lm35.pdf
https://www.winsen-sensor.com/d/files/manual/mq-2.pdf?v=1.0.24
https://www.murata.com/en-us/products/thermistor/ntc/overview/basic/characteristic
https://www.ti.com/lit/ds/symlink/lm393.pdf
https://learn.adafruit.com/pir-passive-infrared-proximity-motion-sensor/testing-a-pir
https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf
https://towerpro.com.tw/product/sg90-7/
https://raw.githubusercontent.com/arduino-libraries/Servo/master/src/Servo.h
