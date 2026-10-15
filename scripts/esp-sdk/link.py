"""Research gate: native linker; never a browser SDK deployment builder."""
import pathlib, runpy, sys
here = pathlib.Path(__file__).parent
ns = runpy.run_path(str(here / 'build-native.py'))
tool, sdk, out, run, flags = [ns[k] for k in ('tool', 'sdk', 'out', 'run', 'flags')]
full = '--full-core' in sys.argv
archive = out / ('core-clang.a' if full else 'core.a')
if full:
    objects = sorted((out / 'core-clang').glob('*.o'))
    if len(objects) != 56:
        raise RuntimeError('Run probe-clang.mjs --core successfully first (56 objects).')
    run([tool / 'riscv32-esp-elf-ar.exe', 'rcs', archive, *objects])
name = 'full-clang' if full else 'mixed'
run([tool / 'riscv32-esp-elf-g++.exe', *flags('ld_flags'),
     '-L' + str(sdk / 'lib'), '-L' + str(sdk / 'ld'), '-L' + str(sdk / 'dio_qspi'),
     *flags('ld_scripts'), '-Wl,--wrap=esp_panic_handler', '-Wl,--start-group',
     out / 'sketch-clang.o', archive, *flags('ld_libs'), '-Wl,--end-group', '-Wl,-EL',
     '-Wl,-Map=' + str(out / (name + '.map')), '-o', out / (name + '.elf')])
print(run([tool / 'riscv32-esp-elf-size.exe', out / (name + '.elf')]))
