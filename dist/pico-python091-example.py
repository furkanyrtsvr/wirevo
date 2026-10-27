from machine import Pin, Timer
import rp2, js

@rp2.asm_pio(set_init=rp2.PIO.OUT_LOW)
def led_program():
    wrap_target()
    set(pins, 1)[31]
    set(pins, 0)[31]
    wrap()

sm = rp2.StateMachine(0, led_program, freq=2000, set_base=Pin(15))
sm.active(1)

def report(timer):
    print('Timer / PIO etkin')  # callback runs when Python yields

timer = Timer(-1, period=250, callback=report)
while True:
    await js.cf.sleep(10)
