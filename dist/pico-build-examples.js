export const CMAKE_SOURCE='#include <pico/stdlib.h>\n#include <stdio.h>\n#include <lib.h>\nvolatile unsigned answer,done;\nint main(void){stdio_init_all();answer=LESSON+lib_value();gpio_init(15);gpio_set_dir(15,GPIO_OUT);gpio_put(15,answer==42);puts("CMake / SDK: 42");done=1;while(1){}}';
export const CMAKE_FILES=[{name:'pico_sdk_import.cmake',content:'if(NOT PICO_SDK_PATH)\n  set(PICO_SDK_PATH $ENV{PICO_SDK_PATH})\nendif()\ninclude("${PICO_SDK_PATH}/external/pico_sdk_import.cmake")\n'},{name:'CMakeLists.txt',content:'cmake_minimum_required(VERSION 3.13)\ninclude(pico_sdk_import.cmake)\nproject(lesson C)\npico_sdk_init()\nset(SRC main.c)\nadd_subdirectory(driver)\nadd_executable(app ${SRC})\ntarget_compile_definitions(app PRIVATE LESSON=35)\ntarget_link_libraries(app PRIVATE pico_stdlib driver)\npico_enable_stdio_uart(app 1)\npico_add_extra_outputs(app)'},{name:'driver/CMakeLists.txt',content:'add_library(driver STATIC lib.c)\ntarget_include_directories(driver PUBLIC include)\ntarget_compile_definitions(driver PRIVATE OFFSET=7)'},{name:'driver/include/lib.h',content:'int lib_value(void);'},{name:'driver/lib.c',content:'#include <lib.h>\n#ifdef LESSON\n#error private definition leaked\n#endif\nint lib_value(void){return OFFSET;}'}];
export const DMA_PY=String.raw`from machine import Pin
from array import array
import rp2, js

@rp2.asm_pio(set_init=rp2.PIO.OUT_LOW,out_init=rp2.PIO.OUT_LOW, out_shiftdir=rp2.PIO.SHIFT_RIGHT)
def fifo_program():
    pull(block)
    out(pins, 1)
    mov(isr, osr)
    push(block)

sm = rp2.StateMachine(0, fifo_program, freq=1000000,
                      out_base=Pin(15), set_base=Pin(15))
sm.active(1)
sent = array('I', [3, 0, 7])
received = array('I', [0, 0, 0])
tx = rp2.DMA()
rx = rp2.DMA()
rx.config(read=sm, write=received, count=3,
          ctrl=rx.pack_ctrl(inc_read=False, treq_sel=4), trigger=True)
tx.config(read=sent, write=sm, count=3,
          ctrl=tx.pack_ctrl(inc_write=False, treq_sel=0), trigger=True)
while rx.active():
    await js.cf.sleep(1)
print('DMA / PIO:', list(received))  # [1, 0, 3]; GP15 remains HIGH
rx.close()
tx.close()
sm.active(0)
while True:
    await js.cf.sleep(20)
`;
