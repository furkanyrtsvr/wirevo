#pragma once

typedef unsigned char byte; typedef unsigned short uint16_t; typedef unsigned int uint32_t; typedef signed int int32_t; typedef unsigned long size_t;
#define HIGH 1
#define LOW 0
#define INPUT 0
#define OUTPUT 1
#define INPUT_PULLUP 2
#define DEC 10
#define HEX 16
#define OCT 8
#define BIN 2
#define F(s) (s)
#define lowByte(v) ((byte)((v)&255))
#define highByte(v) ((byte)(((v)>>8)&255))
#define bitRead(v,b) (((v)>>(b))&1)
#define bitSet(v,b) ((v)|=(1UL<<(b)))
#define bitClear(v,b) ((v)&=~(1UL<<(b)))
#define bitWrite(v,b,x) ((x)?bitSet(v,b):bitClear(v,b))
#define CIRCUITFORGE_ESP_CORE 1
inline volatile unsigned &reg(unsigned a){return *(volatile unsigned*)a;}
inline bool validPin(unsigned p){return p==0||p==1||p==2||p==3||p==4||p==5||p==6||p==7||p==8||p==9||p==10||p==11||p==12||p==13||p==15||p==16||p==17||p==18||p==19||p==20||p==21||p==22||p==23;}
inline void pinMode(unsigned p,int mode){if(!validPin(p))return;reg(1611202564+4*p)=(1u<<12)|(1u<<9)|(mode==INPUT_PULLUP?1u<<8:0);reg(1611208020+4*p)=128|(1u<<9);unsigned a=1611206656+ (p<32?32:44),b=1u<<(p%32);reg(a)=mode==OUTPUT?reg(a)|b:reg(a)&~b;}
inline void digitalWrite(unsigned p,int v){if(validPin(p))reg(1611206656+(p<32?(v?8:12):(v?0x14:0x18)))=1u<<(p%32);}
inline int digitalRead(unsigned p){return validPin(p)?int((reg(1611206716+(p<32?0:4))>>(p%32))&1):0;}
inline unsigned cycleCount(){unsigned n;asm volatile("rdcycle %0":"=r"(n));return n;}
struct CFClock {unsigned last,us,ms,sub,rem;};
inline CFClock &clockState(){static CFClock state={0,0,0,0,0};return state;}
inline void pollClock(){CFClock &s=clockState();unsigned n=cycleCount(),d=n-s.last;s.last=n;unsigned rem=d%160+s.rem,u=d/160+rem/160;s.rem=rem%160;s.us+=u;unsigned sub=s.sub+u;s.ms+=sub/1000;s.sub=sub%1000;}
inline unsigned micros(){pollClock();return clockState().us;}
inline unsigned millis(){pollClock();return clockState().ms;}
inline void delayMicroseconds(unsigned us){while(us){unsigned chunk=us>1000?1000:us;unsigned start=cycleCount(),ticks=chunk*160;while((unsigned)(cycleCount()-start)<ticks)asm volatile("nop");pollClock();us-=chunk;}}
inline void delay(unsigned ms){while(ms--)delayMicroseconds(1000);}
template<class T> T min(T a,T b){return a<b?a:b;} template<class T>T max(T a,T b){return a>b?a:b;}
template<class T> T constrain(T x,T a,T b){return x<a?a:x>b?b:x;}
inline long map(long x,long a,long b,long c,long d){return (x-a)*(d-c)/(b-a)+c;}
class CFSerial {public:
void begin(unsigned baud){if(baud)reg(1610612756)=40000000/baud;}
int available(){return reg(1610612764)&1023;}
int read(){return available()?int(reg(1610612736)&255):-1;}
size_t write(byte v){reg(1610612736)=v;return 1;}
size_t write(const byte *s,size_t n){for(size_t i=0;i<n;i++)write(s[i]);return n;}
size_t write(const char *s){size_t n=0;if(s)while(s[n])write((byte)s[n++]);return n;}
void print(const char*s){if(s)while(*s)write(*s++);}
void print(char c){write((byte)c);}
void print(unsigned n,int base=10){if(base<2||base>16)return;char b[32];int i=0;do{unsigned digit=n%(unsigned)base;b[i++]=char(digit<10?'0'+digit:'A'+digit-10);n/=(unsigned)base;}while(n);while(i)write(b[--i]);}
void print(int n,int base=10){if(n<0&&base==10){write('-');print(0u-(unsigned)n,base);}else print((unsigned)n,base);}
void print(long n,int base=10){print((int)n,base);} void print(unsigned long n,int base=10){print((unsigned)n,base);}
void println(){print("\r\n");} void println(const char*s){print(s);println();} void println(char c){print(c);println();} void println(unsigned n,int base=10){print(n,base);println();} void println(int n,int base=10){print(n,base);println();} void println(long n,int base=10){print(n,base);println();} void println(unsigned long n,int base=10){print(n,base);println();}
}; static CFSerial Serial;
extern "C" void *memset(void*,int,size_t); extern "C" void *memcpy(void*,const void*,size_t);
