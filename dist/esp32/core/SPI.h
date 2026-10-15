#pragma once
#include "Arduino.h"
#define MSBFIRST 1
#define LSBFIRST 0
#define SPI_MODE0 0
#define SPI_MODE1 1
#define SPI_MODE2 2
#define SPI_MODE3 3
class SPISettings {public:unsigned frequency;byte order,mode;SPISettings(unsigned f=20000,byte o=MSBFIRST,byte m=SPI_MODE0):frequency(f),order(o),mode(m){}};
class CFSPI {unsigned sck=4,miso=6,mosi=5,half=25;bool valid=true;public:
 void begin(int clockPin=4,int inputPin=6,int outputPin=5,int selectPin=-1){sck=clockPin;miso=inputPin;mosi=outputPin;valid=validPin(sck)&&validPin(miso)&&validPin(mosi)&&sck!=miso&&sck!=mosi&&miso!=mosi;digitalWrite(sck,LOW);pinMode(sck,OUTPUT);pinMode(mosi,OUTPUT);pinMode(miso,INPUT);if(selectPin>=0){digitalWrite(selectPin,HIGH);pinMode(selectPin,OUTPUT);}}
 void beginTransaction(SPISettings s){valid=valid&&s.mode==SPI_MODE0&&s.order==MSBFIRST&&s.frequency>=10000&&s.frequency<=20000;if(valid)half=500000/s.frequency;}
 bool validSettings() const {return valid;}
 void endTransaction(){}
 byte transfer(byte value){if(!valid)return 0;byte received=0;for(int i=7;i>=0;i--){digitalWrite(mosi,(value>>i)&1);delayMicroseconds(half);digitalWrite(sck,HIGH);delayMicroseconds(half);received=(received<<1)|digitalRead(miso);digitalWrite(sck,LOW);}return received;}
};inline CFSPI SPI;
