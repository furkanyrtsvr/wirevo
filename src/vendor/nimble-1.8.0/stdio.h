#pragma once
#include <stddef.h>
#include <stdarg.h>
int snprintf(char*,size_t,const char*,...);int sprintf(char*,const char*,...);int vsnprintf(char*,size_t,const char*,va_list);int printf(const char*,...);int puts(const char*);
