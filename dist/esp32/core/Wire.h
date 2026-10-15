#pragma once
#include "Arduino.h"
class CFWire {
 unsigned sda=4,scl=5,half=50; byte tx[128],rx[128];unsigned nt=0,nr=0,pos=0,address=0;bool valid=true,ok=true;
 void low(unsigned p){digitalWrite(p,LOW);pinMode(p,OUTPUT);if(p==scl)delayMicroseconds(half);}
 void release(unsigned p){pinMode(p,INPUT_PULLUP);if(p==scl)delayMicroseconds(half);}
 bool clock(){release(scl);unsigned tries=2000;while(!digitalRead(scl)&&tries--)delayMicroseconds(10);return digitalRead(scl);}
 bool start(){release(sda);if(!clock()||!digitalRead(sda))return false;low(sda);delayMicroseconds(5);low(scl);return true;}
 bool send(byte b){for(int i=7;i>=0;i--){if(b&(1u<<i))release(sda);else low(sda);delayMicroseconds(5);if(!clock()){low(scl);return false;}low(scl);}release(sda);if(!clock())return false;bool ack=!digitalRead(sda);low(scl);return ack;}
 byte receive(bool ack){byte b=0;release(sda);for(int i=0;i<8;i++){if(!clock()){ok=false;break;}b=(b<<1)|digitalRead(sda);low(scl);}if(ack)low(sda);else release(sda);if(!clock())ok=false;low(scl);release(sda);return b;}
 void stop(){low(sda);clock();release(sda);}
public:
 bool begin(int data=4,int clockPin=5,unsigned frequency=10000){sda=data;scl=clockPin;valid=validPin(sda)&&validPin(scl)&&sda!=scl&&frequency>=1000&&frequency<=10000;half=valid?(500000+frequency-1)/frequency:50;if(valid){release(sda);release(scl);}return valid;}
 void setClock(unsigned frequency){valid=validPin(sda)&&validPin(scl)&&sda!=scl&&frequency>=1000&&frequency<=10000;if(valid)half=(500000+frequency-1)/frequency;}
 void beginTransmission(byte a){address=a;nt=0;}
 size_t write(byte b){if(nt>=128)return 0;tx[nt++]=b;return 1;}
 size_t write(const byte*p,size_t n){size_t count=0;while(count<n&&write(p[count]))count++;return count;}
 byte endTransmission(bool sendStop=true){if(!valid||!start()){stop();return 4;}if(!send((byte)(address<<1))){stop();return 2;}for(unsigned i=0;i<nt;i++)if(!send(tx[i])){stop();return 3;}if(sendStop)stop();return 0;}
 unsigned requestFrom(byte a,unsigned count,bool sendStop=true){nr=pos=0;ok=true;if(count>128)count=128;if(!valid||!start()||!send((byte)((a<<1)|1))){stop();return 0;}for(unsigned i=0;i<count;i++){byte b=receive(i+1<count);if(!ok)break;rx[nr++]=b;}if(sendStop)stop();return nr;}
 int available(){return nr-pos;}int read(){return pos<nr?rx[pos++]:-1;}
}; inline CFWire Wire;
