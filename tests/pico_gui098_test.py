import importlib.util,json,os,subprocess,tempfile,time,unittest,uuid
from pathlib import Path
from unittest.mock import patch
from urllib.request import Request,urlopen
spec=importlib.util.spec_from_file_location('gui098',Path(__file__).resolve().parents[1]/'scripts/wirevo-sdk-gui.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
class VisibleHelper(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name);self.config={'sdk':str(self.root/'sdk'),'toolchain':str(self.root/'gnu'),'cmake':str(self.root/'cmake'),'ninja':str(self.root/'ninja'),'workspace':str(self.root/'builds')}
  (self.root/'sdk/external').mkdir(parents=True);(self.root/'sdk/external/pico_sdk_import.cmake').touch();(self.root/'gnu/bin').mkdir(parents=True);(self.root/('gnu/bin/arm-none-eabi-gcc.exe' if os.name=='nt' else 'gnu/bin/arm-none-eabi-gcc')).touch()
  for name in ['cmake','ninja']:(self.root/name).touch()
  self.session=None
 def tearDown(self):
  if self.session:self.session.stop()
  self.temp.cleanup()
 def start(self,opener=lambda url:True):
  self.session=g.VisibleSession(self.config,self.root/'connection.json',opener);self.session.start();return self.session
 def test_listener_is_ready_before_browser_opens_and_stop_closes_it(self):
  def opened(url):
   c=self.session.connection;self.assertEqual(url,g.backend.pairing_url(c));req=Request('http://127.0.0.1:%d/v1/status'%c['port'],headers={'Origin':'https://wirevo-furka.equalwood4.chatgpt.site','Authorization':'Bearer '+c['token']})
   with urlopen(req,timeout=2) as r:self.assertEqual(json.load(r)['engine'],'official-pico-sdk')
   return True
  session=self.start(opened);self.assertTrue(session.open_wirevo());self.assertIn('eşleştirmesi doğrulandı',session.activity());port=session.connection['port'];session.stop();self.assertFalse(session.thread.is_alive());self.assertFalse((self.root/'connection.json').exists());self.assertIsNone(session.server)
 def test_close_cancels_a_new_owned_build_process(self):
  session=self.start();builder=self.root/'fixture_builder.py';builder.write_text('import time\nprint("fixture_build_started",flush=True)\ntime.sleep(60)\n',encoding='utf-8');session.bridge.builder=builder
  job=session.bridge.start({'id':str(uuid.uuid4()),'sourceKey':'gui-close-new','project':{'board':'pico','language':'c','architecture':'arm','code':'int main(void){}','files':[]}})
  deadline=time.monotonic()+5
  while time.monotonic()<deadline:
   state=session.bridge.jobs[job]
   if state['process'] is not None and 'fixture_build_started' in state['log']:break
   time.sleep(.02)
  process=session.bridge.jobs[job]['process'];self.assertIsNotNone(process);session.stop();self.assertIsNotNone(process.poll())
 def test_stop_does_not_delete_a_newer_windows_session(self):
  session=self.start();other={'protocol':1,'port':1234,'token':'y'*43};session.session_file.write_text(json.dumps(other),encoding='utf-8');session.stop();self.assertEqual(json.loads(session.session_file.read_text())['token'],other['token'])
 def test_saved_installed_paths_are_preserved_and_invalid_setup_does_not_start(self):
  self.assertEqual(g.discover_config(self.root,self.config),self.config)
  with self.assertRaisesRegex(ValueError,'Pico SDK'):g.VisibleSession(dict(self.config,sdk=str(self.root/'missing')),self.root/'bad.json')
 def test_visible_session_start_and_stop_are_idempotent(self):
  session=self.start();server=session.server;session.start();self.assertIs(session.server,server);session.stop();session.stop();self.assertEqual(session.activity(),'Yardımcı kapalı')
if __name__=='__main__':unittest.main()
