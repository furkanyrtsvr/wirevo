export const PICO_NATIVE_THREAD=String.raw`import _thread
import time
from machine import Pin

led = Pin(15, Pin.OUT)
shared = [0, False]
lock = _thread.allocate_lock()

def second_core():
    for i in range(10):
        with lock:
            shared[0] += 1
        led.toggle()
        time.sleep_ms(5)
    with lock:
        shared[1] = True

print('Ana cekirdek:', _thread.get_ident())
second_id = _thread.start_new_thread(second_core, ())
for i in range(10):
    with lock:
        shared[0] += 1
    time.sleep_ms(5)
while not shared[1]:
    time.sleep_ms(1)
print('Ikinci cekirdek:', second_id, 'ortak sayac:', shared[0])
led.on()
while True:
    time.sleep_ms(20)
`;
