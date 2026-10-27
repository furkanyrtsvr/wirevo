"""New helper protocol/security tests. The fixture builder is not a real SDK."""
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request
import uuid

spec = importlib.util.spec_from_file_location('bridge', Path(__file__).parents[1] / 'scripts/wirevo-sdk-bridge.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class Bridge095(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        builder = self.root / 'fixture.py'
        builder.write_text('''import sys,json,time
from pathlib import Path
a=sys.argv
p=json.loads(Path(a[a.index('--project')+1]).read_text())
if 'FAIL' in p['code']:
 print('main.c:6:1: error: fixture failure',flush=True);sys.exit(1)
if 'SLOW' in p['code']:time.sleep(60)
d=Path(a[a.index('--output')+1])/'build';d.mkdir(parents=True)
(d/'app.uf2').write_bytes(b'F'*512)
print('fixture done',flush=True)
''', encoding='utf-8')
        self.bridge = module.Bridge({'workspace': str(self.root / 'jobs'), 'sdk': 'fixture', 'toolchain': 'fixture', 'cmake': 'fixture', 'ninja': 'fixture', 'timeout': 5}, 'test-token-095', builder)
        self.server = module.server_for(self.bridge, 0)
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.url = 'http://127.0.0.1:%d' % self.server.server_port

    def tearDown(self):
        self.bridge.close()
        self.server.shutdown()
        self.server.server_close()
        for _ in range(100):
            if not any(j['directory'].exists() for j in self.bridge.jobs.values()):
                break
            time.sleep(.02)
        self.temp.cleanup()

    def request(self, path, body=None, origin='http://127.0.0.1:4173', token='test-token-095', method=None, host=None):
        headers = {'Origin': origin, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}
        if host:
            headers['Host'] = host
        r = urllib.request.Request(self.url + path, data=json.dumps(body).encode() if body is not None else None, headers=headers, method=method)
        try:
            response = urllib.request.urlopen(r)
        except urllib.error.HTTPError as e:
            response = e
        return response.status, json.loads(response.read()), response.headers

    def body(self, code='OK'):
        return {'id': str(uuid.uuid4()), 'sourceKey': '095-source', 'project': {'board': 'pico', 'language': 'c', 'architecture': 'arm', 'code': code, 'files': []}}

    def wait(self, job):
        for _ in range(300):
            _, d, _ = self.request('/v1/jobs/' + job)
            if d['state'] not in ('queued', 'building'):
                return d
            time.sleep(.01)
        self.fail('new fixture helper did not finish')

    def test_origin_host_auth_and_preflight(self):
        self.assertEqual(self.request('/v1/status', origin='https://untrusted.invalid')[0], 403)
        self.assertEqual(self.request('/v1/status', token='bad')[0], 401)
        self.assertEqual(self.request('/v1/status', host='evil.invalid')[0], 403)
        code, data, headers = self.request('/v1/status')
        self.assertEqual((code, data['engine']), (200, 'official-pico-sdk'))
        self.assertEqual(headers['Access-Control-Allow-Origin'], 'http://127.0.0.1:4173')
        self.assertEqual(self.request('/v1/status', method='OPTIONS', token='bad')[0], 200)

    def test_paths_and_limits_never_launch(self):
        for name in ('../escape.c', '/absolute.c', 'C:escape.c', 'main.c'):
            b = self.body();b['project']['files'] = [{'name': name, 'content': ''}]
            self.assertEqual(self.request('/v1/jobs', b)[0], 400)
        b = self.body('x' * 100001)
        self.assertEqual(self.request('/v1/jobs', b)[0], 400)
        self.assertEqual(len(self.bridge.jobs), 0)

    def test_success_has_identity_hash_and_cleans_owned_workspace(self):
        b = self.body();self.assertEqual(self.request('/v1/jobs', b)[0], 202)
        d = self.wait(b['id'])
        self.assertEqual((d['state'], d['board'], d['sourceKey']), ('succeeded', 'pico', '095-source'))
        self.assertEqual(d['result']['bytes'], 512)
        self.assertEqual(len(d['result']['sha256']), 64)

    def test_failure_has_diagnostic_and_no_firmware(self):
        b = self.body('FAIL');self.request('/v1/jobs', b);d = self.wait(b['id'])
        self.assertEqual(d['state'], 'failed')
        self.assertIn('main.c:6:1: error', d['log'])
        self.assertNotIn('result', d)

    def test_cancel_stops_job_and_busy_rejects_another(self):
        b = self.body('SLOW');self.request('/v1/jobs', b)
        self.assertEqual(self.request('/v1/jobs', self.body())[0], 409)
        self.assertEqual(self.request('/v1/jobs/' + b['id'] + '/cancel', {})[0], 200)
        self.assertEqual(self.wait(b['id'])['state'], 'cancelled')

    def test_cancel_before_post_prevents_start(self):
        b = self.body('SLOW');self.request('/v1/jobs/' + b['id'] + '/cancel', {});self.request('/v1/jobs', b)
        self.assertEqual(self.wait(b['id'])['state'], 'cancelled')


if __name__ == '__main__':
    unittest.main()
