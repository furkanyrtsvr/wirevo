export const OLED_SOURCES={
oled:`#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  pinMode(13, OUTPUT);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    while (true) {}
  }
  display.setTextColor(SSD1306_WHITE);
}

void loop() {
  unsigned long seconds = millis() / 1000;
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("CIRCUITFORGE"));
  display.drawLine(0, 11, 127, 11, SSD1306_WHITE);
  display.setCursor(0, 16);
  display.print(F("UPTIME"));
  display.setTextSize(2);
  display.setCursor(0, 27);
  display.print(seconds);
  display.print(F(" s"));
  display.drawRect(0, 48, 128, 8, SSD1306_WHITE);
  display.fillRect(2, 50, (seconds % 20) * 6, 4, SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 57);
  display.print(F("UNO R3 / I2C 0x3C"));
  display.display();
  digitalWrite(13, seconds % 2 ? HIGH : LOW);
  delay(200);
}
`,
'oled-adc':`#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  pinMode(3, OUTPUT);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    while (true) {}
  }
  display.setTextColor(SSD1306_WHITE);
}

void loop() {
  int adc = analogRead(A0);
  int percent = map(adc, 0, 1023, 0, 100);
  analogWrite(3, map(adc, 0, 1023, 0, 255));
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("ANALOG / A0"));
  display.drawLine(0, 11, 127, 11, SSD1306_WHITE);
  display.setTextSize(2);
  display.setCursor(0, 19);
  display.print(percent);
  display.print(F(" %"));
  display.drawRect(0, 40, 128, 10, SSD1306_WHITE);
  display.fillRect(2, 42, map(adc, 0, 1023, 0, 124), 6, SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 56);
  display.print(F("ADC "));
  display.print(adc);
  display.print(F(" / 1023"));
  display.display();
  delay(100);
}
`,
'i2c-scan':`#include <Wire.h>

void setup() {
  Wire.begin();
  Wire.setClock(100000);
  Serial.begin(115200);
}

void loop() {
  int count = 0;
  Serial.println("I2C scan / A4=SDA A5=SCL");
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    byte error = Wire.endTransmission();
    if (error == 0) {
      Serial.print("ACK 0x");
      if (address < 16) Serial.print('0');
      Serial.println(address, HEX);
      count++;
    }
  }
  Serial.print("Devices: ");
  Serial.println(count);
  delay(1000);
}
`};
