const uint8_t BUTTON_PIN = 2;
const uint8_t LED_PIN = 13;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  bool pressed = digitalRead(BUTTON_PIN) == LOW;
  digitalWrite(LED_PIN, pressed ? HIGH : LOW);
  Serial.println(pressed ? "BUTTON ON" : "BUTTON OFF");
  delay(100);
}
