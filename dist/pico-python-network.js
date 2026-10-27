// Source-compatible station interface to the existing virtual AP, never host networking.
export const picoNetworkSource=String.raw`
import _cf
STA_IF=0
AP_IF=1
STAT_IDLE=0
STAT_CONNECTING=1
STAT_WRONG_PASSWORD=-3
STAT_NO_AP_FOUND=-2
STAT_CONNECT_FAIL=-1
STAT_GOT_IP=3
WIREVO_VIRTUAL=True
class WLAN:
    IF_STA=0
    IF_AP=1
    def __init__(self,id=0):
        if id!=0:raise NotImplementedError('Yalnız sanal station arayüzü')
        if not _cf.wlan('available','',''):raise OSError('Kartta CYW43 yok')
    def active(self,value=None):
        if value is None:return bool(_cf.wlan('active','',''))
        _cf.wlan('on' if value else 'off','','')
    def connect(self,ssid,key=''): _cf.wlan('connect',ssid,key)
    def disconnect(self):_cf.wlan('leave','','')
    def status(self,param=None):
        if param=='rssi':return int(_cf.wlan('rssi','',''))
        if param is not None:raise ValueError('status param')
        return int(_cf.wlan('status','',''))
    def isconnected(self):return self.status()==3
    def scan(self):
        ssid=_cf.wlan('ssid','','')
        return [(ssid.encode(),self.config('mac'),6,-42,3,False)] if ssid else []
    def config(self,param=None,**kw):
        if kw:raise NotImplementedError('Sanal AP ayarı Pico bağlantıları / proje ayarlarından yapılır')
        if param=='mac':return bytes.fromhex(_cf.wlan('mac','',''))
        if param in ('ssid','essid'):return _cf.wlan('joined','','')
        raise ValueError('config param')
    def ifconfig(self,value=None):
        if value is not None:raise NotImplementedError('Sanal DHCP sabittir')
        return ('192.168.4.2','255.255.255.0','192.168.4.1','192.168.4.1') if self.isconnected() else ('0.0.0.0',)*4
    def ipconfig(self,param):
        if param!='addr4':raise ValueError('ipconfig param')
        return self.ifconfig()[:2]
`;
export function picoPythonWLAN(runtime,action,ssid,password){const s=runtime.native.services,n=s.radio;if(action==='available')return runtime.board.wireless;if(!runtime.board.wireless)throw Error('Bu kartta radyo yok.');if(action==='on'){s.command(1);s.command(2);}else if(action==='off')s.command(0);else if(action==='leave')s.command(10);else if(action==='connect'){if(!n.station)throw Error('Önce WLAN.active(True) gerekli.');if(typeof ssid!=='string'||ssid.length>32||typeof password!=='string'||password.length>63)throw Error('SSID/parola sınırı.');n.ssid=ssid;n.password=password;n.auth=password?0x400004:0;n.link=1;n.joinAt=runtime.native.rp.clock.nanos+1000000;}runtime.advance(100);s.tick();if(action==='status')return n.link;if(action==='rssi')return n.link>=2?-42:0;if(action==='active')return n.station;if(action==='ssid')return s.network.enabled?s.network.ssid:'';if(action==='joined')return n.ssid||'';if(action==='mac')return '02575643'+(runtime.board.mcu==='RP2350'?'23':'20')+(runtime.board.headers?'01':'00');return 0;}
