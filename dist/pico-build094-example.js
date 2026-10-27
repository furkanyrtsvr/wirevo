export const CMAKE094_SOURCE=`#include <pico/stdlib.h>
#include <pico/stdio_usb.h>
#include <stdio.h>
#include <tusb.h>
#include "config.h"
volatile int answer;
int main(void){stdio_init_all();gpio_init(15);gpio_set_dir(15,GPIO_OUT);answer=answer_from_library()+BOARD_VALUE;gpio_put(15,answer==EXPECTED);while(!stdio_usb_connected()){}puts("BROWSER_CMAKE_094");while(1){tud_task();}}
`;
export const CMAKE094_FILES=[{name:'CMakeLists.txt',content:`cmake_minimum_required(VERSION 3.13)
include(pico_sdk_import.cmake)
project(browser094 C)
pico_sdk_init()
include(helpers.cmake)
include(helpers.cmake)
option(LED_ON "LED test" ON)
set(PARENT 7)
add_lab(app)
if(NOT LOCAL_ONLY)
 if(PICO_RP2350)
  set(BOARD_VALUE 20)
  set(EXPECTED 62)
 elseif(PICO_RP2040)
  set(BOARD_VALUE 10)
  set(EXPECTED 52)
 else()
  unsupported_selected_branch()
 endif()
endif()
configure_file(config.h.in config.h @ONLY)
target_include_directories(app PRIVATE \${CMAKE_CURRENT_BINARY_DIR})
target_link_libraries(app PRIVATE helper)
`},{name:'helpers.cmake',content:`include_guard(GLOBAL)
function(add_lab target)
 set(LOCAL_ONLY 1)
 add_executable(\${target} main.c)
 foreach(sdk IN ITEMS pico_stdlib pico_stdio_usb)
  target_link_libraries(\${target} PRIVATE \${sdk})
 endforeach()
 pico_enable_stdio_usb(\${target} 1)
 pico_enable_stdio_uart(\${target} 0)
 add_library(helper STATIC helper.c)
endfunction()
`},{name:'config.h.in',content:'#define BOARD_VALUE @BOARD_VALUE@\n#define EXPECTED @EXPECTED@\n#cmakedefine01 LED_ON\nint answer_from_library(void);\n'},{name:'helper.c',content:'int answer_from_library(void){return 42;}'}];
