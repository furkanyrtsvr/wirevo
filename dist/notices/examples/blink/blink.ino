const uint8_t LED_PIN = 13;
const uint16_t INTERVAL = 500;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("D13 HIGH");
  delay(INTERVAL);
  digitalWrite(LED_PIN, LOW);
  Serial.println("D13 LOW");
  delay(INTERVAL);
}
