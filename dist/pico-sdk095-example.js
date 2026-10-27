export const SDK095_SOURCE=`#include <pico/stdlib.h>
#include <pico/multicore.h>
#include <stdio.h>
#include <pico/stdio_usb.h>
#include "config.h"
volatile int answer;
int library_answer(void);
void second_core(void) {
    answer = library_answer() + EXTRA_VALUE;
    gpio_put(15, answer == 73);
    while (1) tight_loop_contents();
}
int main(void) {
    stdio_init_all();
    gpio_init(15);
    gpio_set_dir(15, GPIO_OUT);
    multicore_launch_core1(second_core);
    while (!stdio_usb_connected()) sleep_ms(1);
    printf("SDK_DERLE095 %d\\n", answer);
    while (1) sleep_ms(20);
}
`;
export const SDK095_FILES=[{name:'CMakeLists.txt',content:`cmake_minimum_required(VERSION 3.13)
include(pico_sdk_import.cmake)
project(wirevo_sdk095 C CXX ASM)
pico_sdk_init()
math(EXPR EXTRA_VALUE "70 + 1")
configure_file(config.h.in config.h @ONLY)
add_library(answer_library STATIC answer.c)
add_executable(app main.c)
target_include_directories(app PRIVATE \${CMAKE_CURRENT_BINARY_DIR})
target_link_libraries(app pico_stdlib pico_multicore answer_library)
pico_enable_stdio_usb(app 1)
pico_enable_stdio_uart(app 0)
pico_add_extra_outputs(app)
`},{name:'answer.c',content:'int library_answer(void) { return 2; }\n'},{name:'config.h.in',content:'#define EXTRA_VALUE @EXTRA_VALUE@\n'}];
