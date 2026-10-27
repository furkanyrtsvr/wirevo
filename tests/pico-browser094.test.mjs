import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {gunzipSync} from 'node:zlib';
import {compilePico} from '../src/pico-compiler.js';import {picoCMakePlan} from '../dist/pico-cmake.js';import {PICO_BOARDS} from '../dist/pico-boards.js';import {PicoRuntime} from '../dist/pico-runtime.js';import {createPicoProject} from '../dist/pico-project.js';import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
const module=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
const source=`#include <pico/stdlib.h>
#include <pico/stdio_usb.h>
#include <stdio.h>
#include "config.h"
volatile int answer;
int main(void){stdio_init_all();gpio_init(15);gpio_set_dir(15,GPIO_OUT);answer=answer_from_library()+BOARD_VALUE;gpio_put(15,answer==EXPECTED);while(!stdio_usb_connected()){}puts("BROWSER_CMAKE_094");while(1){tud_task();}}
`;
const files=[{name:'CMakeLists.txt',content:`cmake_minimum_required(VERSION 3.13)
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
for(const[id,b]of Object.entries(PICO_BOARDS))for(const arch of b.mcu==='RP2350'?['arm','riscv']:['arm'])test(id+' '+arch+' new browser CMake function/condition/template/USB stdio drives circuit',async()=>{const code=source.replace('#include <stdio.h>','#include <stdio.h>\n#include <tusb.h>'),f=await compilePico(module,code,id,files,'c',arch),r=new PicoRuntime(f.image,id);try{r.attachCircuit(createPicoProject({board:id,architecture:arch}));let serial='';for(let i=0;i<500&&!serial.includes('BROWSER_CMAKE_094');i++)serial+=r.step(3000);assert.match(serial,/BROWSER_CMAKE_094/);assert.equal(r.usbHost.snapshot().kind,'cdc');assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);assert.equal(r.rp.readUint32((b.mcu==='RP2350'?0x40070000:0x40034000)+0x30)&1,0,'UART disabled by CMake');}finally{r.dispose();}});
test('new template survives project ZIP and generated output is separate from sources',async()=>{const p=createPicoProject();p.code=source;p.files=files;const q=(await importProjectBytes(exportProjectZip(p))).project;assert.ok(q.files.some(f=>f.name==='config.h.in'));const plan=picoCMakePlan([{name:'main.c',content:source},...files]);assert.match(plan.generated[0].content,/#define LED_ON 1/);assert.equal(plan.generated[0].name,'.wirevo-cmake/config.h');assert.ok(!q.files.some(f=>f.name.startsWith('.wirevo-cmake')));});
test('new browser CMake rejects recursion, unsafe output paths and unselected host commands',()=>{const make=s=>picoCMakePlan([{name:'main.c',content:''},{name:'CMakeLists.txt',content:s}]);assert.throws(()=>make('function(loop)\nloop()\nendfunction()\nloop()'),/derinliği/);assert.throws(()=>make('configure_file(main.c ../../escape.h)'),/dışına/);assert.throws(()=>make('execute_process(COMMAND nope)'),/Desteklenmeyen/);assert.doesNotThrow(()=>make('if(FALSE)\nexecute_process(COMMAND nope)\nendif()\nadd_executable(app main.c)'));});
test('new CMake quoted conditions, empty if and parent function scope follow accepted semantics',()=>{const cmake='set(NAME ON)\nif("NAME")\nexecute_process(COMMAND forbidden)\nendif()\nif()\nexecute_process(COMMAND forbidden)\nendif()\nfunction(set_result)\nset(RESULT 91 PARENT_SCOPE)\nendfunction()\nset_result()\nadd_executable(app main.c)\ntarget_compile_definitions(app PRIVATE RESULT=${RESULT})';const p=picoCMakePlan([{name:'main.c',content:''},{name:'CMakeLists.txt',content:cmake}]);assert.deepEqual(p.units[0].defs,['RESULT=91']);});
