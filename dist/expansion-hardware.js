// Original generic assemblies; connector illustration units are 9.6 per 2.54mm.
// These are functional simulator profiles, not manufacturer PCB footprints.
const row=(ids,y,w)=>ids.map((id,i)=>({id,name:id,x:w/2+(i-(ids.length-1)/2)*9.6,y,side:'bottom'}));
const module=(name,pins,kind='module',detail='',options={})=>{const width=Math.max(104,Math.ceil(pins.length*9.6+20)),height=104;return{name,pins:row(pins,height-8,width),width,height,body:[4,4,width-8,height-18],kind,detail,...options};};
const i2c=(name,pins=[],detail='I²C')=>module(name,['VCC','GND','SDA','SCL',...pins],'sensor',detail);
const spi=(name,pins=[],detail='SPI')=>module(name,['VCC','GND','SCK','MOSI','MISO','CS',...pins],'storage',detail);
const parallel=['GND','VCC','VO','RS','RW','E',...Array.from({length:8},(_,i)=>'D'+i),'A','K'];
export const EXPANSION_MODULES={
 tact6:module('Tact buton 6×6 mm',['1','2','1.r','2.r'],'button','4 bacak · anlık kontak',{body:[8,4,28.8,36],width:44.8,height:44,pins:[{id:'1',x:3.2,y:12.4,bus:'1'},{id:'1.r',x:41.6,y:12.4,bus:'1'},{id:'2',x:3.2,y:31.6,bus:'2'},{id:'2.r',x:41.6,y:31.6,bus:'2'}],asset:'tact-6x6.svg'}),
 segment1:module('7-segment tek hane',['A','B','C','D','E','F','G','DP','K'],'segment','Ortak katot · seri direnç gerekir'),
 segment4:module('7-segment 4 hane',['A','B','C','D','E','F','G','DP','K1','K2','K3','K4'],'segment','Çoklamalı · ortak katot'),
 ledbar:module('10 segment LED bargraph',Array.from({length:10},(_,i)=>['A'+i,'K'+i]).flat(),'bar','10 bağımsız LED'),
 rgbled:module('RGB LED · ortak katot',['R','G','B','K'],'rgb','Üç ayrı akım sınırlama direnci'),
 lcd20p:module('LCD 20×4 paralel',parallel,'lcd','HD44780 · 4/8-bit',{body:[4,4,332,170],width:340,height:190,pins:row(parallel,182,340),display:{x:20,y:32,width:300,height:128,columns:20,rows:4}}),
 lcd20:module('LCD 20×4 I²C',['GND','VCC','SDA','SCL'],'lcd','PCF8574 · 0x27',{body:[4,4,332,170],width:340,height:190,pins:row(['GND','VCC','SDA','SCL'],182,340),display:{x:20,y:32,width:300,height:128,columns:20,rows:4}}),
 buzzerActive:module('Aktif buzzer',['VCC','GND','IN'],'buzzer','GPIO · DC etkinleştirme'),
 buzzerPassive:module('Pasif piezo buzzer',['P','N'],'buzzer','Darbe frekansı / duty'),
 dcmotor:module('DC motor',['P','N'],'motor','Direnç + nominal RPM · sınırlı model'),
 a4988:module('A4988 step/dir sürücü',['VCC','GND','VMOT','STEP','DIR','ENABLE','RESET','SLEEP','MS1','MS2','MS3','A1','A2','B1','B2'],'motor','STEP/DIR · 1/16 mikro-adım'),
 drv8825:module('DRV8825 step/dir sürücü',['VCC','GND','VMOT','STEP','DIR','ENABLE','RESET','SLEEP','MS1','MS2','MS3','A1','A2','B1','B2'],'motor','STEP/DIR · 1/32 mikro-adım'),
 tb6612:module('TB6612FNG çift motor sürücü',['VCC','GND','VM','STBY','PWMA','AIN1','AIN2','PWMB','BIN1','BIN2','AO1','AO2','BO1','BO2'],'motor','İki H-köprü · standby / brake'),
 optocoupler:module('Optokuplör · PC817 modeli',['A','K','C','E'],'chip','LED giriş · CTR kontrollü çıkış'),
 pnp:module('PNP transistör',['C','B','E'],'chip','Sınırlı DC · β/VBE/VCEsat'),
 pmos:module('P-kanal MOSFET',['G','D','S'],'chip','Negatif VGS · gövde diyodu'),
 aht20:i2c('AHT20 sıcaklık / nem'),
 ds3231:i2c('DS3231 RTC',['SQW'],'0x68 · saat / alarm / SQW'),
 adxl345:i2c('ADXL345 ivmeölçer',['SDO','CS','INT1','INT2'],'0x53/0x1D · FIFO / kesmeler'),
 water:module('Su seviye sensörü',['VCC','GND','AO'],'probe','Analog seviye'),
 rain:module('Yağmur sensörü',['VCC','GND','AO','DO'],'probe','Analog / eşik çıkışı'),
 soilProbe:module('Dirençli toprak nem probu',['VCC','GND','AO','DO'],'probe','Analog / eşik çıkışı'),
 ads1115:i2c('ADS1115 16-bit ADC',['ADDR','ALERT','A0','A1','A2','A3'],'PGA · diferansiyel / tek uç'),
 mcp4725:i2c('MCP4725 12-bit DAC',['A0','OUT'],'0x60/0x61 · analog çıkış'),
 pcf8574:i2c('PCF8574 GPIO',['A0','A1','A2',...Array.from({length:8},(_,i)=>'P'+i),'INT'],'8 quasi-bidirectional GPIO'),
 pca9685:i2c('PCA9685 PWM / servo',['OE',...Array.from({length:16},(_,i)=>'PWM'+i)],'16 kanal · 12-bit PWM'),
 cd4067:module('CD74HC4067 analog çoklayıcı',['VCC','GND','SIG','EN','S0','S1','S2','S3',...Array.from({length:16},(_,i)=>'C'+i)],'chip','16→1 · çift yönlü analog anahtar'),
 levelShift:module('Çift yönlü seviye dönüştürücü',['LV','HV','GND',...Array.from({length:4},(_,i)=>['L'+i,'H'+i]).flat()],'chip','4 kanal MOSFET · open-drain'),
 fram:i2c('MB85RC256V I²C FRAM',['A0','A1','A2','WP'],'32 KB · yazma beklemesi yok'),
 spiFlash:spi('W25Q32 SPI NOR Flash',[],'4 MiB · JEDEC / page program / erase'),
 sdCard:spi('microSD · SPI',[],'SDSC 8 MiB · FAT16 · 512 bayt bloklar'),
 bme280:i2c('BME280 sıcaklık / nem / basınç',['ADDR'],'0x76/0x77 · kalibrasyon / forced ölçüm'),
 bme680:i2c('BME680 çevre / gaz sensörü',['ADDR'],'0x76/0x77 · forced T/P/H/gas ADC'),
 vl53l0x:i2c('VL53L0X ToF mesafe',['XSHUT','GPIO1'],'0x29 · tek / sürekli mesafe'),
 mfrc522:spi('MFRC522 RFID',['RST','IRQ'],'ISO14443A sanal kart · UID / block'),
 pn532:i2c('PN532 NFC',['RST','IRQ'],'I²C · sanal MIFARE kart / UID / block'),
 ina226:i2c('INA226 akım / güç',['A0','A1','VIN+','VIN-','ALERT'],'Şönt / bus · kalibrasyon / ALERT'),
 tcs34725:i2c('TCS34725 renk sensörü',['INT'],'RGBC · entegrasyon süresi'),
 max30102:i2c('MAX30102 optik sensör',['INT'],'Sanal RED/IR · FIFO · tıbbi model değil'),
 ili9341:spi('ILI9341 TFT 240×320',['DC','RST','BL'],'SPI · RGB565'),
 xpt2046:spi('XPT2046 dokunmatik panel',['IRQ'],'SPI · 12-bit X/Y'),
 epaper:spi('E-paper 2.9 inç · SSD1680',['DC','RST','BUSY'],'128×296 · siyah/beyaz framebuffer'),
 dfplayer:module('DFPlayer Mini',['VCC','GND','RX','TX','BUSY'],'audio','UART 9600 · MP3/WAV / play / pause'),
 i2sMic:module('I²S mikrofon',['VCC','GND','BCLK','WS','DOUT','LR'],'audio','24-bit signed PCM · I²S'),
 i2sAmp:module('I²S amplifikatör',['VCC','GND','BCLK','WS','DIN','SD','SPK+','SPK-'],'audio','24-bit signed PCM · I²S'),
 irEmitter:module('IR LED verici',['A','K'],'chip','Taşıyıcı darbeleri · sanal optik kanal'),
 irReceiver:module('IR alıcı · demodülatör',['VCC','GND','OUT'],'sensor','Sanal optik kanal · aktif LOW'),
 rs485:module('RS-485 transceiver · 3.3 V',['VCC','GND','DI','DE','RE','RO','A','B'],'chip','Sanal diferansiyel hat · direction / enable'),
 gps:module('GPS UART modülü',['VCC','GND','TX','RX'],'sensor','9600 baud · sanal NMEA RMC/GGA'),
 mcp2515:spi('MCP2515 CAN kontrolcüsü',['INT','CANH','CANL'],'SPI · CAN 2.0 sanal hat / ideal transceiver'),
};
Object.assign(EXPANSION_MODULES.ili9341,{kind:'tft',width:320,height:460,body:[4,4,312,440],pins:row(EXPANSION_MODULES.ili9341.pins.map(p=>p.id),452,320),display:{x:24,y:35,width:272,height:376,columns:240,rows:320}});
Object.assign(EXPANSION_MODULES.epaper,{kind:'epaper',width:210,height:365,body:[4,4,202,345],pins:row(EXPANSION_MODULES.epaper.pins.map(p=>p.id),357,210),display:{x:25,y:28,width:160,height:304,columns:128,rows:296}});
Object.assign(EXPANSION_MODULES.xpt2046,{kind:'touch',width:200,height:180,body:[4,4,192,160],pins:row(EXPANSION_MODULES.xpt2046.pins.map(p=>p.id),172,200),display:{x:15,y:26,width:170,height:125}});
for(const[id,m]of Object.entries(EXPANSION_MODULES))m.asset??='expansion-'+id+'.svg';
export const EXPANSION_CATALOG=Object.fromEntries(Object.entries(EXPANSION_MODULES).map(([id,d])=>[id,{name:d.name,category:d.kind==='sensor'||d.kind==='probe'||d.kind==='button'?'Girişler':['segment','bar','rgb','lcd','motor','buzzer','tft','epaper'].includes(d.kind)?'Çıkışlar':'Temel',detail:d.detail,width:d.width*1.35,height:d.height*1.35,pinDefs:d.pins.map(p=>({...p,x:p.x*1.35,y:p.y*1.35})),pins:d.pins.map(p=>p.id),asset:d.asset,scale:1.35}]));
