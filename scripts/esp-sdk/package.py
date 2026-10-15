"""Prepare ignored C3 research flash images with official esptool."""
import pathlib, subprocess, sys
root = pathlib.Path(__file__).resolve().parents[2] / 'research/esp32'
sdk, core, out = root / 'sdk/esp32c3-libs', root / 'sdk/esp32-core-3.3.8', root / 'native-c3'
profile = sys.argv[1] if len(sys.argv) > 1 else 'full-clang'
if profile not in ('sketch', 'mixed', 'full-clang', 'lld'):
    raise ValueError('Expected sketch, mixed, full-clang or lld.')
def run(*args):
    subprocess.run([str(a) for a in args], check=True)
def image(elf, target, app=True):
    run(sys.executable, '-m', 'esptool', '--chip', 'esp32c3', 'elf2image',
        '--flash-mode', 'dio', '--flash-freq', '80m', '--flash-size', '4MB',
        *(['--elf-sha256-offset','0xb0'] if app else []), '-o', target, elf)
image(out / (profile + '.elf'), out / (profile + '.bin'))
image(sdk / 'bin/bootloader_dio_80m.elf', out / 'bootloader.bin', False)
run(sys.executable, core / 'tools/gen_esp32part.py', core / 'tools/partitions/default.csv', out / 'partitions.bin')
run(sys.executable, '-m', 'esptool', '--chip', 'esp32c3', 'merge-bin', '-o',
    out / (profile + '-merged.bin'), '--flash-mode', 'dio', '--flash-freq', '80m',
    '--flash-size', '4MB', '0', out / 'bootloader.bin', '0x8000', out / 'partitions.bin',
    '0xe000', core / 'tools/partitions/boot_app0.bin', '0x10000', out / (profile + '.bin'))
