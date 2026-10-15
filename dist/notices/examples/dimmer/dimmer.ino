const uint8_t PWM_PIN = 3;

void setup() {
  pinMode(PWM_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int adc = analogRead(A0);
  int pwm = map(adc, 0, 1023, 0, 255);
  analogWrite(PWM_PIN, pwm);
  Serial.print("ADC=");
  Serial.print(adc);
  Serial.print(" PWM=");
  Serial.println(pwm);
  delay(100);
}
