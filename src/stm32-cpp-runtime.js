export const CPP_HEADERS={
 'stddef.h':`#pragma once
typedef __SIZE_TYPE__ size_t;typedef __PTRDIFF_TYPE__ ptrdiff_t;
typedef struct {long long integer;double real;} max_align_t;
#define offsetof(T,m) __builtin_offsetof(T,m)
#ifdef __cplusplus
#define NULL nullptr
#else
#define NULL ((void*)0)
#endif
`,
 'stdbool.h':'#pragma once\n#ifndef __cplusplus\n#define bool _Bool\n#define true 1\n#define false 0\n#endif\n',
 'stdlib.h':`#pragma once
#include <stddef.h>
#ifdef __cplusplus
extern "C" {
#endif
void *malloc(size_t);void free(void*);void *calloc(size_t,size_t);void *realloc(void*,size_t);
int atexit(void(*)(void));void abort(void) __attribute__((noreturn));
#ifdef __cplusplus
}
#endif
`,
 'new':`#pragma once
#include <stddef.h>
namespace std {struct nothrow_t {explicit nothrow_t()=default;};extern const nothrow_t nothrow;enum class align_val_t:size_t {};}
void *operator new(size_t);void *operator new[](size_t);
void *operator new(size_t,const std::nothrow_t&) noexcept;void *operator new[](size_t,const std::nothrow_t&) noexcept;
void *operator new(size_t,std::align_val_t);void *operator new[](size_t,std::align_val_t);
void *operator new(size_t,std::align_val_t,const std::nothrow_t&) noexcept;void *operator new[](size_t,std::align_val_t,const std::nothrow_t&) noexcept;
void operator delete(void*) noexcept;void operator delete[](void*) noexcept;
void operator delete(void*,size_t) noexcept;void operator delete[](void*,size_t) noexcept;
void operator delete(void*,const std::nothrow_t&) noexcept;void operator delete[](void*,const std::nothrow_t&) noexcept;
void operator delete(void*,std::align_val_t) noexcept;void operator delete[](void*,std::align_val_t) noexcept;
void operator delete(void*,size_t,std::align_val_t) noexcept;void operator delete[](void*,size_t,std::align_val_t) noexcept;
void operator delete(void*,std::align_val_t,const std::nothrow_t&) noexcept;void operator delete[](void*,std::align_val_t,const std::nothrow_t&) noexcept;
inline void *operator new(size_t,void*p) noexcept{return p;}inline void *operator new[](size_t,void*p) noexcept{return p;}
inline void operator delete(void*,void*) noexcept{}inline void operator delete[](void*,void*) noexcept{}
`,
 'cstddef':'#pragma once\n#include <stddef.h>\nnamespace std {using ::size_t;using ::ptrdiff_t;using ::max_align_t;using nullptr_t=decltype(nullptr);}\n',
 'cstdint':'#pragma once\n#include <stdint.h>\nnamespace std {using ::int8_t;using ::uint8_t;using ::int16_t;using ::uint16_t;using ::int32_t;using ::uint32_t;using ::int64_t;using ::uint64_t;}\n',
 'cstdio':'#pragma once\n#include <stdio.h>\nnamespace std {using ::printf;using ::puts;using ::putchar;}\n',
 'cstdlib':'#pragma once\n#include <stdlib.h>\nnamespace std {using ::malloc;using ::free;using ::calloc;using ::realloc;using ::abort;using ::atexit;}\n',
 'string.h':`#pragma once
#include <stddef.h>
#ifdef __cplusplus
extern "C" {
#endif
void *memcpy(void*,const void*,size_t);void *memset(void*,int,size_t);
#ifdef __cplusplus
}
#endif
`,
 'cstring':'#pragma once\n#include <string.h>\nnamespace std {using ::memcpy;using ::memset;}\n'
};
export function cppHeap(b){return `#include <stdlib.h>
#include <string.h>
extern unsigned _ebss;
typedef struct Block {unsigned capacity;struct Block*next;unsigned used;unsigned tag;} Block;
static Block *head;
static unsigned limit(void){return 0x20000000u+${b.ram}-1024;}
static void initialize(void){if(head)return;unsigned start=((unsigned)&_ebss+7)&~7u;if(start+sizeof(Block)>limit())return;head=(Block*)start;head->capacity=limit()-start-sizeof(Block);head->next=0;head->used=0;head->tag=0xcf551234;}
static Block *find(void*p){for(Block*b=head;b;b=b->next)if((void*)(b+1)==p)return b;return 0;}
void *malloc(size_t n){if(!n)n=1;if(n>limit()-0x20000000u-7)return 0;n=(n+7)&~7u;initialize();for(Block*b=head;b;b=b->next)if(!b->used&&b->capacity>=n){if(b->capacity>=n+sizeof(Block)+8){Block*split=(Block*)((char*)(b+1)+n);split->capacity=b->capacity-n-sizeof(Block);split->next=b->next;split->used=0;split->tag=0xcf551234;b->next=split;b->capacity=n;}b->used=1;return b+1;}return 0;}
void free(void*p){if(!p)return;Block*b=find(p);if(!b||!b->used)return;b->used=0;for(b=head;b&&b->next;)if(!b->used&&!b->next->used){b->capacity+=sizeof(Block)+b->next->capacity;b->next=b->next->next;}else b=b->next;}
void *calloc(size_t n,size_t size){if(n&&size>(limit()-0x20000000u)/n)return 0;unsigned bytes=n*size;void*p=malloc(bytes);if(p)memset(p,0,bytes);return p;}
void *realloc(void*p,size_t n){if(!p)return malloc(n);if(!n){free(p);return 0;}Block*b=find(p);if(!b||!b->used)return 0;if(n<=b->capacity)return p;void*next=malloc(n);if(next){memcpy(next,p,b->capacity);free(p);}return next;}
void *cf_aligned_allocate(unsigned align,unsigned n){if(align<8)align=8;if(align&(align-1)||align>limit()-0x20000000u-8||n>limit()-0x20000000u-align-8)return 0;void*base=malloc(n+align+8);if(!base)return 0;unsigned value=((unsigned)base+8+align-1)&~(align-1);((void**)value)[-1]=base;return (void*)value;}
void cf_aligned_free(void*p){if(p)free(((void**)p)[-1]);}
void abort(void){__builtin_trap();for(;;){}}
void __aeabi_memclr(void*p,unsigned n){memset(p,0,n);}void __aeabi_memclr4(void*p,unsigned n){memset(p,0,n);}void __aeabi_memclr8(void*p,unsigned n){memset(p,0,n);}
void __aeabi_memcpy(void*p,const void*s,unsigned n){memcpy(p,s,n);}void __aeabi_memcpy4(void*p,const void*s,unsigned n){memcpy(p,s,n);}void __aeabi_memcpy8(void*p,const void*s,unsigned n){memcpy(p,s,n);}
void __aeabi_memset(void*p,unsigned n,int value){memset(p,value,n);}void __aeabi_memset4(void*p,unsigned n,int value){memset(p,value,n);}void __aeabi_memset8(void*p,unsigned n,int value){memset(p,value,n);}
void __aeabi_memmove(void*p,const void*s,unsigned n){unsigned char*d=p;const unsigned char*a=s;if(d<a)while(n--)*d++=*a++;else{d+=n;a+=n;while(n--)*--d=*--a;}}
`;}
export const CPP_RUNTIME=`#include <new>
#include <stdlib.h>
extern "C" void *cf_aligned_allocate(unsigned,unsigned);extern "C" void cf_aligned_free(void*);
namespace std {const nothrow_t nothrow;}
static void *allocate(size_t n){void*p=malloc(n);if(!p)abort();return p;}
static void *aligned(size_t n,std::align_val_t a){void*p=cf_aligned_allocate((unsigned)a,n);if(!p)abort();return p;}
void *operator new(size_t n){return allocate(n);}void *operator new[](size_t n){return allocate(n);}
void *operator new(size_t n,const std::nothrow_t&) noexcept{return malloc(n);}void *operator new[](size_t n,const std::nothrow_t&) noexcept{return malloc(n);}
void *operator new(size_t n,std::align_val_t a){return aligned(n,a);}void *operator new[](size_t n,std::align_val_t a){return aligned(n,a);}
void *operator new(size_t n,std::align_val_t a,const std::nothrow_t&) noexcept{return cf_aligned_allocate((unsigned)a,n);}void *operator new[](size_t n,std::align_val_t a,const std::nothrow_t&) noexcept{return cf_aligned_allocate((unsigned)a,n);}
void operator delete(void*p) noexcept{free(p);}void operator delete[](void*p) noexcept{free(p);}
void operator delete(void*p,size_t) noexcept{free(p);}void operator delete[](void*p,size_t) noexcept{free(p);}
void operator delete(void*p,const std::nothrow_t&) noexcept{free(p);}void operator delete[](void*p,const std::nothrow_t&) noexcept{free(p);}
void operator delete(void*p,std::align_val_t) noexcept{cf_aligned_free(p);}void operator delete[](void*p,std::align_val_t) noexcept{cf_aligned_free(p);}
void operator delete(void*p,size_t,std::align_val_t) noexcept{cf_aligned_free(p);}void operator delete[](void*p,size_t,std::align_val_t) noexcept{cf_aligned_free(p);}
void operator delete(void*p,std::align_val_t,const std::nothrow_t&) noexcept{cf_aligned_free(p);}void operator delete[](void*p,std::align_val_t,const std::nothrow_t&) noexcept{cf_aligned_free(p);}
extern "C" {
void *__dso_handle;
struct Exit {void(*f)(void*);void*arg;void*dso;void(*plain)(void);};
static Exit exits[32];static unsigned exit_count;
int __cxa_atexit(void(*f)(void*),void*arg,void*dso){if(exit_count>=32)return -1;exits[exit_count++]={f,arg,dso,nullptr};return 0;}
int __aeabi_atexit(void*arg,void(*f)(void*),void*dso){return __cxa_atexit(f,arg,dso);}
int atexit(void(*f)(void)){if(exit_count>=32)return -1;exits[exit_count++]={nullptr,nullptr,nullptr,f};return 0;}
void __cxa_finalize(void*dso){for(unsigned i=exit_count;i;i--){Exit&e=exits[i-1];if(!dso||e.dso==dso){auto f=e.f;auto plain=e.plain;auto arg=e.arg;e.f=nullptr;e.plain=nullptr;if(f)f(arg);if(plain)plain();}}if(!dso)exit_count=0;}
void cf_cpp_fini(void){__cxa_finalize(nullptr);}
void __cxa_pure_virtual(void){abort();}void __cxa_deleted_virtual(void){abort();}void __cxa_throw_bad_array_new_length(void){abort();}
}
`;
