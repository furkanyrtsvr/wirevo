"""Wirevo's authenticated, loopback-only official Pico SDK build helper.

Run your own trusted projects: CMake commands execute as the current OS user.
No dependencies are downloaded and no LAN/public interface is opened.
"""
import argparse
import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit
import uuid
import webbrowser

BOARDS = {'pico', 'pico-h', 'pico-w', 'pico-wh', 'pico-2', 'pico-2-headers', 'pico-2-w', 'pico-2-w-headers'}
ORIGINS = {'https://wirevo-furka.equalwood4.chatgpt.site', 'http://127.0.0.1:4173', 'http://localhost:4173'}
NAME = re.compile(r'^([A-Za-z_][\w-]*/)*[A-Za-z_][\w.-]*\.(c|h|h\.in|cmake)$|^([A-Za-z_][\w-]*/)*CMakeLists\.txt$')
ID = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')


def validate_request(body):
    if not isinstance(body, dict) or not ID.fullmatch(str(body.get('id', ''))):
        raise ValueError('Geçersiz derleme kimliği.')
    p = body.get('project', {})
    if not isinstance(p, dict) or p.get('language') != 'c' or p.get('board') not in BOARDS or p.get('architecture', 'arm') != 'arm':
        raise ValueError('Yerel SDK için Pico C / ARM projesi gerekli.')
    key = body.get('sourceKey')
    if not isinstance(key, str) or len(key) > 250000:
        raise ValueError('Kaynak eşlemesi geçersiz.')
    files = [{'name': 'main.c', 'content': p.get('code')}] + p.get('files', [])
    if len(files) > 16:
        raise ValueError('En fazla 16 kaynak dosyası desteklenir.')
    seen, total = set(), 0
    for f in files:
        if not isinstance(f, dict):
            raise ValueError('Kaynak dosyası geçersiz.')
        name, content = f.get('name'), f.get('content')
        if not isinstance(name, str) or len(name) > 100 or not NAME.fullmatch(name) or any(s in ('.', '..') for s in name.split('/')) or name.lower() in seen:
            raise ValueError('Kaynak yolu geçersiz veya yineleniyor.')
        if not isinstance(content, str):
            raise ValueError('Kaynak metni geçersiz.')
        seen.add(name.lower())
        total += len(content.encode('utf-8'))
    if total > 100000:
        raise ValueError('Kaynaklar toplam 100 KB sınırını aşıyor.')
    target = body.get('target', '')
    if not isinstance(target, str) or target and not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_.-]{0,79}', target):
        raise ValueError('CMake hedef adı geçersiz.')
    return {'language': 'c', 'code': p['code'], 'files': p.get('files', []), 'components': [{'type': 'board', 'params': {'model': p['board']}}]}


class Bridge:
    def __init__(self, config, token, builder=None):
        self.config, self.token = config, token
        self.builder = Path(builder or Path(__file__).with_name('build-pico-sdk.py')).resolve()
        self.root = Path(config['workspace']).resolve()
        self.root.mkdir(parents=True, exist_ok=True)
        self.jobs, self.early_cancel = {}, set()
        self.lock = threading.RLock()

    def status(self):
        return {'protocol': 1, 'version': '0.95.0', 'engine': 'official-pico-sdk', 'architectures': ['arm'], 'boards': sorted(BOARDS)}

    def append(self, job, line):
        # Keep user-source diagnostics relative and navigable in the editor.
        for prefix in (str(job['directory'] / 'source') + os.sep, str(job['directory'] / 'source').replace('\\', '/') + '/'):
            line = line.replace(prefix, '')
        line = re.sub(r'CMake Error at ([^\n:]+):(\d+) \(([^)]+)\):', r'\1:\2:1: error: CMake (\3)', line)
        with self.lock:
            job['log'] += line
            if len(job['log']) > 200000:
                cut = len(job['log']) - 200000
                job['log'] = job['log'][cut:]
                job['base'] += cut

    def start(self, body):
        project = validate_request(body)
        with self.lock:
            if body['id'] in self.jobs:
                raise FileExistsError('Bu derleme kimliği zaten kullanıldı.')
            if any(j['state'] in ('queued', 'building') for j in self.jobs.values()):
                raise FileExistsError('Başka bir SDK derlemesi sürüyor.')
            while len(self.jobs) >= 16:
                self.jobs.pop(next(iter(self.jobs)))
            job = {'id': body['id'], 'state': 'queued', 'board': body['project']['board'], 'sourceKey': body['sourceKey'], 'target': body.get('target', ''), 'log': '', 'base': 0, 'process': None, 'cancel': body['id'] in self.early_cancel, 'directory': self.root / body['id']}
            self.early_cancel.discard(body['id'])
            self.jobs[job['id']] = job
            threading.Thread(target=self.run, args=(job, project), daemon=True).start()
        return job['id']

    def cancel(self, job_id, timeout=False):
        with self.lock:
            job = self.jobs.get(job_id)
            if not job:
                if len(self.early_cancel) < 32:
                    self.early_cancel.add(job_id)
                return
            if job['state'] not in ('queued', 'building'):
                return
            job['cancel'] = True
            job['timeout'] = timeout
            p = job.get('process')
            if p and p.poll() is None:
                if os.name == 'nt':
                    subprocess.run(['taskkill', '/PID', str(p.pid), '/T', '/F'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW)
                else:
                    import signal
                    try:
                        os.killpg(p.pid, signal.SIGKILL)
                    except ProcessLookupError:
                        pass

    def run(self, job, project):
        timer = None
        directory = job['directory']
        try:
            with self.lock:
                if job['cancel']:
                    job['state'] = 'cancelled'
                    return
                job['state'] = 'building'
            directory.mkdir(exist_ok=False)
            (directory / '.wirevo-job').write_text(job['id'], encoding='ascii')
            project_file = directory / 'project.json'
            project_file.write_text(json.dumps(project), encoding='utf-8')
            output = directory / 'output'
            command = [sys.executable, '-u', str(self.builder), '--project', str(project_file), '--sdk', self.config['sdk'], '--output', str(output), '--cmake', self.config['cmake'], '--ninja', self.config['ninja'], '--toolchain', self.config['toolchain'], '--bridge']
            if job['target']:
                command += ['--target', job['target']]
            flags = {'creationflags': subprocess.CREATE_NO_WINDOW} if os.name == 'nt' else {'start_new_session': True}
            env = os.environ.copy()
            env['PYTHONUTF8'] = '1'
            with self.lock:
                if job['cancel']:
                    job['state'] = 'cancelled'
                    return
                p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8', errors='replace', env=env, **flags)
                job['process'] = p
            timer = threading.Timer(self.config.get('timeout', 300), self.cancel, args=(job['id'], True))
            timer.daemon = True
            timer.start()
            for line in p.stdout:
                self.append(job, line)
            p.stdout.close()
            code = p.wait()
            with self.lock:
                if job['cancel']:
                    job['state'] = 'failed' if job.get('timeout') else 'cancelled'
                    if job.get('timeout'):
                        self.append(job, 'SDK derleme süre sınırı aşıldı.\n')
                    return
            if code:
                raise RuntimeError('SDK derlemesi başarısız (çıkış %d).' % code)
            candidates = [f for f in (output / 'build').rglob('*.uf2') if 'pico-sdk' not in f.relative_to(output / 'build').parts]
            if job['target']:
                candidates = [f for f in candidates if f.stem == job['target']]
            if len(candidates) != 1:
                raise ValueError('Tek firmware hedefi seçilmeli. Pico SDK panelinde CMake hedefini yazın. Bulunan: ' + ', '.join(f.stem for f in candidates))
            data = candidates[0].read_bytes()
            if not data or len(data) > 1000000 or len(data) % 512:
                raise ValueError('SDK UF2 boyutu desteklenmiyor (en fazla 1 MB).')
            with self.lock:
                if job['cancel']:
                    job['state'] = 'cancelled'
                    return
                job.update(state='succeeded', result={'uf2': base64.b64encode(data).decode('ascii'), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'target': candidates[0].stem})
        except Exception as error:
            self.append(job, str(error) + '\n')
            with self.lock:
                job['state'] = 'cancelled' if job['cancel'] and not job.get('timeout') else 'failed'
        finally:
            if timer:
                timer.cancel()
            with self.lock:
                job['process'] = None
            # Only remove the exact, owned temporary directory under our workspace.
            if directory.exists() and directory.resolve().parent == self.root and not directory.is_symlink() and (directory / '.wirevo-job').is_file():
                shutil.rmtree(directory)

    def view(self, job_id, cursor):
        with self.lock:
            job = self.jobs.get(job_id)
            if not job:
                raise KeyError(job_id)
            return {'id': job_id, 'state': job['state'], 'board': job['board'], 'sourceKey': job['sourceKey'], 'log': job['log'][max(0, cursor - job['base']):], 'cursor': job['base'] + len(job['log']), **({'result': job['result']} if job['state'] == 'succeeded' else {})}

    def close(self):
        for job_id in list(self.jobs):
            self.cancel(job_id)


def server_for(bridge, port=18765):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass

        def respond(self, status, data):
            raw = json.dumps(data, ensure_ascii=False).encode('utf-8')
            self.send_response(status)
            if self.headers.get('Origin') in ORIGINS:
                self.send_header('Access-Control-Allow-Origin', self.headers['Origin'])
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
                self.send_header('Access-Control-Allow-Private-Network', 'true')
                self.send_header('Vary', 'Origin')
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(raw)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            try:
                self.wfile.write(raw)
            except (BrokenPipeError, ConnectionResetError):
                pass

        def permitted(self, preflight=False):
            host = self.headers.get('Host')
            if host != '127.0.0.1:%d' % self.server.server_port or self.headers.get('Origin') not in ORIGINS:
                self.respond(403, {'error': 'Bu kaynak/host SDK yardımcısına erişemez.'})
                return False
            if not preflight and not hmac.compare_digest(self.headers.get('Authorization', ''), 'Bearer ' + bridge.token):
                self.respond(401, {'error': 'SDK bağlantı kodu geçersiz. Yardımcıya yeniden bağlanın.'})
                return False
            return True

        def do_OPTIONS(self):
            if self.permitted(True):
                self.respond(200, {})

        def do_GET(self):
            if not self.permitted():
                return
            route = urlsplit(self.path)
            if route.path == '/v1/status':
                self.respond(200, bridge.status())
                return
            job_id = route.path.removeprefix('/v1/jobs/')
            try:
                if not ID.fullmatch(job_id):
                    raise KeyError(job_id)
                cursor = int(parse_qs(route.query).get('cursor', ['0'])[0])
                if cursor < 0:
                    raise ValueError('İlerleme konumu geçersiz.')
                self.respond(200, bridge.view(job_id, cursor))
            except KeyError:
                self.respond(404, {'error': 'Derleme bulunamadı.'})
            except ValueError as error:
                self.respond(400, {'error': str(error)})

        def do_POST(self):
            if not self.permitted():
                return
            try:
                if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
                    raise ValueError('JSON gövdesi gerekli.')
                size = int(self.headers.get('Content-Length', '0'))
                if size < 2 or size > 512000:
                    raise ValueError('İstek boyutu geçersiz.')
                body = json.loads(self.rfile.read(size))
                if self.path == '/v1/jobs':
                    self.respond(202, {'id': bridge.start(body)})
                elif self.path.startswith('/v1/jobs/') and self.path.endswith('/cancel'):
                    job_id = self.path[len('/v1/jobs/'):-len('/cancel')]
                    if not ID.fullmatch(job_id):
                        raise ValueError('Derleme kimliği geçersiz.')
                    bridge.cancel(job_id)
                    self.respond(200, {'cancelled': True})
                else:
                    self.respond(404, {'error': 'SDK işlemi bulunamadı.'})
            except FileExistsError as error:
                self.respond(409, {'error': str(error)})
            except (ValueError, TypeError, KeyError) as error:
                self.respond(400, {'error': str(error)})
    return ThreadingHTTPServer(('127.0.0.1', port), Handler)


def main():
    home = Path(os.environ.get('LOCALAPPDATA', Path.home())) / 'WirevoSDK'
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', default=str(home / 'config.json'))
    parser.add_argument('--port', type=int, default=18765)
    parser.add_argument('--session-file', default=str(home / 'connection.json'))
    parser.add_argument('--setup', action='store_true', help='Configure installed SDK tools on first use.')
    parser.add_argument('--open', action='store_true', help='Open Wirevo and pair using a URL fragment (not sent to the Site server).')
    args = parser.parse_args()
    config_file = Path(args.config)
    if args.setup and not config_file.is_file():
        if not sys.stdin.isatty():
            raise ValueError('İlk kurulumu wirevo-sdk.cmd ile başlatın.')
        def installed(label, default=''):
            text = input(label + (' [' + default + ']' if default else '') + ': ').strip().strip(chr(34))
            return str(Path(text or default).expanduser().resolve())
        config = {'sdk': installed('Pico SDK klasörü', os.environ.get('PICO_SDK_PATH', '')),
                  'toolchain': installed('Arm GNU klasörü (bin klasörünün üstü)', os.environ.get('PICO_TOOLCHAIN_PATH', '')),
                  'cmake': installed('CMake programı', shutil.which('cmake') or ''),
                  'ninja': installed('Ninja programı', shutil.which('ninja') or ''),
                  'workspace': str(home / 'builds')}
        config_file.parent.mkdir(parents=True, exist_ok=True)
        config_file.write_text(json.dumps(config, indent=2), encoding='utf-8')
    config = json.loads(config_file.read_text(encoding='utf-8-sig'))
    for key in ('sdk', 'toolchain', 'cmake', 'ninja', 'workspace'):
        if not isinstance(config.get(key), str):
            raise ValueError('SDK ayarı eksik: ' + key)
    if not (Path(config['sdk']) / 'external/pico_sdk_import.cmake').is_file():
        raise ValueError('Pico SDK bulunamadı.')
    for key in ('cmake', 'ninja'):
        if not Path(config[key]).is_file():
            raise ValueError(key + ' bulunamadı.')
    suffix = '.exe' if os.name == 'nt' else ''
    if not (Path(config['toolchain']) / ('bin/arm-none-eabi-gcc' + suffix)).is_file():
        raise ValueError('Arm GNU toolchain bulunamadı.')
    bridge = Bridge(config, secrets.token_urlsafe(32))
    server = server_for(bridge, args.port)
    connection = {'protocol': 1, 'port': server.server_port, 'token': bridge.token}
    session = Path(args.session_file)
    session.parent.mkdir(parents=True, exist_ok=True)
    session.write_text(json.dumps(connection), encoding='utf-8')
    if os.name != 'nt':
        session.chmod(0o600)
    print('Wirevo SDK yardımcısı hazır: 127.0.0.1:%d' % server.server_port, flush=True)
    print('Wirevo > Pico SDK / CMake > Bağlantı dosyası: ' + str(session), flush=True)
    if args.open:
        webbrowser.open('https://wirevo-furka.equalwood4.chatgpt.site/#wirevo-sdk=' + str(server.server_port) + ':' + bridge.token)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        bridge.close()
        server.server_close()
        if session.is_file():
            try:
                if json.loads(session.read_text())['token'] == bridge.token:
                    session.unlink()
            except (ValueError, KeyError):
                pass


if __name__ == '__main__':
    main()
