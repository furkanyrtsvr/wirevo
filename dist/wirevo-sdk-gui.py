"""Visible, user-controlled Wirevo SDK companion (standard Python/Tk)."""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
import threading
import webbrowser

spec = importlib.util.spec_from_file_location('wirevo_sdk_backend', Path(__file__).with_name('wirevo-sdk-bridge.py'))
backend = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backend)


def check_config(config):
    for key in ('sdk', 'toolchain', 'cmake', 'ninja', 'workspace'):
        if not isinstance(config.get(key), str) or not config[key]:
            raise ValueError('Eksik araç konumu: ' + key)
    if not (Path(config['sdk']) / 'external/pico_sdk_import.cmake').is_file():
        raise ValueError('Pico SDK klasörünü seçin (external/pico_sdk_import.cmake içermeli).')
    compiler = 'bin/arm-none-eabi-gcc.exe' if os.name == 'nt' else 'bin/arm-none-eabi-gcc'
    if not (Path(config['toolchain']) / compiler).is_file():
        raise ValueError('Arm GNU klasörünü seçin (bin/arm-none-eabi-gcc içermeli).')
    for key in ('cmake', 'ninja'):
        if not Path(config[key]).is_file():
            raise ValueError(key + ' programını seçin.')
    return config


def discover_config(home, saved=None):
    saved = saved if isinstance(saved, dict) else {}
    compiler = shutil.which('arm-none-eabi-gcc')
    return {
        'sdk': saved.get('sdk') or os.environ.get('PICO_SDK_PATH', ''),
        'toolchain': saved.get('toolchain') or os.environ.get('PICO_TOOLCHAIN_PATH', '') or (str(Path(compiler).parent.parent) if compiler else ''),
        'cmake': saved.get('cmake') or shutil.which('cmake') or '',
        'ninja': saved.get('ninja') or shutil.which('ninja') or '',
        'workspace': saved.get('workspace') or str(home / 'builds'),
    }


class VisibleSession:
    """Owns the listener, build processes and lifetime of one visible window."""
    def __init__(self, config, session_file, opener=webbrowser.open):
        self.config = check_config(config)
        self.session_file = Path(session_file)
        self.opener = opener
        self.bridge = self.server = self.thread = self.connection = None

    def start(self):
        if self.server:
            return
        self.bridge = backend.Bridge(self.config, secrets.token_urlsafe(32))
        self.server = backend.automatic_server(self.bridge)
        self.connection = {'protocol': 1, 'port': self.server.server_port, 'token': self.bridge.token}
        try:
            self.session_file.parent.mkdir(parents=True, exist_ok=True)
            self.session_file.write_text(json.dumps(self.connection), encoding='utf-8')
            if os.name != 'nt':
                self.session_file.chmod(0o600)
            self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
            self.thread.start()
        except Exception:
            self.server.server_close()
            self.server = None
            raise

    def open_wirevo(self):
        if not self.server:
            raise ValueError('Önce yardımcıyı başlatın.')
        return self.opener(backend.pairing_url(self.connection))

    def stop(self):
        if not self.server:
            return
        try:
            self.bridge.close()
            self.server.shutdown()
            self.thread.join(timeout=3)
            self.server.server_close()
        finally:
            if self.session_file.is_file():
                try:
                    data = json.loads(self.session_file.read_text(encoding='utf-8'))
                    if data.get('token') == self.connection['token']:
                        self.session_file.unlink()
                except (OSError, ValueError):
                    pass
            self.server = None

    def activity(self):
        if not self.server:
            return 'Yardımcı kapalı'
        with self.bridge.lock:
            jobs = list(self.bridge.jobs.values())
            if any(j['state'] in ('queued', 'building') for j in jobs):
                return 'Derleme devam ediyor…'
            if jobs:
                return {'succeeded': 'Son derleme tamamlandı', 'failed': 'Son derlemede hata var', 'cancelled': 'Derleme iptal edildi'}.get(jobs[-1]['state'], 'Derleme bekleniyor')
        return 'Wirevo eşleştirmesi doğrulandı · Derleme bekleniyor' if self.bridge.authenticated_status_count else 'Wirevo bağlantısı bekleniyor'


def show_app(config_file, session_file, open_browser=True):
    import tkinter as tk
    from tkinter import ttk, filedialog, messagebox
    home = Path(os.environ.get('LOCALAPPDATA', Path.home())) / 'WirevoSDK'
    try:
        saved = json.loads(config_file.read_text(encoding='utf-8-sig'))
    except (OSError, ValueError):
        saved = {}
    config = discover_config(home, saved)
    root = tk.Tk()
    root.title('Wirevo SDK · Görünür yardımcı')
    root.geometry('700x650')
    root.minsize(650, 630)
    root.configure(bg='#142231')
    style = ttk.Style(root)
    style.theme_use('clam')
    style.configure('.', background='#142231', foreground='#e5edf5', font=('Segoe UI', 10))
    style.configure('TEntry', fieldbackground='#203548', foreground='#ffffff', padding=6)
    style.configure('TButton', background='#28475c', foreground='#ffffff', padding=9)
    style.map('TButton', background=[('active', '#35637a')])
    style.configure('Title.TLabel', font=('Segoe UI', 20, 'bold'), foreground='#61dfc0')
    style.configure('Status.TLabel', font=('Segoe UI', 12, 'bold'))
    page = ttk.Frame(root, padding=24)
    page.pack(fill='both', expand=True)
    ttk.Label(page, text='Wirevo SDK', style='Title.TLabel').pack(anchor='w')
    ttk.Label(page, text='Bu pencere açıkken yardımcı çalışır. Kapatınca bağlantı ve bu yardımcının\nderlemeleri durur. Gizli servis veya bilgisayarla otomatik başlama yoktur.', wraplength=640).pack(anchor='w', pady=(8, 18))
    status = tk.StringVar(value='İlk kurulum · araç konumlarını kontrol edin')
    activity = tk.StringVar(value='Henüz bağlantı başlatılmadı')
    ttk.Label(page, textvariable=status, style='Status.TLabel').pack(anchor='w')
    ttk.Label(page, textvariable=activity, wraplength=630).pack(anchor='w', pady=(5, 14))
    fields = {}
    controls = []
    labels = {'sdk': 'Pico SDK klasörü', 'toolchain': 'Arm GNU klasörü', 'cmake': 'CMake programı', 'ninja': 'Ninja programı'}
    for key, label in labels.items():
        row = ttk.Frame(page)
        row.pack(fill='x', pady=5)
        ttk.Label(row, text=label, width=19).pack(side='left')
        value = tk.StringVar(value=config[key])
        fields[key] = value
        entry = ttk.Entry(row, textvariable=value)
        entry.pack(side='left', fill='x', expand=True, padx=(0, 8))
        def choose(k=key):
            selected = filedialog.askdirectory(parent=root, title=labels[k]) if k in ('sdk', 'toolchain') else filedialog.askopenfilename(parent=root, title=labels[k])
            if selected:
                fields[k].set(selected)
        button = ttk.Button(row, text='Seç…', command=choose)
        button.pack(side='right')
        controls.extend([entry, button])
    ttk.Label(page, text='Bu araçlar kurulu değilse önce kurulum gerekir. Port, bağlantı kodu veya\nJSON dosyası seçmeniz gerekmez.', wraplength=630).pack(anchor='w', pady=(12, 8))
    actions = ttk.Frame(page)
    actions.pack(fill='x', pady=(10, 8))
    session = None
    closing = False

    def open_page():
        try:
            if not session.open_wirevo():
                raise ValueError('Tarayıcı açılamadı. Varsayılan tarayıcınızı kontrol edip yeniden deneyin.')
        except Exception as error:
            messagebox.showerror('Wirevo açılamadı', str(error), parent=root)

    def start():
        nonlocal session
        try:
            selected = check_config({**config, **{k: v.get().strip() for k, v in fields.items()}})
            config_file.parent.mkdir(parents=True, exist_ok=True)
            config_file.write_text(json.dumps(selected, indent=2), encoding='utf-8')
            session = VisibleSession(selected, session_file)
            session.start()
            for control in controls:
                control.configure(state='disabled')
            start_button.configure(state='disabled')
            open_button.configure(state='normal')
            edit_button.configure(state='normal')
            status.set('Yardımcı açık · kontrol sizde')
            if open_browser:
                open_page()
        except Exception as error:
            if session:
                session.stop()
            session = None
            activity.set(str(error))
            messagebox.showerror('Kurulum gerekli', str(error), parent=root)

    def edit_settings():
        nonlocal session
        if session:
            session.stop()
        session = None
        for control in controls:
            control.configure(state='normal')
        start_button.configure(state='normal')
        open_button.configure(state='disabled')
        edit_button.configure(state='disabled')
        status.set('Yardımcı durduruldu')
        activity.set('Konumları güncelleyip yeniden başlatabilirsiniz.')

    def close():
        nonlocal closing
        if closing:
            return
        closing = True
        status.set('Durduruluyor…')
        root.update_idletasks()
        if session:
            session.stop()
        root.destroy()

    start_button = ttk.Button(actions, text='Kaydet ve yardımcıyı başlat', command=start)
    start_button.pack(side='left')
    open_button = ttk.Button(actions, text='Wirevo’yu aç', command=open_page, state='disabled')
    open_button.pack(side='left', padx=8)
    edit_button = ttk.Button(actions, text='Durdur / ayarları düzenle', command=edit_settings, state='disabled')
    edit_button.pack(side='left')
    ttk.Button(page, text='Yardımcıyı kapat', command=close).pack(anchor='e', pady=(10, 0))
    root.protocol('WM_DELETE_WINDOW', close)

    def poll():
        if closing:
            return
        if session and session.server:
            activity.set(session.activity())
        root.after(400, poll)
    poll()
    try:
        check_config(config)
        root.after(250, start)
    except ValueError:
        pass
    try:
        root.mainloop()
    finally:
        if session:
            session.stop()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--launch', action='store_true')
    parser.add_argument('--config')
    parser.add_argument('--session-file')
    parser.add_argument('--no-open', action='store_true')
    args = parser.parse_args()
    if args.launch and os.name == 'nt':
        pythonw = Path(sys.executable).with_name('pythonw.exe')
        if pythonw.is_file():
            forwarded = [arg for arg in sys.argv[1:] if arg != '--launch']
            subprocess.Popen([str(pythonw), str(Path(__file__).resolve()), *forwarded])
            return
    home = Path(os.environ.get('LOCALAPPDATA', Path.home())) / 'WirevoSDK'
    portable = Path(__file__).with_name('config.json')
    config_file = Path(args.config) if args.config else portable if portable.is_file() else home / 'config.json'
    session_file = Path(args.session_file) if args.session_file else home / 'connection.json'
    show_app(config_file, session_file, not args.no_open)


if __name__ == '__main__':
    main()
