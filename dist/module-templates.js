export const MODULE_SOURCES={
eeprom:`#include <Wire.h>
void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(0x50);
  Wire.write(0); Wire.write(0); // 16-bit memory address
  Wire.write(0x43); Wire.write(0x46); Wire.write(0x31);
  Serial.print("WRITE="); Serial.println(Wire.endTransmission());
  byte busy;
  do { Wire.beginTransmission(0x50); busy=Wire.endTransmission(); } while (busy);
}
void loop() {
  Wire.beginTransmission(0x50);
  Wire.write(0); Wire.write(0);
  Wire.endTransmission(false); // repeated START
  Wire.requestFrom((byte)0x50, (byte)3);
  Serial.print("EEPROM: ");
  while (Wire.available()) Serial.write(Wire.read());
  Serial.println(); delay(1000);
}
`,
rtc:`#include <Wire.h>
byte decimal(byte b) { return (b >> 4) * 10 + (b & 15); }
void setup() {
  Serial.begin(115200); Wire.begin();
  Wire.beginTransmission(0x68); Wire.write(0);
  // BCD: 12:34:58, Saturday, 10 October 2026; CH=0
  const byte clock[] = {0x58,0x34,0x12,7,0x10,0x10,0x26};
  for (byte i=0;i<7;i++) Wire.write(clock[i]);
  Serial.print("RTC SET="); Serial.println(Wire.endTransmission());
}
void loop() {
  Wire.beginTransmission(0x68); Wire.write(0); Wire.endTransmission(false);
  if (Wire.requestFrom((byte)0x68,(byte)7)==7) {
    byte sec=decimal(Wire.read()&0x7f), minute=decimal(Wire.read()), hour=decimal(Wire.read());
    while(Wire.available()) Wire.read();
    Serial.print(hour); Serial.print(':'); Serial.print(minute); Serial.print(':'); Serial.println(sec);
  }
  delay(1000);
}
`,
'i2c-modules':`#include <Wire.h>
void setup() { Serial.begin(115200); Wire.begin(); }
void loop() {
  byte count=0;
  for(byte address=1;address<127;address++) {
    Wire.beginTransmission(address);
    if(Wire.endTransmission()==0) { Serial.print("ACK 0x"); Serial.println(address, HEX); count++; }
  }
  Serial.print("Devices: "); Serial.println(count); delay(1000);
}
`
};
