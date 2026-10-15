void setup() {
  Serial.begin(115200);
  Serial.println("CircuitForge USART0 ready");
}

void loop() {
  if (Serial.available()) {
    Serial.write(Serial.read());
  }
}
