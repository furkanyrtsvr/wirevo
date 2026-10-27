"""Build a Wirevo JSON project with real CMake and the installed official Pico SDK.

The project is executable build input: use this with your own/trusted projects.
No toolchain is silently downloaded, and no local HTTP service is started.
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import struct


def build(args):
    project = json.loads(Path(args.project).read_text(encoding='utf-8-sig'))
    board = next(c['params']['model'] for c in project['components'] if c['type'] == 'board')
    boards = {'pico': 'pico', 'pico-h': 'pico', 'pico-w': 'pico_w', 'pico-wh': 'pico_w',
              'pico-2': 'pico2', 'pico-2-headers': 'pico2', 'pico-2-w': 'pico2_w', 'pico-2-w-headers': 'pico2_w'}
    if project.get('language') != 'c' or board not in boards:
        raise ValueError('Pico C projesi gerekli.')
    sdk = Path(args.sdk).resolve()
    if not (sdk / 'external/pico_sdk_import.cmake').is_file():
        raise ValueError('Resmi Pico SDK klasörü bulunamadı.')
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    source = output / 'source'
    # Never mix a new source snapshot with stale generated inputs.
    if source.exists():
        raise ValueError('Çıktı/source zaten var; yeni bir çıktı klasörü seçin.')
    source.mkdir()
    names = set()
    files = [{'name': 'main.c', 'content': project['code']}] + project.get('files', [])
    for file in files:
        name = file['name']
        parts = name.replace('\\', '/').split('/')
        target = source.joinpath(*parts).resolve()
        if not name or any(p in ('', '.', '..') for p in parts) or ':' in name or not target.is_relative_to(source) or name.lower() in names:
            raise ValueError('Geçersiz kaynak yolu: ' + name)
        names.add(name.lower())
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(file['content'], encoding='utf-8')
    shutil.copyfile(sdk / 'external/pico_sdk_import.cmake', source / 'pico_sdk_import.cmake')
    if 'cmakelists.txt' not in names:
        sources = ' '.join('"' + f['name'].replace('"', '') + '"' for f in files if f['name'].endswith('.c'))
        (source / 'CMakeLists.txt').write_text('cmake_minimum_required(VERSION 3.13)\ninclude(pico_sdk_import.cmake)\nproject(wirevo C CXX ASM)\npico_sdk_init()\nadd_executable(wirevo ' + sources + ')\ntarget_link_libraries(wirevo pico_stdlib pico_multicore)\npico_enable_stdio_usb(wirevo 1)\npico_enable_stdio_uart(wirevo 0)\npico_add_extra_outputs(wirevo)\n', encoding='utf-8')
    env = os.environ.copy()
    env['PICO_SDK_PATH'] = str(sdk)
    if args.toolchain:
        env['PICO_TOOLCHAIN_PATH'] = str(Path(args.toolchain).resolve())
    command = [args.cmake, '-S', str(source), '-B', str(output / 'build'), '-G', 'Ninja',
               '-DPICO_BOARD=' + boards[board], '-DPICO_NO_PICOTOOL=1', '-DCMAKE_BUILD_TYPE=Release']
    if args.ninja:
        command.append('-DCMAKE_MAKE_PROGRAM=' + str(Path(args.ninja).resolve()))
    command.extend(args.cmake_arg)
    subprocess.run(command, env=env, check=True)
    subprocess.run([args.cmake, '--build', str(output / 'build')], env=env, check=True)
    for binary in (output / 'build').rglob('*.bin'):
        if not binary.with_suffix('.elf').exists():
            continue
        data = binary.read_bytes()
        total = (len(data) + 255) // 256
        family = 0xe48bff59 if board.startswith('pico-2') else 0xe48bff56
        blocks = []
        for number in range(total):
            header = struct.pack('<8I', 0x0a324655, 0x9e5d5157, 0x2000, 0x10000000 + number * 256, 256, number, total, family)
            blocks.append(header + data[number * 256:(number + 1) * 256].ljust(256, b'\xff') + bytes(220) + struct.pack('<I', 0x0ab16f30))
        binary.with_suffix('.uf2').write_bytes(b''.join(blocks))
    print('\nDerlenen dosyalar: ' + str(output / 'build'))
    print('Wirevo > Pico SDK / CMake > Resmi SDK UF2 yükle ile .uf2 dosyasını açın.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', required=True)
    parser.add_argument('--sdk', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--cmake', default='cmake')
    parser.add_argument('--ninja')
    parser.add_argument('--toolchain', help='Arm GNU toolchain root (contains bin/)')
    parser.add_argument('--cmake-arg', action='append', default=[])
    build(parser.parse_args())
