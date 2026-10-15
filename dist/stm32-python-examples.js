export const STM_PY_HELPER=`from machine import Pin, SoftI2C, SoftSPI
i2c = SoftI2C(sda=Pin('PB7'), scl=Pin('PB6'), freq=10000)
spi = SoftSPI(sck=Pin('PA5'), miso=Pin('PA6'), mosi=Pin('PA7'), baudrate=20000)
cs = Pin('PA4', Pin.OUT, value=1)

def crc(a,b):
    n=255
    for byte in (a,b):
        n ^= byte
        for _ in range(8): n=((n<<1)^49 if n&128 else n<<1)&255
    return n

def read_adc():
    data=bytearray(3)
    cs(0)
    spi.write_readinto(bytes([1,128,0]),data)
    cs(1)
    return ((data[1]&3)<<8)|data[2]

def read_sht():
    data=i2c.readfrom(0x44,6)
    if crc(data[0],data[1])!=data[2] or crc(data[3],data[4])!=data[5]: raise ValueError('SHT31 CRC')
    return round(-45+175*((data[0]<<8)|data[1])/65535,2), round(100*((data[3]<<8)|data[4])/65535,2)

def display(adc,alarm):
    i2c.writeto(0x3c,bytes([0,0xae,0x20,0,0x21,0,127,0x22,0,7,0xaf]))
    i2c.writeto(0x3c,bytes([0x40])+bytes([255 if alarm else 24])*32)

def save_record(adc,alarm):
    i2c.writeto_mem(0x50,0,bytes([67,70,adc>>8,adc&255,alarm]),addrsize=16)
`;
export const STM_PY_ENV=`from machine import Pin, ADC
from cf_station import i2c, read_sht, read_adc, display, save_record
import js

led=Pin('PA0',Pin.OUT,value=0)
button=Pin('PA1',Pin.IN,Pin.PULL_UP)
knob=ADC(Pin('PB0'))
print('STM32 MICROPYTHON ENV READY')
while True:
    try:
        i2c.writeto(0x44,bytes([0x24,0]))
        await js.cf.sleep(20)
        temperature,humidity=read_sht()
        adc=read_adc()
        alarm=int(temperature>=30 or button.value()==0)
        led.value(alarm)
        display(adc,alarm)
        save_record(adc,alarm)
        print('PY ENV T=',temperature,'H=',humidity,'ADC=',adc,'NATIVE=',knob.read_u16(),'ALARM=',alarm)
        await js.cf.sleep(10)
    except (OSError,ValueError) as error:
        led.off()
        print('PY SENSOR ERROR',error)
    await js.cf.sleep(100)
`;
