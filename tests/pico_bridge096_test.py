import importlib.util
import json
from pathlib import Path
import threading
import unittest
from http.client import HTTPConnection
spec=importlib.util.spec_from_file_location('bridge096',Path(__file__).resolve().parents[1]/'scripts/wirevo-sdk-bridge.py')
b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
class FakeBridge:
 token='x'*43
 def status(self):return {'protocol':1,'engine':'official-pico-sdk'}
class CompanionTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.server=b.server_for(FakeBridge(),0);cls.port=cls.server.server_port
  cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
 @classmethod
 def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.thread.join()
 def request(self,path,**headers):
  c=HTTPConnection('127.0.0.1',self.port,timeout=3);c.request('GET',path,headers=headers);r=c.getresponse();body=r.read();result=(r.status,dict(r.getheaders()),body);c.close();return result
 def test_local_assets_have_no_credentials_and_disallow_framing(self):
  for path in ['/sdk-connect','/sdk-relay.js']:
   code,headers,body=self.request(path);self.assertEqual(code,200);self.assertEqual(headers['Cache-Control'],'no-store');self.assertIn("frame-ancestors 'none'",headers['Content-Security-Policy']);self.assertNotIn(FakeBridge.token.encode(),body)
 def test_same_origin_companion_still_requires_token(self):
  base={'Sec-Fetch-Site':'same-origin'}
  self.assertEqual(self.request('/v1/status',**base)[0],401)
  base['Authorization']='Bearer '+FakeBridge.token
  self.assertEqual(self.request('/v1/status',**base)[0],200)
  self.assertEqual(self.request('/v1/status',Origin='http://127.0.0.1:%d'%self.port,Authorization='Bearer '+FakeBridge.token)[0],200)
 def test_foreign_origin_and_rebinding_are_rejected_even_with_token(self):
  self.assertEqual(self.request('/v1/status',Origin='https://evil.test',Authorization='Bearer '+FakeBridge.token)[0],403)
  self.assertEqual(self.request('/sdk-connect',Host='evil.test')[0],403)
  self.assertEqual(self.request('/v1/status',Authorization='Bearer '+FakeBridge.token)[0],403)
if __name__=='__main__':unittest.main()
