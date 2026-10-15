const uint8_t PUMP_PIN = 7;
const int MOISTURE_THRESHOLD = 35;

void setup() {
  pinMode(PUMP_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int adc = analogRead(A0);
  int moisture = map(adc, 0, 1023, 0, 100);
  bool pump = moisture < MOISTURE_THRESHOLD;
  digitalWrite(PUMP_PIN, pump ? HIGH : LOW);
  Serial.print("NEM=");
  Serial.print(moisture);
  Serial.println(pump ? " POMPA=ON" : " POMPA=OFF");
  delay(200);
}
