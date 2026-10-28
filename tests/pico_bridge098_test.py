import contextlib,errno,importlib.util,io,json,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch,Mock
spec=importlib.util.spec_from_file_location('bridge098',Path(__file__).resolve().parents[1]/'scripts/wirevo-sdk-bridge.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
class AutoPairing(unittest.TestCase):
 def test_default_port_conflict_selects_an_ephemeral_port(self):
  server=Mock(server_port=43210)
  with patch.object(b,'server_for',side_effect=[OSError(errno.EADDRINUSE,'busy'),server]) as listen:
   self.assertIs(b.automatic_server(object()),server);self.assertEqual([c.args[1] for c in listen.call_args_list],[18765,0])
 def test_explicit_port_and_unrelated_errors_are_not_silently_replaced(self):
  with patch.object(b,'server_for',side_effect=OSError(errno.EACCES,'denied')):
   with self.assertRaises(OSError):b.automatic_server(object())
   with self.assertRaises(OSError):b.automatic_server(object(),18766)
 def launch(self,no_open=False):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);(root/'sdk/external').mkdir(parents=True);(root/'sdk/external/pico_sdk_import.cmake').touch();(root/'gnu/bin').mkdir(parents=True);(root/('gnu/bin/arm-none-eabi-gcc.exe' if b.os.name=='nt' else 'gnu/bin/arm-none-eabi-gcc')).touch()
   for name in ['cmake','ninja']:(root/name).touch()
   config={'sdk':str(root/'sdk'),'toolchain':str(root/'gnu'),'cmake':str(root/'cmake'),'ninja':str(root/'ninja'),'workspace':str(root/'builds')};(root/'config.json').write_text(json.dumps(config),encoding='utf-8');session=root/'pairing.json';server=Mock(server_port=43210);server.serve_forever.side_effect=KeyboardInterrupt;seen=[]
   def opened(url):
    connection=json.loads(session.read_text(encoding='utf-8'));self.assertEqual(url,b.pairing_url(connection));seen.append(connection);return True
   args=['helper','--config',str(root/'config.json'),'--session-file',str(session)]+(['--no-open'] if no_open else [])
   output=io.StringIO()
   with patch.object(sys,'argv',args),patch.object(b,'automatic_server',return_value=server),patch.object(b.webbrowser,'open',side_effect=opened) as opener,contextlib.redirect_stdout(output):b.main()
   self.assertEqual(opener.call_count,0 if no_open else 1);server.server_close.assert_called_once();self.assertFalse(session.exists())
   for c in seen:self.assertNotIn(c['token'],output.getvalue())
   return seen
 def test_helper_opens_wirevo_by_default_and_scrubs_secret_from_terminal(self):self.assertEqual(len(self.launch()),1)
 def test_headless_mode_does_not_launch_a_browser(self):self.assertEqual(self.launch(True),[])
 def test_real_listener_cannot_be_bound_by_a_second_helper(self):
  first=b.server_for(Mock(token='x'*43),0)
  try:
   with self.assertRaises(OSError):b.server_for(Mock(token='y'*43),first.server_port)
  finally:first.server_close()
 def test_pairing_url_is_fixed_origin_and_never_a_query_parameter(self):
  c={'port':43210,'token':'x'*43};url=b.pairing_url(c);self.assertTrue(url.startswith('https://wirevo-furka.equalwood4.chatgpt.site/#wirevo-sdk='));self.assertNotIn('?',url)
  for bad in [dict(c,port=0),dict(c,token='bad&url=https://evil.test')]:
   with self.assertRaises(ValueError):b.pairing_url(bad)
if __name__=='__main__':unittest.main()
