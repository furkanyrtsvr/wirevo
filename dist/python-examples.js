export const PY_SHT31=`from machine import Pin, SoftI2C
import js

i2c = SoftI2C(sda=Pin(4), scl=Pin(5), freq=10000)

def crc(a, b):
    value = 255
    for byte in (a, b):
        value ^= byte
        for _ in range(8):
            value = ((value << 1) ^ 49 if value & 128 else value << 1) & 255
    return value

while True:
    try:
        i2c.writeto(0x44, bytes([0x24, 0]))
        await js.cf.sleep(20)
        data = i2c.readfrom(0x44, 6)
        if crc(data[0], data[1]) != data[2] or crc(data[3], data[4]) != data[5]:
            print("SHT31 CRC ERROR")
        else:
            temp = -45 + 175 * ((data[0] << 8) | data[1]) / 65535
            humidity = 100 * ((data[3] << 8) | data[4]) / 65535
            print("TEMP=", round(temp, 2), "HUM=", round(humidity, 2))
    except OSError:
        print("SHT31 NO ACK")
    await js.cf.sleep(100)
`;
